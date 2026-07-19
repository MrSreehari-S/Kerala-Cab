/**
 * Car domain types — single source of truth for the Car shape.
 *
 * All actual car data lives in MongoDB (managed via the Admin panel).
 * Use GET /api/cars or the server-side `getCars()` helpers in page routes
 * to fetch live data.
 */

export type CarCategory = "luxury" | "suv" | "sedan" | "wedding";

export interface Car {
  id: string;
  name: string;
  slug: string;
  category: CarCategory;
  tagline: string;
  pricePerDay: number;
  transmission: "Automatic" | "Manual";
  fuelType: "Petrol" | "Diesel" | "Hybrid" | "Electric";
  seats: number;
  images: string[];
  isChauffeurOnly?: boolean;
  features?: string[];
}

/**
 * Extended Car type that carries the raw MongoDB `_id` string field.
 * Used exclusively in the admin dashboard where both `id` and `_id` may be present.
 */
export type DbCar = Car & { _id?: string };

/** Helper: get cars filtered by category (works on any in-memory Car[]) */
export function getCarsByCategory(cars: Car[], category: CarCategory): Car[] {
  return cars.filter((car) => car.category === category);
}

/** Helper: get a single car by slug (works on any in-memory Car[]) */
export function getCarBySlug(cars: Car[], slug: string): Car | undefined {
  return cars.find((car) => car.slug === slug);
}
