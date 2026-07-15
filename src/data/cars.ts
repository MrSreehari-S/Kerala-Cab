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
 * Fleet Data — Single source of truth for the car inventory.
 *
 * Image convention:
 *   /images/cars/<slug>/1.jpg, /images/cars/<slug>/2.jpg, ...
 *
 * During development, we use Unsplash placeholder URLs.
 * For production, drop actual car photos into public/images/cars/<slug>/
 * and switch each `images` array to local paths — no code changes needed.
 */
export const cars: Car[] = [
  {
    id: "1",
    name: "Mercedes-Benz S-Class",
    slug: "mercedes-s-class",
    category: "luxury",
    tagline: "The pinnacle of automotive luxury",
    pricePerDay: 18000,
    transmission: "Automatic",
    fuelType: "Petrol",
    seats: 4,
    isChauffeurOnly: true,
    images: [
      "https://images.unsplash.com/photo-1563720223185-11003d516935?w=800&q=80",
      "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&q=80",
    ],
    features: ["Massage Seats", "Ambient Lighting", "Premium Sound System"],
  },
  {
    id: "2",
    name: "BMW 7 Series",
    slug: "bmw-7-series",
    category: "luxury",
    tagline: "Driving pleasure meets opulence",
    pricePerDay: 16000,
    transmission: "Automatic",
    fuelType: "Petrol",
    seats: 4,
    isChauffeurOnly: true,
    images: [
      "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&q=80",
      "https://images.unsplash.com/photo-1556189250-72ba954cfc2b?w=800&q=80",
    ],
    features: ["Executive Lounge", "Gesture Control", "Sky Lounge Roof"],
  },
  {
    id: "3",
    name: "Audi A6",
    slug: "audi-a6",
    category: "luxury",
    tagline: "Progressive luxury, refined performance",
    pricePerDay: 12000,
    transmission: "Automatic",
    fuelType: "Diesel",
    seats: 5,
    images: [
      "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&q=80",
    ],
    features: ["Virtual Cockpit", "Matrix LED Lights", "Quattro AWD"],
  },
  {
    id: "4",
    name: "Toyota Fortuner",
    slug: "toyota-fortuner",
    category: "suv",
    tagline: "Command every road in Kerala",
    pricePerDay: 6500,
    transmission: "Automatic",
    fuelType: "Diesel",
    seats: 7,
    images: [
      "https://images.unsplash.com/photo-1625231334401-4c6a76aa586d?w=800&q=80",
    ],
    features: ["4WD", "Terrain Management", "Cruise Control"],
  },
  {
    id: "5",
    name: "MG Hector",
    slug: "mg-hector",
    category: "suv",
    tagline: "Smart SUV for smart journeys",
    pricePerDay: 4500,
    transmission: "Automatic",
    fuelType: "Petrol",
    seats: 5,
    images: [
      "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800&q=80",
    ],
    features: ["Panoramic Sunroof", "Connected Car Tech", "ADAS"],
  },
  {
    id: "6",
    name: "Mahindra XUV700",
    slug: "mahindra-xuv700",
    category: "suv",
    tagline: "Bold, built for adventure",
    pricePerDay: 5000,
    transmission: "Automatic",
    fuelType: "Diesel",
    seats: 7,
    images: [
      "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&q=80",
    ],
    features: ["ADAS Level 2", "Dual-Zone Climate", "AdrenoX Connect"],
  },
  {
    id: "7",
    name: "Honda City",
    slug: "honda-city",
    category: "sedan",
    tagline: "Efficiency meets elegance",
    pricePerDay: 3000,
    transmission: "Manual",
    fuelType: "Petrol",
    seats: 5,
    images: [
      "https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&q=80",
    ],
    features: ["Lane Watch Camera", "Sunroof", "Connected Features"],
  },
  {
    id: "8",
    name: "Hyundai Verna",
    slug: "hyundai-verna",
    category: "sedan",
    tagline: "Bold sedan, smooth ride",
    pricePerDay: 2800,
    transmission: "Automatic",
    fuelType: "Petrol",
    seats: 5,
    images: [
      "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&q=80",
    ],
    features: ["Ventilated Seats", "ADAS", "Digital Key"],
  },
  {
    id: "9",
    name: "Maruti Suzuki Ciaz",
    slug: "maruti-ciaz",
    category: "sedan",
    tagline: "Premium comfort, practical value",
    pricePerDay: 2500,
    transmission: "Manual",
    fuelType: "Petrol",
    seats: 5,
    images: [
      "https://images.unsplash.com/photo-1542362567-b07e54358753?w=800&q=80",
    ],
    features: ["Smart Hybrid", "Cruise Control", "Rear AC Vents"],
  },
  {
    id: "10",
    name: "Rolls-Royce Ghost",
    slug: "rolls-royce-ghost",
    category: "wedding",
    tagline: "Make your grand entrance unforgettable",
    pricePerDay: 45000,
    transmission: "Automatic",
    fuelType: "Petrol",
    seats: 4,
    isChauffeurOnly: true,
    images: [
      "https://images.unsplash.com/photo-1631295868223-63265b40d9e4?w=800&q=80",
    ],
    features: [
      "Starlight Headliner",
      "Bespoke Interior",
      "Champagne Cooler",
    ],
  },
  {
    id: "11",
    name: "Mercedes-Benz E-Class (Wedding)",
    slug: "mercedes-e-class-wedding",
    category: "wedding",
    tagline: "Elegance for your special day",
    pricePerDay: 25000,
    transmission: "Automatic",
    fuelType: "Petrol",
    seats: 4,
    isChauffeurOnly: true,
    images: [
      "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&q=80",
    ],
    features: [
      "Floral Decoration Included",
      "Red Carpet Service",
      "Professional Chauffeur",
    ],
  },
  {
    id: "12",
    name: "Vintage Beauford",
    slug: "vintage-beauford",
    category: "wedding",
    tagline: "Timeless charm for timeless moments",
    pricePerDay: 35000,
    transmission: "Manual",
    fuelType: "Petrol",
    seats: 4,
    isChauffeurOnly: true,
    images: [
      "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&q=80",
    ],
    features: [
      "Vintage Styling",
      "Open-Top Available",
      "Photo-Ready Decor",
    ],
  },
];

/** Helper: get cars filtered by category */
export function getCarsByCategory(category: CarCategory): Car[] {
  return cars.filter((car) => car.category === category);
}

/** Helper: get a single car by slug */
export function getCarBySlug(slug: string): Car | undefined {
  return cars.find((car) => car.slug === slug);
}
