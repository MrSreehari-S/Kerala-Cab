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
  title: "KeralaCabs — Premium Car Rentals in Kerala",
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
  openGraph: {
    title: "KeralaCabs — Premium Car Rentals in Kerala",
    description:
      "Luxury self-drive & chauffeur-driven car rentals across God's Own Country.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${manrope.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
