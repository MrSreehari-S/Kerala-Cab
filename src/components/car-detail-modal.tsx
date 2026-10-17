"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Users,
  Fuel,
  Gauge,
  Award,
  Car as CarIcon,
  CheckCircle2,
  Calendar,
  PhoneCall,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  X,
} from "lucide-react";
import type { Car } from "@/data/cars";

interface CarDetailModalProps {
  car: Car | null;
  isOpen: boolean;
  onClose: () => void;
  onBook: (car: Car) => void;
}

export function CarDetailModal({
  car,
  isOpen,
  onClose,
  onBook,
}: CarDetailModalProps) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    if (isOpen) setActiveImageIndex(0);
  }, [isOpen, car]);

  if (!car) return null;

  const images = car.images && car.images.length > 0 ? car.images : [];
  const currentImage = images[activeImageIndex] || "";

  const categoryLabels: Record<string, string> = {
    luxury: "Luxury Fleet",
    suv: "SUV / Crossover",
    "rent-a-car": "Rent a Car",
    wedding: "Wedding Special",
  };

  const handlePrevImage = () =>
    setActiveImageIndex((p) => (p === 0 ? images.length - 1 : p - 1));

  const handleNextImage = () =>
    setActiveImageIndex((p) => (p === images.length - 1 ? 0 : p + 1));

  const specs = [
    { icon: Users, label: "Seating", value: `${car.seats} Seats` },
    { icon: Gauge, label: "Transmission", value: car.transmission },
    { icon: Fuel, label: "Fuel", value: car.fuelType },
    {
      icon: Sparkles,
      label: "Service",
      value: car.isChauffeurOnly ? "Chauffeur" : "Self-Drive",
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="
          p-0 gap-0 overflow-hidden border-0
          w-full max-w-[95vw] sm:max-w-[640px] lg:max-w-[900px]
          rounded-2xl sm:rounded-3xl
          bg-card shadow-2xl
          max-h-[95dvh] flex flex-col
        "
      >
        {/* ── Close button (always visible) ── */}
        <button
          onClick={onClose}
          aria-label="Close"
          className="
            absolute right-3 top-3 z-50
            flex h-8 w-8 items-center justify-center
            rounded-full bg-black/50 text-white
            backdrop-blur-md border border-white/15
            transition-all hover:bg-black/80 hover:scale-110
          "
        >
          <X className="h-4 w-4" />
        </button>

        {/* ════════════════════════════════════
            DESKTOP: side-by-side layout
            MOBILE:  stacked layout
        ════════════════════════════════════ */}
        <div className="flex flex-col lg:flex-row overflow-hidden flex-1 min-h-0">

          {/* ── LEFT / TOP: Gallery Panel ── */}
          <div className="relative lg:w-[52%] shrink-0 bg-black">
            {/* Hero image */}
            <div className="relative w-full aspect-[4/3] lg:aspect-auto lg:h-full overflow-hidden">
              {images.length > 0 ? (
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeImageIndex}
                    initial={{ opacity: 0, scale: 1.04 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="absolute inset-0"
                  >
                    <Image
                      src={currentImage}
                      alt={`${car.name} — photo ${activeImageIndex + 1}`}
                      fill
                      sizes="(max-width: 1024px) 100vw, 52vw"
                      className="object-cover"
                      priority
                    />
                    {/* bottom gradient for name overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
                  </motion.div>
                </AnimatePresence>
              ) : (
                <div className="flex h-full min-h-[240px] w-full items-center justify-center bg-muted">
                  <CarIcon className="h-14 w-14 text-muted-foreground/30" />
                </div>
              )}

              {/* Category + chauffeur badges */}
              <div className="absolute left-3 top-3 z-10 flex flex-wrap gap-1.5">
                <span className="rounded-full bg-black/55 px-2.5 py-1 font-sans text-[11px] font-semibold text-white/90 backdrop-blur-md">
                  {categoryLabels[car.category] || car.category}
                </span>
                {car.isChauffeurOnly && (
                  <span className="flex items-center gap-1 rounded-full bg-accent px-2.5 py-1 font-sans text-[11px] font-semibold text-accent-foreground">
                    <Award className="h-3 w-3" />
                    Chauffeur Only
                  </span>
                )}
              </div>

              {/* Prev / Next controls */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={handlePrevImage}
                    aria-label="Previous image"
                    className="absolute left-2.5 top-1/2 z-20 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-md border border-white/15 transition-all hover:bg-black/80 hover:scale-110"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    onClick={handleNextImage}
                    aria-label="Next image"
                    className="absolute right-2.5 top-1/2 z-20 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-md border border-white/15 transition-all hover:bg-black/80 hover:scale-110"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </>
              )}

              {/* Car name + tagline overlay */}
              <div className="absolute bottom-0 left-0 right-0 z-10 px-4 pb-3.5 pt-8">
                <p className="font-sans text-[10px] font-bold uppercase tracking-[0.2em] text-accent mb-0.5">
                  {categoryLabels[car.category] || car.category}
                </p>
                <h2 className="font-serif text-xl sm:text-2xl font-bold text-white leading-tight">
                  {car.name}
                </h2>
                <p className="mt-0.5 font-sans text-xs text-white/65 italic">
                  {car.tagline}
                </p>
              </div>
            </div>

            {/* Dot indicators */}
            {images.length > 1 && (
              <div className="absolute bottom-3 right-4 z-20 flex items-center gap-1">
                {images.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    aria-label={`Go to image ${idx + 1}`}
                    className={`rounded-full transition-all duration-200 ${
                      idx === activeImageIndex
                        ? "w-4 h-1.5 bg-accent"
                        : "w-1.5 h-1.5 bg-white/40 hover:bg-white/70"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* ── RIGHT / BOTTOM: Detail Panel ── */}
          <div className="flex flex-1 flex-col overflow-y-auto overscroll-contain lg:min-h-0">
            <div className="flex flex-1 flex-col gap-5 p-5 sm:p-6">

              {/* Car name (mobile only — shown here, hidden behind image on desktop) */}
              <div className="lg:hidden">
                <p className="font-sans text-[10px] font-bold uppercase tracking-[0.2em] text-accent mb-0.5">
                  {categoryLabels[car.category] || car.category}
                </p>
                <h2 className="font-serif text-xl font-bold text-foreground leading-tight">
                  {car.name}
                </h2>
                <p className="mt-0.5 font-sans text-xs text-muted-foreground italic">
                  {car.tagline}
                </p>
              </div>

              {/* ── Spec Grid ── */}
              <div>
                <p className="mb-2.5 font-sans text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  Specifications
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {specs.map(({ icon: Icon, label, value }) => (
                    <div
                      key={label}
                      className="flex items-center gap-2.5 rounded-xl border border-border/60 bg-muted/30 px-3 py-2.5"
                    >
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent">
                        <Icon className="h-3.5 w-3.5" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-sans text-[9px] uppercase tracking-wider text-muted-foreground">
                          {label}
                        </p>
                        <p className="truncate font-sans text-xs font-semibold text-foreground">
                          {value}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── Features ── */}
              {car.features && car.features.length > 0 && (
                <div>
                  <p className="mb-2.5 font-sans text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                    Features &amp; Amenities
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {car.features.map((f, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1 rounded-full border border-accent/20 bg-accent/8 px-2.5 py-1 font-sans text-[11px] font-medium text-accent"
                      >
                        <CheckCircle2 className="h-3 w-3 shrink-0" />
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Spacer so pricing bar sticks to bottom on desktop */}
              <div className="flex-1" />

              {/* ── Pricing + CTA ── */}
              <div className="rounded-2xl border border-border/70 bg-gradient-to-br from-card via-muted/20 to-card p-4">
                {/* Price row */}
                <div className="flex items-end justify-between gap-3 mb-3">
                  <div>
                    <p className="font-sans text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
                      Minimum Charge
                    </p>
                    <p className="font-serif text-3xl font-bold text-accent leading-none mt-1">
                      ₹{car.pricePerDay.toLocaleString("en-IN")}
                    </p>
                  </div>

                  {(car.extraKmPrice != null || car.extraHourPrice != null) && (
                    <div className="flex flex-col items-end gap-1 text-right">
                      {car.extraKmPrice != null && (
                        <p className="font-sans text-[11px] text-muted-foreground">
                          Extra km:{" "}
                          <strong className="text-foreground">₹{car.extraKmPrice}</strong>
                        </p>
                      )}
                      {car.extraHourPrice != null && (
                        <p className="font-sans text-[11px] text-muted-foreground">
                          Extra hr:{" "}
                          <strong className="text-foreground">₹{car.extraHourPrice}</strong>
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Action buttons */}
                <div className="flex gap-2.5">
                  <Button
                    variant="outline"
                    nativeButton={false}
                    render={<Link href="/contact" />}
                    onClick={onClose}
                    className="flex-1 h-10 rounded-xl font-sans text-xs font-semibold border-border/80 hover:border-accent/50 hover:text-accent hover:bg-accent/5 transition-colors"
                  >
                    <PhoneCall className="mr-1.5 h-3.5 w-3.5 text-accent" />
                    Contact
                  </Button>

                  <Button
                    onClick={() => { onClose(); onBook(car); }}
                    className="flex-1 h-10 rounded-xl bg-accent font-sans text-xs font-bold text-accent-foreground shadow-lg shadow-accent/20 hover:brightness-110 transition-all"
                  >
                    <Calendar className="mr-1.5 h-3.5 w-3.5" />
                    Reserve Now
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
