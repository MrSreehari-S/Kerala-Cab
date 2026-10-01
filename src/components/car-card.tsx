"use client";

import Image from "next/image";
import { useState } from "react";
import { motion } from "motion/react";
import {
  Users,
  Fuel,
  Gauge,
  Car as CarIcon,
  Images,
  Phone,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Car } from "@/data/cars";

interface CarCardProps {
  car: Car;
  onBook: (car: Car) => void;
  onViewDetail?: (car: Car) => void;
  priority?: boolean;
}

export function CarCard({
  car,
  onBook,
  onViewDetail,
  priority = false,
}: CarCardProps) {
  const hasImage = car.images && car.images.length > 0;
  const imageCount = car.images ? car.images.length : 0;
  const [imgSrc] = useState(hasImage ? car.images[0] : "");
  const [hasError, setHasError] = useState(false);

  const categoryLabels: Record<string, string> = {
    luxury: "LUXURY",
    suv: "SUV",
    sedan: "SEDAN",
    wedding: "WEDDING",
  };

  const handleCardClick = () => {
    if (onViewDetail) {
      onViewDetail(car);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      onClick={handleCardClick}
      className={`group/card car-card-tile relative flex h-full flex-col overflow-hidden rounded-2xl border border-border/50 bg-card text-card-foreground shadow-md transition-all duration-500 hover:shadow-2xl hover:shadow-accent/10 hover:border-accent/40 ${
        onViewDetail ? "cursor-pointer" : ""
      }`}
    >
      {/* ── Image Container ── */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted">
        {hasImage && !hasError ? (
          <Image
            src={imgSrc}
            alt={`${car.name} — ${car.tagline}`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-700 ease-out group-hover/card:scale-105"
            onError={() => {
              if (!hasError) {
                setHasError(true);
              }
            }}
            priority={priority}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <CarIcon className="h-12 w-12 text-muted-foreground/30" />
          </div>
        )}

        {/* Gradient overlay */}
        {hasImage && !hasError && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        )}

        {/* Photo count badge */}
        {imageCount > 1 && (
          <div className="absolute right-3 top-3 z-10">
            <div className="flex items-center gap-1 rounded-full bg-black/60 px-2.5 py-1 font-sans text-[11px] font-medium text-white backdrop-blur-md">
              <Images className="h-3 w-3 text-accent" />
              {imageCount}
            </div>
          </div>
        )}
      </div>

      {/* ── Card Body ── */}
      <div className="flex flex-1 flex-col items-center px-5 pt-5 pb-5">
        {/* Category Label */}
        <span className="mb-2 font-sans text-[11px] font-bold uppercase tracking-[0.2em] text-accent">
          {categoryLabels[car.category] || car.category.toUpperCase()}
        </span>

        {/* Car Name */}
        <h3 className="mb-1 text-center font-serif text-lg font-bold tracking-wide text-foreground sm:text-xl">
          {car.name}
        </h3>

        {/* Tagline */}
        <p className="mb-4 text-center font-sans text-xs text-muted-foreground italic">
          {car.tagline}
        </p>

        {/* Decorative separator */}
        <div className="mb-4 flex w-full items-center gap-3">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
          <div className="h-1 w-1 rounded-full bg-accent/50" />
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
        </div>

        {/* Spec row */}
        <div className="mb-5 flex w-full items-center justify-center gap-3">
          <div className="flex items-center gap-1.5 rounded-full border border-border/60 bg-muted/50 px-3 py-1.5">
            <Users className="h-3.5 w-3.5 text-accent/80" />
            <span className="font-sans text-[11px] font-medium text-muted-foreground">
              {car.seats} Seats
            </span>
          </div>
          <div className="flex items-center gap-1.5 rounded-full border border-border/60 bg-muted/50 px-3 py-1.5">
            <Gauge className="h-3.5 w-3.5 text-accent/80" />
            <span className="font-sans text-[11px] font-medium text-muted-foreground">
              {car.transmission}
            </span>
          </div>
          <div className="flex items-center gap-1.5 rounded-full border border-border/60 bg-muted/50 px-3 py-1.5">
            <Fuel className="h-3.5 w-3.5 text-accent/80" />
            <span className="font-sans text-[11px] font-medium text-muted-foreground">
              {car.fuelType}
            </span>
          </div>
        </div>

        {/* Price section */}
        <div className="mb-5 flex w-full items-center justify-center gap-2">
          <div className="text-center">
            <p className="font-sans text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Starting From
            </p>
            <p className="mt-0.5 font-sans text-2xl font-extrabold">
              <span className="font-serif text-accent">₹</span>
              {car.pricePerDay.toLocaleString("en-IN")}
              <span className="text-xs font-normal text-muted-foreground">
                /day
              </span>
            </p>
          </div>
        </div>

        {/* Action buttons row */}
        <div className="mt-auto flex w-full flex-col gap-2.5">
          {/* Call & WhatsApp row */}
          <div className="flex gap-2">
            <a
              href="tel:+919876543210"
              onClick={(e) => e.stopPropagation()}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-border/80 bg-card px-3 py-2 font-sans text-xs font-semibold text-foreground transition-all duration-300 hover:border-accent/50 hover:bg-accent/5 hover:text-accent"
            >
              <Phone className="h-3.5 w-3.5" />
              Call Now
            </a>
            <a
              href={`https://wa.me/919876543210?text=${encodeURIComponent(`Hi, I'm interested in booking the ${car.name}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-emerald-500/30 bg-card px-3 py-2 font-sans text-xs font-semibold text-emerald-500 transition-all duration-300 hover:border-emerald-500/60 hover:bg-emerald-500/5"
            >
              <svg
                className="h-3.5 w-3.5"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              WhatsApp
            </a>
          </div>

          {/* Book Now button */}
          <Button
            onClick={(e) => {
              e.stopPropagation();
              onBook(car);
            }}
            className="w-full rounded-lg bg-gradient-to-r from-accent to-accent/80 px-5 py-2.5 font-sans text-sm font-bold text-accent-foreground shadow-lg shadow-accent/20 transition-all duration-300 hover:shadow-xl hover:shadow-accent/30 hover:brightness-110"
          >
            <Calendar className="mr-2 h-4 w-4" />
            Book Now
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
