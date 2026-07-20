"use client";

import { motion } from "motion/react";
import {
  MessageSquare,
  PhoneCall,
  MapPin,
  Clock,
  ArrowRight,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Navbar } from "@/components/sections/navbar";
import { FooterSection } from "@/components/sections/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function ContactPageClient() {
  const whatsappUrl =
    "https://wa.me/918848228458?text=Hello%20KeralaCabs,%20I%20would%20like%20to%20enquire%20about%20a%20car%20rental.";

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-background pt-20">
        {/* ── Hero Header ── */}
        <section className="relative overflow-hidden bg-primary py-20 text-primary-foreground md:py-28">
          <div className="absolute inset-0 opacity-15">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,oklch(0.72_0.14_70/0.3),transparent_70%)]" />
          </div>

          <div className="section-container relative z-10 text-center">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mx-auto max-w-3xl"
            >
              <div className="mb-4 flex items-center justify-center gap-3">
                <div className="h-px w-8 bg-accent" />
                <span className="font-sans text-xs font-semibold uppercase tracking-[0.25em] text-accent">
                  24/7 Luxury Concierge
                </span>
                <div className="h-px w-8 bg-accent" />
              </div>

              <h1 className="mb-6 font-serif text-4xl font-bold tracking-wide md:text-6xl lg:text-7xl">
                Get In Touch With <br />
                <span className="text-gold-gradient italic font-light">
                  Kerala Cabs
                </span>
              </h1>

              <p className="mx-auto max-w-xl font-sans text-base text-primary-foreground/75 md:text-lg">
                Whether you need a luxury self-drive rental, wedding car coordination,
                or custom tour itinerary across Kerala, our concierge team is at your service.
              </p>
            </motion.div>
          </div>
        </section>

        {/* ── Contact Options Grid ── */}
        <section className="section-container -mt-10 relative z-20 pb-20">
          <div className="grid gap-8 md:grid-cols-2 max-w-4xl mx-auto">
            {/* 1. WhatsApp Card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-emerald-500/20 bg-card p-8 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500/40 hover:shadow-2xl hover:shadow-emerald-500/10"
            >
              <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-emerald-500/10 blur-2xl transition-all group-hover:bg-emerald-500/20" />

              <div>
                <div className="mb-6 flex items-center justify-between">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-500 shadow-inner">
                    <MessageSquare className="h-7 w-7" />
                  </div>
                  <Badge className="border-none bg-emerald-500/15 font-sans text-xs font-semibold text-emerald-500">
                    Fastest Response
                  </Badge>
                </div>

                <h3 className="mb-2 font-serif text-2xl font-bold tracking-wide text-foreground">
                  WhatsApp Support
                </h3>
                <p className="mb-6 font-sans text-sm text-muted-foreground leading-relaxed">
                  Chat directly with our reservations team. Get instant vehicle availability, price quotes, and custom package rates.
                </p>
              </div>

              <Button
                nativeButton={false}
                className="w-full rounded-full bg-emerald-600 font-sans text-sm font-semibold text-white transition-all duration-300 hover:bg-emerald-500 shadow-lg shadow-emerald-600/20 h-12"
                render={
                  <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" />
                }
              >
                Chat on WhatsApp
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </motion.div>

            {/* 2. Direct Phone Lines Card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-accent/30 bg-card p-8 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:border-accent/50 hover:shadow-2xl hover:shadow-accent/10"
            >
              <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-accent/10 blur-2xl transition-all group-hover:bg-accent/20" />

              <div>
                <div className="mb-6 flex items-center justify-between">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/15 text-accent shadow-inner">
                    <PhoneCall className="h-7 w-7" />
                  </div>
                  <Badge className="border-none bg-accent/15 font-sans text-xs font-semibold text-accent">
                    24/7 Available
                  </Badge>
                </div>

                <h3 className="mb-2 font-serif text-2xl font-bold tracking-wide text-foreground">
                  Direct Phone Lines
                </h3>
                <p className="mb-6 font-sans text-sm text-muted-foreground leading-relaxed">
                  Speak directly to our desk for immediate booking assistance, airport pickups, and roadside concierge support.
                </p>

                <div className="mb-6 space-y-2 font-sans text-sm">
                  <a
                    href="tel:+919847151674"
                    className="flex items-center justify-between rounded-xl border border-border bg-muted/30 px-4 py-2.5 font-semibold text-foreground transition-all hover:border-accent hover:text-accent"
                  >
                    <span>+91 98471 51674</span>
                    <span className="text-xs text-muted-foreground">Main Line</span>
                  </a>
                  <a
                    href="tel:+917012436857"
                    className="flex items-center justify-between rounded-xl border border-border bg-muted/30 px-4 py-2.5 font-semibold text-foreground transition-all hover:border-accent hover:text-accent"
                  >
                    <span>+91 70124 36857</span>
                    <span className="text-xs text-muted-foreground">Secondary</span>
                  </a>
                </div>
              </div>

              <Button
                nativeButton={false}
                className="w-full rounded-full bg-accent font-sans text-sm font-semibold text-accent-foreground transition-all duration-300 hover:bg-accent/90 shadow-lg shadow-accent/20 h-12"
                render={<a href="tel:+919847151674" />}
              >
                Call Concierge Now
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </motion.div>
          </div>
        </section>

        {/* ── Locations & Operations Section ── */}
        <section className="bg-muted/30 py-16 border-t border-border">
          <div className="section-container">
            <div className="grid gap-12 lg:grid-cols-2 items-center">
              <div>
                <div className="mb-3 flex items-center gap-3">
                  <div className="h-px w-6 bg-accent" />
                  <span className="font-sans text-xs font-semibold uppercase tracking-[0.25em] text-accent">
                    Kerala-Wide Hubs
                  </span>
                </div>
                <h2 className="mb-6 font-serif text-3xl font-bold md:text-4xl">
                  Doorstep Delivery & Airport Pickup Across Kerala
                </h2>
                <p className="mb-8 font-sans text-sm text-muted-foreground leading-relaxed">
                  We operate physical dispatch hubs and offer seamless airport delivery across all major Kerala transit hubs.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-sans">
                  <div className="rounded-2xl border border-border bg-card p-5">
                    <div className="mb-2 flex items-center gap-2 text-accent">
                      <MapPin className="h-5 w-5" />
                      <h4 className="font-semibold text-foreground">Adoor Hub</h4>
                    </div>
                    <p className="text-xs text-muted-foreground">Central Pathanamthitta Operations Hub</p>
                  </div>

                  <div className="rounded-2xl border border-border bg-card p-5">
                    <div className="mb-2 flex items-center gap-2 text-accent">
                      <MapPin className="h-5 w-5" />
                      <h4 className="font-semibold text-foreground">Trivandrum Hub</h4>
                    </div>
                    <p className="text-xs text-muted-foreground">TRV Airport & Capital City Services</p>
                  </div>

                  <div className="rounded-2xl border border-border bg-card p-5">
                    <div className="mb-2 flex items-center gap-2 text-accent">
                      <MapPin className="h-5 w-5" />
                      <h4 className="font-semibold text-foreground">Kochi Airport (COK)</h4>
                    </div>
                    <p className="text-xs text-muted-foreground">Cochin International Terminal Delivery</p>
                  </div>

                  <div className="rounded-2xl border border-border bg-card p-5">
                    <div className="mb-2 flex items-center gap-2 text-accent">
                      <Clock className="h-5 w-5" />
                      <h4 className="font-semibold text-foreground">Operating Hours</h4>
                    </div>
                    <p className="text-xs text-muted-foreground">Dispatch: 24 Hours / 7 Days a Week</p>
                  </div>
                </div>
              </div>

              {/* Guarantees Box */}
              <div className="rounded-3xl border border-accent/30 bg-primary p-8 text-primary-foreground relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-accent/15 via-transparent to-transparent" />

                <div className="relative z-10 space-y-6">
                  <div className="flex items-center gap-3">
                    <Sparkles className="h-6 w-6 text-accent" />
                    <h3 className="font-serif text-2xl font-bold">The KeralaCabs Standard</h3>
                  </div>

                  <ul className="space-y-4 font-sans text-sm text-primary-foreground/80">
                    <li className="flex items-start gap-3">
                      <ShieldCheck className="h-5 w-5 shrink-0 text-accent mt-0.5" />
                      <span><strong>Sanitised & Inspected Fleet:</strong> Every vehicle undergoes full multi-point safety verification before handover.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <ShieldCheck className="h-5 w-5 shrink-0 text-accent mt-0.5" />
                      <span><strong>Zero Hidden Costs:</strong> Clear transparent daily billing with transparent security deposit terms.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <ShieldCheck className="h-5 w-5 shrink-0 text-accent mt-0.5" />
                      <span><strong>Professional Chauffeurs:</strong> Uniformed, bilingual drivers experienced in Kerala hill routes and coastal highways.</span>
                    </li>
                  </ul>

                  <div className="pt-4 border-t border-primary-foreground/15 flex justify-center">
                    <Button
                      nativeButton={false}
                      className="rounded-full bg-accent px-8 font-sans text-sm font-semibold text-accent-foreground hover:bg-white hover:text-black transition-all"
                      render={
                        <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" />
                      }
                    >
                      Book Your Ride Today
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <FooterSection />
    </>
  );
}
