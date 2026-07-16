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

async function getCars(): Promise<Car[]> {
  try {
    const db = await getDb();
    const cars = await db
      .collection("cars")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    return cars.map((car) => ({
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
  } catch (error) {
    console.error("Failed to fetch cars from MongoDB:", error);
    // Fall back to static data during build or if MongoDB is unavailable
    const { cars } = await import("@/data/cars");
    return cars;
  }
}

export default async function FleetPage() {
  const cars = await getCars();

  return <FleetPageClient cars={cars} />;
}
