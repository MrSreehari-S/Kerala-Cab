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

/* ── Server-Side Paginated Fetcher ─────────────────────────────────────────── */

export interface PaginatedCarsParams {
  page?: number;
  limit?: number;
  category?: string;
  sort?: string;
  q?: string;
}

export interface PaginatedCarsResult {
  cars: Car[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  dbError: boolean;
}

/**
 * Server-side paginated car fetcher.
 * Pushes filtering, sorting, and pagination into MongoDB queries
 * so only the needed slice of data is transferred.
 */
export async function getCarsPaginated(
  params: PaginatedCarsParams = {}
): Promise<PaginatedCarsResult> {
  const {
    page = 1,
    limit = 8,
    category = "all",
    sort = "price-asc",
    q = "",
  } = params;

  const safePage = Math.max(1, page);
  const safeLimit = Math.min(Math.max(1, limit), 50);

  try {
    const db = await getDb();
    const collection = db.collection("cars");

    // Build filter
    const filter: Record<string, unknown> = {};

    if (category && category !== "all") {
      filter.category = category;
    }

    if (q.trim()) {
      // Case-insensitive regex search across name, tagline, category
      const escapedQ = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      filter.$or = [
        { name: { $regex: escapedQ, $options: "i" } },
        { tagline: { $regex: escapedQ, $options: "i" } },
        { category: { $regex: escapedQ, $options: "i" } },
        { transmission: { $regex: escapedQ, $options: "i" } },
        { fuelType: { $regex: escapedQ, $options: "i" } },
      ];
    }

    // Build sort
    let sortSpec: Record<string, 1 | -1>;
    switch (sort) {
      case "price-desc":
        sortSpec = { pricePerDay: -1 };
        break;
      case "name-asc":
        sortSpec = { name: 1 };
        break;
      case "seats-desc":
        sortSpec = { seats: -1 };
        break;
      case "price-asc":
      default:
        sortSpec = { pricePerDay: 1 };
        break;
    }

    // Run count + paginated find in parallel
    const skip = (safePage - 1) * safeLimit;

    const [total, docs] = await Promise.all([
      collection.countDocuments(filter),
      collection
        .find(filter)
        .sort(sortSpec)
        .skip(skip)
        .limit(safeLimit)
        .toArray(),
    ]);

    const totalPages = Math.ceil(total / safeLimit);

    return {
      cars: docs.map(serializeCarDoc),
      total,
      page: safePage,
      limit: safeLimit,
      totalPages,
      dbError: false,
    };
  } catch (error) {
    console.error("[getCarsPaginated] Failed:", error);
    return {
      cars: [],
      total: 0,
      page: safePage,
      limit: safeLimit,
      totalPages: 0,
      dbError: true,
    };
  }
}

