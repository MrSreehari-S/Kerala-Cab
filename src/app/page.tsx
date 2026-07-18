import { getDb } from "@/lib/mongodb";
import type { Car } from "@/data/cars";
import { HomeClient } from "./home-client";

export const dynamic = "force-dynamic";

interface FetchResult {
  cars: Car[];
  dbError: boolean;
}

async function getCars(): Promise<FetchResult> {
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
    console.error("[page] Failed to fetch cars from MongoDB:", error);
    return { cars: [], dbError: true };
  }
}

export default async function Home() {
  const { cars, dbError } = await getCars();
  return <HomeClient cars={cars} dbError={dbError} />;
}
