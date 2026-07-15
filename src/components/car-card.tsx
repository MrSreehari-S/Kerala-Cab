"use client";

import Image from "next/image";
import { useState } from "react";
import { motion } from "motion/react";
import { Users, Fuel, Gauge, Award } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Car } from "@/data/cars";

interface CarCardProps {
  car: Car;
  onBook: (car: Car) => void;
  priority?: boolean;
}

const PLACEHOLDER_IMG = "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&q=60";

export function CarCard({ car, onBook, priority = false }: CarCardProps) {
  const [imgSrc, setImgSrc] = useState(car.images[0] || PLACEHOLDER_IMG);
  const [hasError, setHasError] = useState(false);

  const categoryLabels: Record<string, string> = {
    luxury: "Luxury",
    suv: "SUV",
    sedan: "Sedan",
    wedding: "Wedding",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="group/card relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card text-card-foreground shadow-sm transition-all duration-300 hover:shadow-xl hover:shadow-accent/5 hover:border-accent/30"
    >
      {/* ── Image Container — 16:10 aspect ratio ── */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted">
        <Image
          src={hasError ? PLACEHOLDER_IMG : imgSrc}
          alt={`${car.name} — ${car.tagline}`}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="img-zoom object-cover"
          onError={() => {
            if (!hasError) {
              setHasError(true);
              setImgSrc(PLACEHOLDER_IMG);
            }
          }}
          priority={priority}
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover/card:opacity-100" />

        {/* Badges */}
        <div className="absolute left-3 top-3 flex gap-2">
          <Badge className="border-none bg-background/75 px-2.5 py-1 font-sans text-xs font-semibold capitalize text-foreground backdrop-blur-md">
            {categoryLabels[car.category]}
          </Badge>
          {car.isChauffeurOnly && (
            <Badge className="flex items-center gap-1 border-none bg-accent/90 px-2.5 py-1 font-sans text-xs font-semibold text-accent-foreground backdrop-blur-md">
              <Award className="h-3 w-3" />
              Chauffeur
            </Badge>
          )}
        </div>
      </div>

      {/* ── Details ── */}
      <div className="flex flex-1 flex-col justify-between p-5">
        <div>
          <h3 className="mb-1 font-serif text-lg font-semibold tracking-wide text-foreground transition-colors duration-200 group-hover/card:text-accent sm:text-xl">
            {car.name}
          </h3>
          <p className="mb-4 text-xs font-sans text-muted-foreground italic">
            {car.tagline}
          </p>

          {/* Spec grid */}
          <div className="grid grid-cols-3 gap-2 border-t border-border pt-3 text-xs text-muted-foreground font-sans">
            <div className="flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5 text-accent/70" />
              <span>{car.seats} Seats</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Gauge className="h-3.5 w-3.5 text-accent/70" />
              <span>{car.transmission}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Fuel className="h-3.5 w-3.5 text-accent/70" />
              <span>{car.fuelType}</span>
            </div>
          </div>
        </div>

        {/* Price & CTA */}
        <div className="mt-5 flex items-end justify-between">
          <div>
            <p className="text-[10px] font-sans font-medium uppercase tracking-widest text-muted-foreground">
              From / Day
            </p>
            <p className="font-sans text-base font-bold sm:text-lg">
              <span className="font-serif text-accent">₹</span>
              {car.pricePerDay.toLocaleString("en-IN")}
            </p>
          </div>
          <Button
            onClick={() => onBook(car)}
            className="rounded-full bg-primary px-5 font-sans text-xs font-semibold text-primary-foreground transition-all duration-300 hover:bg-accent hover:text-accent-foreground sm:text-sm"
          >
            Reserve
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
