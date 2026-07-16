"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CarCard } from "@/components/car-card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import type { Car, CarCategory } from "@/data/cars";

interface FleetBrowserProps {
  cars: Car[];
  onBook: (car: Car) => void;
}

const categories: { value: string; label: string }[] = [
  { value: "all", label: "All Cars" },
  { value: "luxury", label: "Luxury" },
  { value: "suv", label: "SUV" },
  { value: "sedan", label: "Sedan" },
  { value: "wedding", label: "Wedding" },
];

export function FleetBrowser({ cars, onBook }: FleetBrowserProps) {
  return (
    <section id="fleet" className="relative py-24 bg-muted/30">
      {/* Subtle top gradient divider */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      <div className="section-container">
        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-14 text-center"
        >
          <div className="mb-4 flex items-center justify-center gap-3">
            <div className="h-px w-8 bg-accent" />
            <span className="font-sans text-xs font-semibold uppercase tracking-[0.25em] text-accent">
              Our Collection
            </span>
            <div className="h-px w-8 bg-accent" />
          </div>
          <h2 className="mb-4 font-serif text-3xl font-bold tracking-wide md:text-5xl">
            The Premium Fleet
          </h2>
          <p className="mx-auto max-w-lg font-sans text-sm text-muted-foreground md:text-base">
            Handpicked luxury sedans, rugged SUVs, reliable self-drive options,
            and show-stopping wedding cars — all meticulously maintained.
          </p>
        </motion.div>

        {/* ── Tabs ── */}
        <Tabs defaultValue="all" className="w-full">
          <div className="mb-10 flex justify-center">
            <TabsList className="glass rounded-full p-1.5 h-auto">
              {categories.map((cat) => (
                <TabsTrigger
                  key={cat.value}
                  value={cat.value}
                  className="rounded-full px-5 py-2 font-sans text-xs font-semibold capitalize transition-all duration-300 data-active:bg-primary data-active:text-primary-foreground sm:text-sm sm:px-6"
                >
                  {cat.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {categories.map((cat) => {
            const filtered =
              cat.value === "all"
                ? cars
                : cars.filter((c) => c.category === (cat.value as CarCategory));

            return (
              <TabsContent key={cat.value} value={cat.value}>
                <FleetCarousel cars={filtered} onBook={onBook} />
              </TabsContent>
            );
          })}
        </Tabs>

          {/* ── View All CTA ── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-12 flex justify-center"
          >
            <Button
              nativeButton={false}
              className="group rounded-full bg-primary px-8 py-3 font-sans text-sm font-semibold text-primary-foreground transition-all duration-300 hover:bg-accent hover:text-accent-foreground hover:shadow-xl hover:shadow-accent/20 h-auto"
              render={<Link href="/fleet" />}
            >
              Explore Full Fleet
              <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Button>
          </motion.div>
      </div>
    </section>
  );
}

/* ── Carousel Sub-component ── */
function FleetCarousel({
  cars,
  onBook,
}: {
  cars: Car[];
  onBook: (car: Car) => void;
}) {
  const autoplayPlugin = React.useRef(
    Autoplay({ delay: 5000, stopOnInteraction: true })
  );

  return (
    <Carousel
      opts={{ align: "start", loop: true }}
      plugins={[autoplayPlugin.current]}
      className="w-full"
    >
      <CarouselContent className="-ml-4 md:-ml-6">
        {cars.map((car) => (
          <CarouselItem
            key={car.id}
            className="pl-4 md:pl-6 basis-full sm:basis-1/2 lg:basis-1/3"
          >
            <div className="py-2">
              <CarCard car={car} onBook={onBook} />
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      {cars.length > 3 && (
        <>
          <CarouselPrevious className="-left-4 hidden md:flex bg-background shadow-lg border-border hover:bg-accent hover:text-accent-foreground hover:border-accent" />
          <CarouselNext className="-right-4 hidden md:flex bg-background shadow-lg border-border hover:bg-accent hover:text-accent-foreground hover:border-accent" />
        </>
      )}
    </Carousel>
  );
}
