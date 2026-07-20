import type { Metadata } from "next";
import { getCarsPaginated } from "@/lib/data/cars";
import { FleetPageClient } from "./fleet-client";
import Script from "next/script";

export const metadata: Metadata = {
  title: "Browse Our Fleet",
  description:
    "Explore our complete collection of luxury sedans, powerful SUVs, elegant wedding cars, and premium self-drive vehicles available across Kerala.",
};

export const dynamic = "force-dynamic";

interface FleetPageProps {
  searchParams: Promise<{
    page?: string;
    category?: string;
    sort?: string;
    q?: string;
  }>;
}

export default async function FleetPage({ searchParams }: FleetPageProps) {
  const resolvedParams = await searchParams;

  const page = resolvedParams.page ? parseInt(resolvedParams.page, 10) : 1;
  const category = resolvedParams.category || "all";
  const sort = resolvedParams.sort || "price-asc";
  const q = resolvedParams.q || "";

  const result = await getCarsPaginated({
    page,
    limit: 8,
    category,
    sort,
    q,
  });

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "itemListElement": result.cars.map((car, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "Product",
        "name": car.name,
        "description": `${car.tagline} - ${car.transmission} ${car.fuelType} car`,
        "category": car.category,
        "offers": {
          "@type": "Offer",
          "price": car.pricePerDay,
          "priceCurrency": "INR"
        }
      }
    }))
  };

  return (
    <>
      <Script
        id="json-ld-fleet"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <FleetPageClient
        cars={result.cars}
        total={result.total}
        page={result.page}
        limit={result.limit}
        totalPages={result.totalPages}
        dbError={result.dbError}
      />
    </>
  );
}
