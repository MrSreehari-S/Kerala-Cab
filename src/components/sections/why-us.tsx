"use client";

import { motion } from "motion/react";
import {
  ShieldCheck,
  CalendarRange,
  Clock,
  UserCheck,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
}

const features: Feature[] = [
  {
    icon: ShieldCheck,
    title: "Meticulously Maintained",
    description:
      "Every car undergoes deep sanitization and a 150-point safety inspection before each trip — guaranteed.",
  },
  {
    icon: Clock,
    title: "24/7 Concierge",
    description:
      "Dedicated support for route assistance, emergency handling, and on-demand vehicle swaps, any time of day.",
  },
  {
    icon: UserCheck,
    title: "Expert Chauffeurs",
    description:
      "Bilingual, background-verified professionals who know Kerala's roads, customs, and hidden gems.",
  },
  {
    icon: CalendarRange,
    title: "Flexible Booking",
    description:
      "From single-day self-drives to month-long chauffeur tours and multi-vehicle wedding convoys — we do it all.",
  },
];

export function WhyUsSection() {
  return (
    <section id="why-us" className="relative py-24 bg-background overflow-hidden">
      {/* Decorative accent line */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      <div className="section-container">
        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16 max-w-xl"
        >
          <div className="mb-4 flex items-center gap-3">
            <div className="h-px w-8 bg-accent" />
            <span className="font-sans text-xs font-semibold uppercase tracking-[0.25em] text-accent">
              Why Choose Us
            </span>
          </div>
          <h2 className="mb-4 font-serif text-3xl font-bold tracking-wide md:text-5xl">
            The Premium Standard
          </h2>
          <p className="font-sans text-sm text-muted-foreground md:text-base leading-relaxed">
            We don&apos;t just rent cars — we craft effortless, premium travel
            experiences tailored to Kerala&apos;s roads, weather, and culture.
          </p>
        </motion.div>

        {/* ── Feature Grid ── */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          {features.map((feat, index) => {
            const Icon = feat.icon;
            return (
              <motion.div
                key={feat.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.12,
                  ease: "easeOut",
                }}
                className="group relative flex flex-col rounded-2xl border border-border bg-card/50 p-6 transition-all duration-300 hover:border-accent/40 hover:bg-card hover:shadow-lg hover:shadow-accent/5"
              >
                {/* Icon container */}
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-secondary transition-all duration-300 group-hover:bg-accent group-hover:shadow-md group-hover:shadow-accent/20">
                  <Icon className="h-5 w-5 text-accent transition-colors duration-300 group-hover:text-accent-foreground" />
                </div>

                <h3 className="mb-2 font-serif text-lg font-semibold tracking-wide">
                  {feat.title}
                </h3>
                <p className="font-sans text-sm leading-relaxed text-muted-foreground">
                  {feat.description}
                </p>

                {/* Hover accent line */}
                <div className="absolute bottom-0 left-6 right-6 h-0.5 scale-x-0 rounded-full bg-accent transition-transform duration-300 group-hover:scale-x-100" />
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
