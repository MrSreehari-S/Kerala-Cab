import type { Metadata } from "next";
import { getDb } from "@/lib/mongodb";
import type { Car } from "@/data/cars";
import { FleetPageClient } from "./fleet-client";

export const metadata: Metadata = {
  title: "Browse Our Fleet — KeralaCabs Premium Car Rentals",
  description:
    "Explore our complete collection of luxury sedans, powerful SUVs, elegant wedding cars, and premium self-drive vehicles available across Kerala.",
};

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
    console.error("[fleet] Failed to fetch cars from MongoDB:", error);
    return { cars: [], dbError: true };
  }
}

export default async function FleetPage() {
  const { cars, dbError } = await getCars();
  return <FleetPageClient cars={cars} dbError={dbError} />;
}
