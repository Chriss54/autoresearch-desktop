/**
 * /api/seed — Initialize database with demo data (one-time)
 */
const db = require("../../../lib/database");

export async function POST() {
  try {
    const seeded = db.seedDemoData();
    return Response.json({
      success: true,
      message: seeded ? "Demo data seeded successfully" : "Database already contains data",
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
