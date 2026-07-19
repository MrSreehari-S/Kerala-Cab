import { unstable_cache } from "next/cache";
import { getDb } from "@/lib/mongodb";
import type { WithId, Document } from "mongodb";
import type { Car } from "@/data/cars";

export interface FetchCarsResult {
  cars: Car[];
  dbError: boolean;
}

/**
 * Canonical BSON document → plain `Car` object serializer.
 *
 * Single source of truth for field mapping. Every fetcher in this codebase
 * calls this function instead of duplicating the inline `.map()` block.
 * Adding a new field to the `Car` shape requires changing only this function.
 */
export function serializeCarDoc(doc: WithId<Document>): Car {
  return {
    id: doc._id.toString(),
    name: doc.name,
    slug: doc.slug,
    category: doc.category,
    tagline: doc.tagline,
    pricePerDay: doc.pricePerDay,
    transmission: doc.transmission,
    fuelType: doc.fuelType,
    seats: doc.seats,
    images: doc.images ?? [],
    isChauffeurOnly: doc.isChauffeurOnly,
    features: doc.features,
  } as Car;
}

/**
 * Cached car inventory fetcher (public pages).
 * Uses Next.js unstable_cache with tag "cars" and 1 hour (3600s) revalidation window.
 * Serves zero-latency cached data to public visitors.
 * Admin mutations (POST/PUT/DELETE) purge this cache instantly via revalidateTag("cars").
 */
export const getCarsCached = unstable_cache(
  async (): Promise<FetchCarsResult> => {
    try {
      const db = await getDb();
      const docs = await db
        .collection("cars")
        .find({})
        .sort({ createdAt: -1 })
        .toArray();

      return { cars: docs.map(serializeCarDoc), dbError: false };
    } catch (error) {
      console.error("[getCarsCached] Failed to fetch cars from MongoDB:", error);
      return { cars: [], dbError: true };
    }
  },
  ["cars-list-cache"],
  {
    tags: ["cars"],
    revalidate: 3600, // Background revalidation window (1 hour)
  }
);

/**
 * Uncached car inventory fetcher (admin dashboard only).
 *
 * Bypasses the ISR cache so the admin always sees the latest data immediately
 * after a mutation, without waiting for revalidation.
 */
export async function getAdminCarsDirect(): Promise<FetchCarsResult> {
  try {
    const db = await getDb();
    const docs = await db
      .collection("cars")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    return { cars: docs.map(serializeCarDoc), dbError: false };
  } catch (error) {
    console.error(
      "[getAdminCarsDirect] Failed to fetch cars from MongoDB:",
      error
    );
    return { cars: [], dbError: true };
  }
}
