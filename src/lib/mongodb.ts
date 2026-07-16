import { MongoClient, type Db } from "mongodb";

if (!process.env.MONGODB_URI) {
  throw new Error("Please add MONGODB_URI to your .env.local file");
}

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || "keralacabs";

const options = {};

// Cache the client promise on the global object so hot-reload in dev
// doesn't open new connections every time a module re-evaluates.
let clientPromise: Promise<MongoClient>;

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

if (process.env.NODE_ENV === "development") {
  if (!global._mongoClientPromise) {
    const client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  const client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export { clientPromise };

/** Convenience: get the connected Db instance */
export async function getDb(): Promise<Db> {
  const client = await clientPromise;
  return client.db(dbName);
}
