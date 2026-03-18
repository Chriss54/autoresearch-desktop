import "./globals.css";

export const metadata = {
  title: "AutoResearch Command Center",
  description: "Easy-access command center for autonomous AI research — powered by Karpathy's autoresearch, optimized for Apple Silicon.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="de">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#0d1117" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
