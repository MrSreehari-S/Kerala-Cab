import type { Metadata } from "next";
import { ContactPageClient } from "./contact-client";

export const metadata: Metadata = {
  title: "Contact Us — KeralaCabs Premium Car Rentals",
  description:
    "Get in touch with KeralaCabs for reservations, luxury chauffeur bookings, and fleet inquiries via WhatsApp, phone, or email across Kerala.",
};

export default function ContactPage() {
  return <ContactPageClient />;
}
