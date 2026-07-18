import { MongoClient, type Db } from "mongodb";

// ── Connection cache ──────────────────────────────────────────────────────────
// We cache the client promise on the global object so hot-reload in dev
// doesn't open new connections every time a module re-evaluates.
// The module-level guard is intentionally ABSENT here: if MONGODB_URI is
// missing we want getDb() to throw lazily (inside the caller's try/catch)
// rather than crashing every page at import time.

let clientPromise: Promise<MongoClient> | null = null;

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

export { getClientPromise as clientPromise };

/**
 * Returns the connected Db instance.
 *
 * Throws if MONGODB_URI is not configured — callers should wrap this in a
 * try/catch and handle the failure gracefully (e.g. return { dbError: true }).
 */
export async function getDb(): Promise<Db> {
  const dbName = process.env.MONGODB_DB || "keralacabs";
  const client = await getClientPromise();
  return client.db(dbName);
}
