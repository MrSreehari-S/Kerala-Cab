import { MongoClient, type Db } from "mongodb";

// ── Connection cache ──────────────────────────────────────────────────────────
// We cache the client promise on the global object so hot-reload in dev
// doesn't open new connections every time a module re-evaluates.

let clientPromise: Promise<MongoClient> | null = null;
let indexesEnsured = false;

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
        // If an index with matching keys already exists under a slightly different spec, ignore conflict
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

export { getClientPromise as clientPromise };

/**
 * Returns the connected Db instance and ensures indexes exist.
 */
export async function getDb(): Promise<Db> {
  const dbName = process.env.MONGODB_DB || "keralacabs";
  const client = await getClientPromise();
  const db = client.db(dbName);

  // Asynchronously ensure indexes exist without blocking caller
  ensureIndexes(db).catch(() => {});

  return db;
}
