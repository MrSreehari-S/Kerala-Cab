import { unstable_cache } from "next/cache";
import { getDb } from "@/lib/mongodb";
import type { Car } from "@/data/cars";

export interface FetchCarsResult {
  cars: Car[];
  dbError: boolean;
}

/**
 * Cached car inventory fetcher.
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

      const cars = docs.map((car) => ({
        id: car._id.toString(),
        name: car.name,
        slug: car.slug,
        category: car.category,
        tagline: car.tagline,
        pricePerDay: car.pricePerDay,
        transmission: car.transmission,
        fuelType: car.fuelType,
        seats: car.seats,
        images: car.images || [],
        isChauffeurOnly: car.isChauffeurOnly,
        features: car.features,
      })) as Car[];

      return { cars, dbError: false };
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
