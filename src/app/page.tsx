import { getCarsCached } from "@/lib/data/cars";
import { HomeClient } from "./home-client";

// Incremental Static Regeneration (ISR): Edge-cached for 1 hour
// Admin mutations purge this cache instantly via revalidateTag("cars")
export const revalidate = 3600;

export default async function Home() {
  const { cars, dbError } = await getCarsCached();
  return <HomeClient cars={cars} dbError={dbError} />;
}
