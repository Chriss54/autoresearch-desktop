"""
Modal Cloud Training App for AutoResearch.
Runs GPU-accelerated training on Modal's serverless infrastructure.

Usage (from CLI):
    cd engine && uv run modal run modal_train.py --workflow-json '{"name":"test"}'

Usage (programmatic, from Node.js subprocess):
    uv run modal run modal_train.py --workflow-json '...' --callback-url 'http://...'

This script defines a Modal App that:
1. Spins up a GPU container (T4 by default)
2. Downloads data + tokenizer (cached in Modal Volume)
3. Runs training for the configured time budget
4. Emits JSON results to stdout (captured by Node.js parent)
"""

import json
import sys

import modal

# ---------------------------------------------------------------------------
# Modal App Definition
# ---------------------------------------------------------------------------

app = modal.App("autoresearch-training")

# Container image with PyTorch + dependencies
training_image = (
    modal.Image.debian_slim(python_version="3.11")
    .pip_install(
        "torch==2.6.0",
        "numpy>=1.26",
        "pyarrow>=14.0",
        "tiktoken>=0.6",
        "requests>=2.31",
        "rustbpe>=0.1",
    )
)

# Persistent volume for data + tokenizer cache
vol = modal.Volume.from_name("autoresearch-data", create_if_missing=True)

# ---------------------------------------------------------------------------
# Training Function
# ---------------------------------------------------------------------------

@app.function(
    image=training_image,
    gpu="T4",
    timeout=7200,  # 2h max
    volumes={"/cache/autoresearch": vol},
)
def run_cloud_training(workflow_json: str = "{}") -> str:
    """
    Run training on Modal GPU.
    Returns JSON string with results.
    Uses PyTorch native attention (no FA3 dependency).
    """
    import gc
    import hashlib
    import math
    import os
    import time
    from dataclasses import dataclass

    import torch
    import torch.nn as nn
    import torch.nn.functional as F

    # Override cache dir to use Modal volume
    os.environ["HF_HUB_DISABLE_PROGRESS_BARS"] = "1"
    CACHE_DIR = "/cache/autoresearch"
    DATA_DIR = os.path.join(CACHE_DIR, "data")
    TOKENIZER_DIR = os.path.join(CACHE_DIR, "tokenizer")

    # Parse workflow config
    workflow = json.loads(workflow_json)
    workflow_name = workflow.get("name", "Cloud Training")
    time_budget_minutes = workflow.get("timeBudget", 5)
    TIME_BUDGET = time_budget_minutes * 60  # seconds
    MAX_SEQ_LEN = 2048

    events = []  # Collect events to return

    def emit(event):
        events.append(event)
        print(json.dumps(event), flush=True)

    def emit_log(text, log_type="info"):
        emit({"type": "log", "text": text, "logType": log_type})

    emit_log(f"🚀 Modal Cloud Training gestartet — {workflow_name}")
    emit_log(f"☁️ GPU: {torch.cuda.get_device_name(0)}")
    emit_log(f"⏱️ Time budget: {time_budget_minutes} Minuten")

    # -----------------------------------------------------------------------
    # Data Preparation (download if needed)
    # -----------------------------------------------------------------------
    import pickle
    import pyarrow.parquet as pq
    import requests as req
    import rustbpe
    import tiktoken

    BASE_URL = "https://huggingface.co/datasets/karpathy/climbmix-400b-shuffle/resolve/main"
    MAX_SHARD = 6542
    VAL_SHARD = MAX_SHARD
    VAL_FILENAME = f"shard_{VAL_SHARD:05d}.parquet"
    VOCAB_SIZE = 8192
    EVAL_TOKENS = 40 * 524288

    SPLIT_PATTERN = r"""'(?i:[sdmt]|ll|ve|re)|[^\r\n\p{L}\p{N}]?+\p{L}+|\p{N}{1,2}| ?[^\s\p{L}\p{N}]++[\r\n]*|\s*[\r\n]|\s+(?!\S)|\s+"""
    SPECIAL_TOKENS = [f"<|reserved_{i}|>" for i in range(4)]
    BOS_TOKEN = "<|reserved_0|>"

    os.makedirs(DATA_DIR, exist_ok=True)
    os.makedirs(TOKENIZER_DIR, exist_ok=True)

    # Download minimal shards (2 train + 1 val)
    def download_shard(index):
        filename = f"shard_{index:05d}.parquet"
        filepath = os.path.join(DATA_DIR, filename)
        if os.path.exists(filepath):
            return True
        url = f"{BASE_URL}/{filename}"
        for attempt in range(3):
            try:
                response = req.get(url, stream=True, timeout=60)
                response.raise_for_status()
                temp = filepath + ".tmp"
                with open(temp, "wb") as f:
                    for chunk in response.iter_content(1024 * 1024):
                        if chunk:
                            f.write(chunk)
                os.rename(temp, filepath)
                return True
            except Exception as e:
                if attempt < 2:
                    time.sleep(2)
        return False

    # Download 2 train shards + val shard
    emit_log("📦 Daten werden vorbereitet...")
    for idx in [0, 1, VAL_SHARD]:
        if not download_shard(idx):
            emit_log(f"❌ Shard {idx} konnte nicht geladen werden", "error")
            return json.dumps({"error": f"Failed to download shard {idx}"})
    vol.commit()

    # Train tokenizer if needed
    tokenizer_pkl = os.path.join(TOKENIZER_DIR, "tokenizer.pkl")
    token_bytes_path = os.path.join(TOKENIZER_DIR, "token_bytes.pt")

    if not os.path.exists(tokenizer_pkl):
        emit_log("🔤 Tokenizer wird trainiert...")

        def text_iter():
            parquet_paths = sorted(
                os.path.join(DATA_DIR, f)
                for f in os.listdir(DATA_DIR)
                if f.endswith(".parquet") and not f.endswith(VAL_FILENAME)
            )
            nchars = 0
            for fp in parquet_paths:
                pf = pq.ParquetFile(fp)
                for rg_idx in range(pf.num_row_groups):
                    rg = pf.read_row_group(rg_idx)
                    for text in rg.column("text").to_pylist():
                        doc = text[:10000] if len(text) > 10000 else text
                        nchars += len(doc)
                        yield doc
                        if nchars >= 500_000_000:
                            return

        tok = rustbpe.Tokenizer()
        tok.train_from_iterator(text_iter(), VOCAB_SIZE - len(SPECIAL_TOKENS), pattern=SPLIT_PATTERN)
        pattern = tok.get_pattern()
        mergeable = {bytes(k): v for k, v in tok.get_mergeable_ranks()}
        offset = len(mergeable)
        specials = {name: offset + i for i, name in enumerate(SPECIAL_TOKENS)}
        enc = tiktoken.Encoding(name="rustbpe", pat_str=pattern, mergeable_ranks=mergeable, special_tokens=specials)

        with open(tokenizer_pkl, "wb") as f:
            pickle.dump(enc, f)

        # token_bytes lookup
        special_set = set(SPECIAL_TOKENS)
        tb = []
        for tid in range(enc.n_vocab):
            s = enc.decode([tid])
            tb.append(0 if s in special_set else len(s.encode("utf-8")))
        torch.save(torch.tensor(tb, dtype=torch.int32), token_bytes_path)
        vol.commit()
        emit_log(f"✅ Tokenizer trainiert (vocab={enc.n_vocab})")
    else:
        with open(tokenizer_pkl, "rb") as f:
            enc = pickle.load(f)
        emit_log(f"✅ Tokenizer geladen (vocab={enc.n_vocab})")

    vocab_size = enc.n_vocab
    bos_token_id = enc.encode_single_token(BOS_TOKEN)

    # -----------------------------------------------------------------------
    # Dataloader
    # -----------------------------------------------------------------------
    def list_parquets():
        return sorted(
            os.path.join(DATA_DIR, f)
            for f in os.listdir(DATA_DIR)
            if f.endswith(".parquet") and not f.endswith(".tmp")
        )

    def doc_batches(split, batch_size=64):
        paths = list_parquets()
        val_path = os.path.join(DATA_DIR, VAL_FILENAME)
        if split == "train":
            paths = [p for p in paths if p != val_path]
        else:
            paths = [val_path]
        epoch = 1
        while True:
            for fp in paths:
                pf = pq.ParquetFile(fp)
                for rg in range(pf.num_row_groups):
                    rows = pf.read_row_group(rg).column("text").to_pylist()
                    for i in range(0, len(rows), batch_size):
                        yield rows[i:i+batch_size], epoch
            epoch += 1

    def make_dataloader(batch_size, seq_len, split):
        cap = seq_len + 1
        batches = doc_batches(split)
        buf = []
        epoch = 1

        def refill():
            nonlocal epoch
            texts, epoch = next(batches)
            for t in texts:
                ids = enc.encode_ordinary(t)
                ids.insert(0, bos_token_id)
                buf.append(ids)

        device = torch.device("cuda")
        while True:
            rows = torch.empty((batch_size, cap), dtype=torch.long, device=device)
            for row_idx in range(batch_size):
                pos = 0
                while pos < cap:
                    while len(buf) < 100:
                        refill()
                    remaining = cap - pos
                    best_i, best_l = -1, 0
                    for i, doc in enumerate(buf):
                        dl = len(doc)
                        if dl <= remaining and dl > best_l:
                            best_i, best_l = i, dl
                    if best_i >= 0:
                        doc = buf.pop(best_i)
                        rows[row_idx, pos:pos+len(doc)] = torch.tensor(doc, dtype=torch.long, device=device)
                        pos += len(doc)
                    else:
                        si = min(range(len(buf)), key=lambda i: len(buf[i]))
                        doc = buf.pop(si)
                        rows[row_idx, pos:pos+remaining] = torch.tensor(doc[:remaining], dtype=torch.long, device=device)
                        pos += remaining
            yield rows[:, :-1], rows[:, 1:], epoch

    # -----------------------------------------------------------------------
    # GPT Model (PyTorch, native attention — no FA3)
    # -----------------------------------------------------------------------
    @dataclass
    class GPTConfig:
        sequence_len: int = 2048
        vocab_size: int = 32768
        n_layer: int = 12
        n_head: int = 6
        n_kv_head: int = 6
        n_embd: int = 768
        window_pattern: str = "SSSL"

    def norm(x):
        return F.rms_norm(x, (x.size(-1),))

    def has_ve(layer_idx, n_layer):
        return layer_idx % 2 == (n_layer - 1) % 2

    class CausalSelfAttention(nn.Module):
        def __init__(self, config, layer_idx):
            super().__init__()
            self.n_head = config.n_head
            self.n_kv_head = config.n_kv_head
            self.n_embd = config.n_embd
            self.head_dim = self.n_embd // self.n_head
            self.c_q = nn.Linear(self.n_embd, self.n_head * self.head_dim, bias=False)
            self.c_k = nn.Linear(self.n_embd, self.n_kv_head * self.head_dim, bias=False)
            self.c_v = nn.Linear(self.n_embd, self.n_kv_head * self.head_dim, bias=False)
            self.c_proj = nn.Linear(self.n_embd, self.n_embd, bias=False)
            self.ve_gate_channels = 32
            self.ve_gate = (
                nn.Linear(self.ve_gate_channels, self.n_kv_head, bias=False)
                if has_ve(layer_idx, config.n_layer)
                else None
            )

        def forward(self, x, ve):
            B, T, C = x.size()
            q = self.c_q(x).view(B, T, self.n_head, self.head_dim).transpose(1, 2)
            k = self.c_k(x).view(B, T, self.n_kv_head, self.head_dim).transpose(1, 2)
            v = self.c_v(x).view(B, T, self.n_kv_head, self.head_dim).transpose(1, 2)

            if ve is not None and self.ve_gate is not None:
                ve = ve.view(B, T, self.n_kv_head, self.head_dim).transpose(1, 2)
                gate = 2 * torch.sigmoid(self.ve_gate(x[..., :self.ve_gate_channels]))
                v = v + gate.unsqueeze(-1).transpose(1, 2).transpose(1, 2) * ve

            # Apply RMS norm to q, k
            q = norm(q)
            k = norm(k)

            # Native scaled dot product attention (works on all GPUs)
            y = F.scaled_dot_product_attention(q, k, v, is_causal=True)
            y = y.transpose(1, 2).contiguous().view(B, T, -1)
            return self.c_proj(y)

    class MLP(nn.Module):
        def __init__(self, config):
            super().__init__()
            self.c_fc = nn.Linear(config.n_embd, 4 * config.n_embd, bias=False)
            self.c_proj = nn.Linear(4 * config.n_embd, config.n_embd, bias=False)

        def forward(self, x):
            x = self.c_fc(x)
            x = F.relu(x).square()
            return self.c_proj(x)

    class Block(nn.Module):
        def __init__(self, config, layer_idx):
            super().__init__()
            self.attn = CausalSelfAttention(config, layer_idx)
            self.mlp = MLP(config)

        def forward(self, x, ve):
            x = x + self.attn(norm(x), ve)
            x = x + self.mlp(norm(x))
            return x

    class GPT(nn.Module):
        def __init__(self, config):
            super().__init__()
            self.config = config
            self.wte = nn.Embedding(config.vocab_size, config.n_embd)
            self.blocks = nn.ModuleList([Block(config, i) for i in range(config.n_layer)])
            self.lm_head = nn.Linear(config.n_embd, config.vocab_size, bias=False)
            self.resid_lambdas = nn.Parameter(torch.ones(config.n_layer))
            self.x0_lambdas = nn.Parameter(torch.zeros(config.n_layer))
            head_dim = config.n_embd // config.n_head
            kv_dim = config.n_kv_head * head_dim
            self.value_embeds = nn.ModuleDict({
                str(i): nn.Embedding(config.vocab_size, kv_dim)
                for i in range(config.n_layer) if has_ve(i, config.n_layer)
            })

        @torch.no_grad()
        def init_weights(self):
            n = self.config.n_embd
            s = 3**0.5 * n**-0.5
            nn.init.normal_(self.wte.weight, 0, 1)
            nn.init.normal_(self.lm_head.weight, 0, 0.001)
            for b in self.blocks:
                nn.init.uniform_(b.attn.c_q.weight, -s, s)
                nn.init.uniform_(b.attn.c_k.weight, -s, s)
                nn.init.uniform_(b.attn.c_v.weight, -s, s)
                nn.init.zeros_(b.attn.c_proj.weight)
                nn.init.uniform_(b.mlp.c_fc.weight, -s, s)
                nn.init.zeros_(b.mlp.c_proj.weight)
                if b.attn.ve_gate is not None:
                    nn.init.zeros_(b.attn.ve_gate.weight)
            self.resid_lambdas.fill_(1.0)
            self.x0_lambdas.fill_(0.1)
            for ve in self.value_embeds.values():
                nn.init.uniform_(ve.weight, -s, s)
            self.wte.to(dtype=torch.bfloat16)
            for ve in self.value_embeds.values():
                ve.to(dtype=torch.bfloat16)

        def forward(self, idx, targets=None, reduction="mean"):
            x = self.wte(idx)
            x = norm(x)
            x0 = x
            for i, block in enumerate(self.blocks):
                x = self.resid_lambdas[i] * x + self.x0_lambdas[i] * x0
                ve = self.value_embeds[str(i)](idx) if str(i) in self.value_embeds else None
                x = block(x, ve)
            x = norm(x)
            logits = self.lm_head(x).float()
            logits = 15.0 * torch.tanh(logits / 15.0)
            if targets is None:
                return logits
            loss = F.cross_entropy(logits.view(-1, logits.size(-1)), targets.view(-1), ignore_index=-1, reduction=reduction)
            return loss

    # -----------------------------------------------------------------------
    # Training Loop
    # -----------------------------------------------------------------------

    ASPECT_RATIO = 64
    HEAD_DIM = 128
    DEPTH = 4  # Smaller model for T4 (16GB VRAM)
    DEVICE_BATCH_SIZE = 32
    TOTAL_BATCH_SIZE = 2**16
    WARMDOWN_RATIO = 0.5

    torch.manual_seed(42)
    torch.cuda.manual_seed(42)
    device = torch.device("cuda")

    model_dim = ((DEPTH * ASPECT_RATIO + HEAD_DIM - 1) // HEAD_DIM) * HEAD_DIM
    config = GPTConfig(
        sequence_len=MAX_SEQ_LEN, vocab_size=vocab_size,
        n_layer=DEPTH, n_head=model_dim // HEAD_DIM, n_kv_head=model_dim // HEAD_DIM,
        n_embd=model_dim,
    )

    model = GPT(config).to(device)
    model.init_weights()
    num_params = sum(p.numel() for p in model.parameters())

    tokens_per_fwdbwd = DEVICE_BATCH_SIZE * MAX_SEQ_LEN
    grad_accum_steps = max(1, TOTAL_BATCH_SIZE // tokens_per_fwdbwd)

    optimizer = torch.optim.AdamW(model.parameters(), lr=0.004, betas=(0.8, 0.95), eps=1e-10, weight_decay=0.0)
    autocast_ctx = torch.amp.autocast(device_type="cuda", dtype=torch.bfloat16)

    emit_log(f"🧠 Modell: {num_params/1e6:.1f}M Parameter, Tiefe={DEPTH}, dim={model_dim}")

    train_loader = make_dataloader(DEVICE_BATCH_SIZE, MAX_SEQ_LEN, "train")
    x, y, epoch = next(train_loader)

    best_bpb = float("inf")
    total_training_time = 0.0
    step = 0
    experiment_num = 1

    # Emit baseline result
    commit_hash = hashlib.sha256(str(time.time()).encode()).hexdigest()[:7]

    while True:
        t0 = time.time()

        for _ in range(grad_accum_steps):
            with autocast_ctx:
                loss = model(x, y)
            loss = loss / grad_accum_steps
            loss.backward()
            x, y, epoch = next(train_loader)

        # LR schedule
        progress = min(total_training_time / TIME_BUDGET, 1.0) if TIME_BUDGET > 0 else 1.0
        lrm = 1.0
        if progress >= 1.0 - WARMDOWN_RATIO:
            cooldown = (1.0 - progress) / WARMDOWN_RATIO
            lrm = max(cooldown, 0.0)
        for g in optimizer.param_groups:
            g["lr"] = 0.004 * lrm

        optimizer.step()
        optimizer.zero_grad(set_to_none=True)

        torch.cuda.synchronize()
        dt = time.time() - t0
        if step >= 1:
            total_training_time += dt

        train_loss_f = loss.item() * grad_accum_steps
        if math.isnan(train_loss_f) or train_loss_f > 100:
            emit_log("❌ Training loss exploded", "error")
            break

        # Progress every 20 steps
        if step % 20 == 0:
            pct = 100 * progress
            emit({"type": "progress", "step": step, "progress": round(pct, 1),
                  "loss": round(train_loss_f, 6), "remaining": round(max(0, TIME_BUDGET - total_training_time), 0)})

        if step == 0:
            gc.collect()

        step += 1
        if step >= 1 and total_training_time >= TIME_BUDGET:
            break

    # Eval
    emit_log("📊 Evaluation läuft...")
    model.eval()
    token_bytes = torch.load(token_bytes_path, map_location=device)
    val_loader = make_dataloader(DEVICE_BATCH_SIZE, MAX_SEQ_LEN, "val")
    eval_steps = min(20, EVAL_TOKENS // (DEVICE_BATCH_SIZE * MAX_SEQ_LEN))
    total_nats, total_bytes = 0.0, 0
    with torch.no_grad():
        for _ in range(eval_steps):
            xv, yv, _ = next(val_loader)
            with autocast_ctx:
                loss_flat = model(xv, yv, reduction="none").view(-1)
            y_flat = yv.view(-1)
            nbytes = token_bytes[y_flat]
            mask = nbytes > 0
            total_nats += (loss_flat * mask).sum().item()
            total_bytes += nbytes.sum().item()
    val_bpb = total_nats / (math.log(2) * max(total_bytes, 1))

    peak_vram_mb = torch.cuda.max_memory_allocated() / 1024 / 1024

    # Emit result
    result = {
        "type": "experiment",
        "num": 1,
        "commit": hashlib.sha256(str(time.time()).encode()).hexdigest()[:7],
        "change": f"Cloud Training ({workflow_name})",
        "valBpb": round(val_bpb, 6),
        "peakMemory": round(peak_vram_mb / 1024, 1),
        "status": "keep",
        "isRecord": True,
    }
    emit(result)
    emit_log(f"✅ Training fertig! val_bpb: {val_bpb:.6f}, {step} Steps, {total_training_time:.0f}s")

    return json.dumps({"events": events, "valBpb": val_bpb})


# ---------------------------------------------------------------------------
# CLI Entry Point
# ---------------------------------------------------------------------------

@app.local_entrypoint()
def main(workflow_json: str = "{}", callback_url: str = ""):
    """Run training on Modal cloud GPU."""
    result = run_cloud_training.remote(workflow_json)
    # Print result for Node.js subprocess to capture
    print(result)
