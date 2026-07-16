import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import bcrypt from "bcryptjs";
import { cars } from "@/data/cars";

/**
 * GET /api/seed
 * One-time seed: inserts the 12 static cars + a default admin user into MongoDB.
 */
export async function GET(request: NextRequest) {
  try {
    // In production, require a query parameter matching SEED_SECRET env var
    if (process.env.NODE_ENV === "production") {
      const { searchParams } = new URL(request.url);
      const secret = searchParams.get("secret");
      const seedSecret = process.env.SEED_SECRET;

      if (!seedSecret || secret !== seedSecret) {
        return NextResponse.json(
          { error: "Forbidden: Seeding is locked in production unless verified by secret parameter" },
          { status: 403 }
        );
      }
    }

    const db = await getDb();

    // ── Seed Cars ──
    const carsCollection = db.collection("cars");
    const existingCount = await carsCollection.countDocuments();

    let carsInserted = 0;
    if (existingCount === 0) {
      const docs = cars.map((car) => ({
        ...car,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));
      const result = await carsCollection.insertMany(docs);
      carsInserted = result.insertedCount;

      // Create a unique index on slug
      await carsCollection.createIndex({ slug: 1 }, { unique: true });
    }

    // ── Seed Admin User ──
    const usersCollection = db.collection("users");
    const existingAdmin = await usersCollection.findOne({
      email: "admin@keralacabs.com",
    });

    let adminCreated = false;
    const defaultPassword = "Admin@123";

    if (!existingAdmin) {
      const passwordHash = await bcrypt.hash(defaultPassword, 12);
      await usersCollection.insertOne({
        email: "admin@keralacabs.com",
        passwordHash,
        role: "admin",
        createdAt: new Date(),
      });
      adminCreated = true;
    }

    return NextResponse.json({
      success: true,
      carsInserted,
      carsSkipped: existingCount > 0 ? `${existingCount} cars already exist` : null,
      adminCreated,
      credentials: adminCreated
        ? {
            email: "admin@keralacabs.com",
            password: defaultPassword,
            note: "Change this password immediately after first login!",
          }
        : "Admin already exists",
    });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json(
      { error: "Seed failed", details: String(error) },
      { status: 500 }
    );
  }
}
