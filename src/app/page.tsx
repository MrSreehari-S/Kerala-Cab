import { getCarsCached } from "@/lib/data/cars";
import { HomeClient } from "./home-client";
import Script from "next/script";

// Incremental Static Regeneration (ISR): Edge-cached for 1 hour
// Admin mutations purge this cache instantly via revalidateTag("cars")
export const revalidate = 3600;

export default async function Home() {
  const { cars, dbError } = await getCarsCached();
  
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "AutoRental",
    name: "KeralaCabs",
    url: "https://www.keralacabs.in",
    description: "Premium Car Rentals in Kerala, offering self-drive and chauffeur-driven luxury cars.",
    address: {
      "@type": "PostalAddress",
      addressRegion: "Kerala",
      addressCountry: "IN"
    }
  };

  return (
    <>
      <Script
        id="json-ld-org"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HomeClient cars={cars} dbError={dbError} />
    </>
  );
}
