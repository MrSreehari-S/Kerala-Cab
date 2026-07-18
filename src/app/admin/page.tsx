import { getDb } from "@/lib/mongodb";
import { AdminDashboardClient } from "./components/admin-dashboard-client";
import type { DbCar } from "./components/fleet-table";

export const dynamic = "force-dynamic";

async function getAdminCars(): Promise<DbCar[]> {
  try {
    const db = await getDb();
    const docs = await db
      .collection("cars")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    return docs.map((car) => ({
      id: car._id.toString(),
      _id: car._id.toString(),
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
    })) as DbCar[];
  } catch (error) {
    console.error("[admin] Failed to fetch cars from MongoDB:", error);
    return [];
  }
}

export default async function AdminDashboardPage() {
  const cars = await getAdminCars();
  return <AdminDashboardClient initialCars={cars} />;
}
