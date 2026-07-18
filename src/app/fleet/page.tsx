import type { Metadata } from "next";
import { getCarsCached } from "@/lib/data/cars";
import { FleetPageClient } from "./fleet-client";

export const metadata: Metadata = {
  title: "Browse Our Fleet — KeralaCabs Premium Car Rentals",
  description:
    "Explore our complete collection of luxury sedans, powerful SUVs, elegant wedding cars, and premium self-drive vehicles available across Kerala.",
};

// Incremental Static Regeneration (ISR): Edge-cached for 1 hour
// Admin mutations purge this cache instantly via revalidateTag("cars")
export const revalidate = 3600;

export default async function FleetPage() {
  const { cars, dbError } = await getCarsCached();
  return <FleetPageClient cars={cars} dbError={dbError} />;
}
