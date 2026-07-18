import { NextRequest, NextResponse } from "next/server";
import { getDb, ensureIndexes, ensureSchemaValidation } from "@/lib/mongodb";
import { verifySession } from "@/lib/auth";

/**
 * GET /api/migrate — return status and instructions
 */
export async function GET() {
  return NextResponse.json({
    message: "Migration endpoint active. Use HTTP POST with an authenticated admin session to run database migration, index verification, and schema validation.",
    methodsAllowed: ["POST"],
  });
}

/**
 * POST /api/migrate — admin only.
 * 1. Clean up legacy `id` fields from existing car documents ($unset: { id: "" }).
 * 2. Idempotently create ESR-compliant compound indexes on the `cars` collection.
 * 3. Enforce BSON $jsonSchema validation rules via `collMod`.
 * 4. Return active index and schema validation status.
 */
export async function POST(request: NextRequest) {
  const session = await verifySession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const db = await getDb();
    const carsCollection = db.collection("cars");

    // 1. Unset legacy `id` field if it exists
    const unsetResult = await carsCollection.updateMany(
      { id: { $exists: true } },
      { $unset: { id: "" } }
    );

    // 2. Ensure indexes & schema validation
    await ensureIndexes(db);
    await ensureSchemaValidation(db);

    // 3. Retrieve list of active indexes for confirmation
    const activeIndexes = await carsCollection.indexes();

    return NextResponse.json({
      success: true,
      cleanedCount: unsetResult.modifiedCount,
      schemaValidationStatus: "Strict $jsonSchema validation active",
      activeIndexes: activeIndexes.map((idx) => ({
        name: idx.name,
        key: idx.key,
        unique: idx.unique || false,
      })),
      message: `Database migration complete. Cleaned ${unsetResult.modifiedCount} legacy fields, verified ${activeIndexes.length} indexes, and enforced strict schema validation.`,
    });
  } catch (error) {
    console.error("Migration error:", error);
    return NextResponse.json(
      { error: "Migration failed", details: String(error) },
      { status: 500 }
    );
  }
}
