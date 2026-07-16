"use client";

import { motion } from "motion/react";
import Image from "next/image";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  MessageSquare,
  PhoneCall,
  MapPin,
  Mail,
  Phone,
  Globe,
} from "lucide-react";

const faqs = [
  {
    q: "What documents are required for self-drive rentals?",
    a: "Indian citizens need a valid driving license, Aadhaar card, and one additional address proof. NRIs and international guests need an International Driving Permit (IDP) and passport copy.",
  },
  {
    q: "Do you offer doorstep delivery and pickup?",
    a: "Yes! We deliver and retrieve vehicles directly at Cochin International Airport (COK), Trivandrum Airport (TRV), railway stations, and any hotel or resort across Kerala.",
  },
  {
    q: "Is fuel included in the rental pricing?",
    a: "For self-drive rentals, fuel is not included — cars are delivered with a baseline level and must be returned at the same level. Chauffeur-driven packages include fuel and driver fees.",
  },
  {
    q: "Can I modify or cancel my booking?",
    a: "Free cancellation is available up to 48 hours before the reservation start. Modifications can be made anytime by contacting our concierge team via phone or WhatsApp.",
  },
  {
    q: "Do you provide wedding car decoration?",
    a: "Absolutely. All wedding car packages include premium floral decoration, red carpet service, and a professionally dressed chauffeur. Custom décor themes are available on request.",
  },
];

export function FooterSection() {
  return (
    <>
      <footer id="faq" className="relative bg-primary text-primary-foreground pt-20 pb-8 overflow-hidden">
        {/* Decorative top gradient */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent" />

        <div className="section-container">
          <div className="grid grid-cols-1 gap-16 lg:grid-cols-2 mb-16">
            {/* ── Brand & Contact ── */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="mb-4">
                <Image
                  src="/logo.jpeg"
                  alt="KeralaCabs Logo"
                  width={140}
                  height={47}
                  className="h-12 w-auto object-contain rounded-md"
                />
              </div>
              <p className="mb-6 max-w-sm font-sans text-sm font-semibold leading-relaxed text-accent">
                Rent A Car (Govt. Approved) • Taxi Service • Luxury Wedding Cars • Traveller & Bus
              </p>

              <div className="space-y-3 font-sans text-sm text-primary-foreground/70">
                <div className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                  <span>
                    Adoor • Trivandrum • Kochi
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                  <div className="flex flex-col gap-1">
                    <a
                      href="tel:+919847151674"
                      className="transition-colors hover:text-accent"
                    >
                      +91 98471 51674
                    </a>
                    <a
                      href="tel:+917012436857"
                      className="transition-colors hover:text-accent"
                    >
                      +91 70124 36857
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 shrink-0 text-accent" />
                  <a
                    href="mailto:concierge@keralacabs.com"
                    className="transition-colors hover:text-accent"
                  >
                    concierge@keralacabs.com
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <Globe className="h-4 w-4 shrink-0 text-accent" />
                  <a
                    href="http://www.keralacabs.in/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transition-colors hover:text-accent"
                  >
                    www.keralacabs.in
                  </a>
                </div>
              </div>

              {/* Quick links */}
              <div className="mt-10 grid grid-cols-2 gap-2 text-sm">
                <div>
                  <h4 className="mb-3 font-sans font-semibold text-primary-foreground/90 uppercase tracking-wider text-xs">
                    Services
                  </h4>
                  <ul className="space-y-2 text-primary-foreground/60 font-sans">
                    <li><a href="#fleet" className="hover:text-accent transition-colors">Self-Drive Rentals</a></li>
                    <li><a href="#fleet" className="hover:text-accent transition-colors">Chauffeur Driven</a></li>
                    <li><a href="#fleet" className="hover:text-accent transition-colors">Wedding Cars</a></li>
                    <li><a href="#fleet" className="hover:text-accent transition-colors">Airport Transfers</a></li>
                  </ul>
                </div>
                <div>
                  <h4 className="mb-3 font-sans font-semibold text-primary-foreground/90 uppercase tracking-wider text-xs">
                    Company
                  </h4>
                  <ul className="space-y-2 text-primary-foreground/60 font-sans">
                    <li><a href="#why-us" className="hover:text-accent transition-colors">About Us</a></li>
                    <li><a href="#testimonials" className="hover:text-accent transition-colors">Reviews</a></li>
                    <li><a href="#faq" className="hover:text-accent transition-colors">FAQ</a></li>
                    <li><a href="#" className="hover:text-accent transition-colors">Contact</a></li>
                  </ul>
                </div>
              </div>
            </motion.div>

            {/* ── FAQ ── */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.15 }}
            >
              <div className="mb-6 flex items-center gap-3">
                <div className="h-px w-6 bg-accent" />
                <span className="font-sans text-xs font-semibold uppercase tracking-[0.25em] text-accent">
                  FAQ
                </span>
              </div>
              <h3 className="mb-8 font-serif text-xl font-bold tracking-wide md:text-2xl">
                Frequently Asked Questions
              </h3>

              <Accordion className="w-full">
                {faqs.map((faq, i) => (
                  <AccordionItem
                    key={i}
                    value={i}
                    className="border-primary-foreground/10"
                  >
                    <AccordionTrigger className="py-4 text-left font-sans text-sm font-medium text-primary-foreground/90 hover:text-accent hover:no-underline md:text-base">
                      {faq.q}
                    </AccordionTrigger>
                    <AccordionContent className="font-sans text-sm leading-relaxed text-primary-foreground/50">
                      {faq.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </motion.div>
          </div>

          {/* ── Bottom Bar ── */}
          <div className="border-t border-primary-foreground/10 pt-8 flex flex-col items-center justify-between gap-4 md:flex-row">
            <p className="font-sans text-xs text-primary-foreground/40">
              © {new Date().getFullYear()} KeralaCabs. All rights reserved.
            </p>
            <div className="flex gap-6 font-sans text-xs text-primary-foreground/40">
              <a href="#" className="transition-colors hover:text-accent">
                Privacy Policy
              </a>
              <a href="#" className="transition-colors hover:text-accent">
                Terms & Conditions
              </a>
              <a href="#" className="transition-colors hover:text-accent">
                Refund Policy
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* ═══ Floating Contact Buttons ═══ */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
        <motion.a
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 2, type: "spring", stiffness: 200 }}
          href="https://wa.me/918848228458?text=Hello%20KeralaCabs%2C%20I%20would%20like%20to%20enquire%20about%20a%20car%20rental."
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 transition-all duration-300 hover:scale-110 hover:shadow-xl hover:shadow-emerald-500/40"
          aria-label="Contact via WhatsApp"
        >
          <MessageSquare className="h-6 w-6" />
        </motion.a>
        <motion.a
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 2.2, type: "spring", stiffness: 200 }}
          href="tel:+919847151674"
          className="flex h-14 w-14 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-lg shadow-accent/30 transition-all duration-300 hover:scale-110 hover:shadow-xl hover:shadow-accent/40"
          aria-label="Call Concierge"
        >
          <PhoneCall className="h-5 w-5" />
        </motion.a>
      </div>
    </>
  );
}
