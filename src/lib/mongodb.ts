import { MongoClient, type Db } from "mongodb";

// ── Connection cache ──────────────────────────────────────────────────────────
// We cache the client promise on the global object so hot-reload in dev
// doesn't open new connections every time a module re-evaluates.

let clientPromise: Promise<MongoClient> | null = null;
let indexesEnsured = false;
let validationEnsured = false;

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

function getClientPromise(): Promise<MongoClient> {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error(
      "MONGODB_URI is not set. Add it to .env.local or your deployment environment."
    );
  }

  if (process.env.NODE_ENV === "development") {
    // In dev, reuse the global promise across hot-reloads.
    if (!global._mongoClientPromise) {
      const client = new MongoClient(uri);
      global._mongoClientPromise = client.connect();
    }
    return global._mongoClientPromise;
  }

  // In production, create a new promise per module instance.
  if (!clientPromise) {
    const client = new MongoClient(uri);
    clientPromise = client.connect();
  }
  return clientPromise;
}

/**
 * BSON $jsonSchema validator for the `cars` collection.
 * Enforces data integrity at the database level.
 */
export const CARS_SCHEMA_VALIDATOR = {
  $jsonSchema: {
    bsonType: "object",
    required: [
      "name",
      "slug",
      "category",
      "pricePerDay",
      "transmission",
      "fuelType",
      "seats",
    ],
    properties: {
      name: {
        bsonType: "string",
        minLength: 1,
        description: "Vehicle name (required string)",
      },
      slug: {
        bsonType: "string",
        minLength: 1,
        description: "SEO URL slug (required string)",
      },
      category: {
        enum: ["luxury", "suv", "sedan", "wedding"],
        description: "Category must be one of: luxury, suv, sedan, wedding",
      },
      tagline: { bsonType: "string", description: "Marketing tagline" },
      pricePerDay: {
        bsonType: ["double", "int", "long"],
        minimum: 0,
        description: "Daily rate must be a non-negative number",
      },
      transmission: {
        enum: ["Automatic", "Manual"],
        description: "Transmission must be Automatic or Manual",
      },
      fuelType: {
        enum: ["Petrol", "Diesel", "Hybrid", "Electric"],
        description: "Fuel type must be Petrol, Diesel, Hybrid, or Electric",
      },
      seats: {
        bsonType: ["int", "double", "long"],
        minimum: 1,
        maximum: 20,
        description: "Seat count must be between 1 and 20",
      },
      images: {
        bsonType: "array",
        items: { bsonType: "string" },
        description: "Array of image URLs",
      },
      isChauffeurOnly: {
        bsonType: "bool",
        description: "Chauffeur only flag (BSON type 'bool')",
      },
      features: {
        bsonType: "array",
        items: { bsonType: "string" },
        description: "Array of feature strings",
      },
      createdAt: {
        bsonType: ["date", "string"],
        description: "Creation timestamp",
      },
      updatedAt: {
        bsonType: ["date", "string"],
        description: "Last update timestamp",
      },
    },
  },
};

/**
 * Idempotent index initialization for the `cars` collection.
 * Creates ESR-compliant indexes to eliminate COLLSCAN and in-memory SORT stages.
 */
export async function ensureIndexes(db: Db): Promise<void> {
  if (indexesEnsured) return;
  try {
    const cars = db.collection("cars");

    const createSafely = async (
      keyPattern: Record<string, 1 | -1>,
      options?: { unique?: boolean }
    ) => {
      try {
        await cars.createIndex(keyPattern, options);
      } catch (err: unknown) {
        if (
          typeof err === "object" &&
          err !== null &&
          "code" in err &&
          err.code === 86
        ) {
          return;
        }
        throw err;
      }
    };

    await Promise.all([
      createSafely({ createdAt: -1 }),
      createSafely({ slug: 1 }, { unique: true }),
      createSafely({ category: 1, createdAt: -1 }),
    ]);

    indexesEnsured = true;
  } catch (err) {
    console.error("[mongodb] Index initialization error:", err);
  }
}

/**
 * Apply $jsonSchema validation rules to the `cars` collection.
 */
export async function ensureSchemaValidation(db: Db): Promise<void> {
  if (validationEnsured) return;
  try {
    await db.command({
      collMod: "cars",
      validator: CARS_SCHEMA_VALIDATOR,
      validationLevel: "strict",
      validationAction: "error",
    });
    validationEnsured = true;
  } catch (err) {
    console.error("[mongodb] Schema validation initialization error:", err);
  }
}

export { getClientPromise as clientPromise };

/**
 * Returns the connected Db instance and ensures indexes & validation exist.
 */
export async function getDb(): Promise<Db> {
  const dbName = process.env.MONGODB_DB || "keralacabs";
  const client = await getClientPromise();
  const db = client.db(dbName);

  // Asynchronously ensure indexes & schema validation without blocking caller
  ensureIndexes(db).catch(() => {});
  ensureSchemaValidation(db).catch(() => {});

  return db;
}
