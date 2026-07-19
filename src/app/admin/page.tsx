import { getAdminCarsDirect } from "@/lib/data/cars";
import { AdminDashboardClient } from "./components/admin-dashboard-client";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const { cars } = await getAdminCarsDirect();
  return <AdminDashboardClient initialCars={cars} />;
}
