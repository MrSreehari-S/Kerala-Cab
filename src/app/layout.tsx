import type { Metadata } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.keralacabs.in"),
  title: {
    default: "KeralaCabs — Premium Car Rentals in Kerala",
    template: "%s | KeralaCabs",
  },
  description:
    "Experience luxury self-drive rentals, chauffeur-driven tours, and premium wedding car services across Kerala. Book your premium fleet today.",
  keywords: [
    "Kerala car rental",
    "luxury car rental Kerala",
    "self-drive Kerala",
    "chauffeur driven Kerala",
    "wedding car rental Kochi",
    "premium car hire Kerala",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "KeralaCabs — Premium Car Rentals in Kerala",
    description:
      "Luxury self-drive & chauffeur-driven car rentals across God's Own Country.",
    type: "website",
    url: "https://www.keralacabs.in",
    siteName: "KeralaCabs",
  },
  twitter: {
    card: "summary_large_image",
    title: "KeralaCabs — Premium Car Rentals in Kerala",
    description: "Experience luxury self-drive rentals and chauffeur-driven tours across Kerala.",
  },
};

import { Providers } from "./providers";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${cormorant.variable} ${manrope.variable} h-full antialiased`}
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Playfair+Display:ital,wght@0,600;0,700;1,600;1,700&family=Barlow:wght@300;400;500;600&family=Inter:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
        {/* Preload the very first priority frame of the hero landing sequence for immediate LCP discovery */}
        <link
          rel="preload"
          as="image"
          href="/images/heroAnimation/heroImg-001.jpg"
          fetchPriority="high"
        />
      </head>
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
