"use client";

import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Phone, MapPin } from "lucide-react";
import Image from "next/image";

interface HeroSectionProps {
  onExploreFleet: () => void;
}

export function HeroSection({ onExploreFleet }: HeroSectionProps) {
  return (
    <section
      id="hero"
      className="relative flex min-h-screen w-full items-center justify-start overflow-hidden bg-black text-white"
    >
      {/* ── Background Image ── */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/herosection.jpg"
          alt="Luxury car on a scenic Kerala road"
          fill
          className="object-cover opacity-40"
          priority
          sizes="100vw"
        />
        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
      </div>

      {/* ── Content ── */}
      <div className="section-container relative z-10 py-32 md:py-0">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: "easeOut", delay: 0.2 }}
          className="max-w-3xl space-y-8"
        >
          {/* Eyebrow */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex items-center gap-3"
          >
            <div className="h-px w-10 bg-accent" />
            <span className="font-sans text-xs font-semibold uppercase tracking-[0.25em] text-accent">
              Premium Car Rentals in Kerala
            </span>
          </motion.div>

          {/* Main headline */}
          <h1 className="font-serif text-4xl font-bold leading-[1.08] tracking-wide sm:text-5xl md:text-6xl lg:text-7xl">
            Experience Every{" "}
            <br className="hidden sm:block" />
            Journey in{" "}
            <span className="text-gold-gradient italic font-light">
              Luxury
            </span>
          </h1>

          {/* Subheading */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.7 }}
            className="max-w-xl font-sans text-base leading-relaxed text-zinc-300 sm:text-lg"
          >
            Self-drive rentals, chauffeur-driven tours, and premium wedding
            fleets across God&apos;s Own Country. Seamless reservation, immaculate
            fleet, unforgettable experience.
          </motion.p>

          {/* Location indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.9 }}
            className="flex items-center gap-2 font-sans text-xs text-zinc-400"
          >
            <MapPin className="h-3.5 w-3.5 text-accent" />
            <span>Kochi · Trivandrum · Adoor</span>
          </motion.div>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.0 }}
            className="flex flex-col gap-4 pt-2 sm:flex-row"
          >
            <Button
              onClick={onExploreFleet}
              className="group rounded-full bg-accent px-8 py-3 font-sans text-sm font-semibold text-accent-foreground transition-all duration-300 hover:bg-white hover:text-black hover:shadow-xl hover:shadow-accent/20 h-auto"
            >
              Browse Our Fleet
              <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Button>
            <Button
              nativeButton={false}
              variant="outline"
              className="rounded-full border-white/20 px-8 py-3 font-sans text-sm text-white bg-black backdrop-blur-sm transition-all duration-300 hover:border-accent/50 hover:bg-white/10 h-auto"
              render={
                <a
                  href="https://wa.me/918848228458?text=Hello%20KeralaCabs,%20I%20would%20like%20to%20enquire%20about%20a%20car%20rental."
                  target="_blank"
                  rel="noopener noreferrer"
                />
              }
            >
              <Phone className="mr-2 h-4 w-4 " />
              Contact Concierge
            </Button>
          </motion.div>

          {/* Trust indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 1.3 }}
            className="flex flex-wrap gap-6 border-t border-white/10 pt-8 mt-4"
          >
            {[
              { value: "500+", label: "Happy Clients" },
              { value: "50+", label: "Premium Cars" },
              { value: "24/7", label: "Concierge" },
              { value: "10+", label: "Years" },
            ].map((stat) => (
              <div key={stat.label} className="flex flex-col">
                <span className="font-serif text-2xl font-bold text-accent md:text-3xl">
                  {stat.value}
                </span>
                <span className="font-sans text-[10px] uppercase tracking-widest text-zinc-500">
                  {stat.label}
                </span>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* ── Scroll indicator ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="flex flex-col items-center gap-2"
        >
          <span className="font-sans text-[10px] uppercase tracking-widest text-zinc-500">
            Scroll
          </span>
          <div className="h-8 w-px bg-gradient-to-b from-accent to-transparent" />
        </motion.div>
      </motion.div>
    </section>
  );
}
