"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
    if (isOpen) {
      setActiveImageIndex(0);
    }
  }, [isOpen, car]);

  if (!car) return null;

  const images = car.images && car.images.length > 0 ? car.images : [];
  const currentImage = images[activeImageIndex] || "";

  const categoryLabels: Record<string, string> = {
    luxury: "Luxury Fleet",
    suv: "SUV / Crossover",
    sedan: "Executive Sedan",
    wedding: "Wedding Special",
  };

  const handlePrevImage = () => {
    setActiveImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setActiveImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[720px] p-0 overflow-hidden rounded-3xl border border-border/80 bg-card shadow-2xl max-h-[92vh] flex flex-col">
        {/* ── Top Gallery Header ── */}
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-black/90 shrink-0">
          {images.length > 0 ? (
            <AnimatePresence mode="wait">
              <motion.div
                key={activeImageIndex}
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="relative h-full w-full"
              >
                <Image
                  src={currentImage}
                  alt={`${car.name} photo ${activeImageIndex + 1}`}
                  fill
                  sizes="(max-width: 768px) 100vw, 720px"
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              </motion.div>
            </AnimatePresence>
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-muted">
              <CarIcon className="h-16 w-16 text-muted-foreground/30" />
            </div>
          )}

          {/* Badges on image */}
          <div className="absolute left-4 top-4 z-10 flex gap-2">
            <Badge className="border-none bg-background/80 px-3 py-1 font-sans text-xs font-semibold text-foreground backdrop-blur-md">
              {categoryLabels[car.category] || car.category}
            </Badge>
            {car.isChauffeurOnly && (
              <Badge className="flex items-center gap-1.5 border-none bg-accent px-3 py-1 font-sans text-xs font-semibold text-accent-foreground backdrop-blur-md">
                <Award className="h-3.5 w-3.5" />
                Chauffeur Only
              </Badge>
            )}
          </div>

          {/* Gallery controls if multiple images */}
          {images.length > 1 && (
            <>
              <button
                onClick={handlePrevImage}
                className="absolute left-3 top-1/2 -translate-y-1/2 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-md border border-white/20 transition-all hover:bg-black/80 hover:scale-110"
                aria-label="Previous image"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={handleNextImage}
                className="absolute right-3 top-1/2 -translate-y-1/2 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-md border border-white/20 transition-all hover:bg-black/80 hover:scale-110"
                aria-label="Next image"
              >
                <ChevronRight className="h-5 w-5" />
              </button>

              {/* Image counter pill */}
              <div className="absolute right-4 bottom-4 z-10 rounded-full bg-black/60 px-3 py-1 font-sans text-[11px] font-semibold text-white/90 backdrop-blur-md border border-white/10">
                {activeImageIndex + 1} / {images.length}
              </div>
            </>
          )}

          {/* Car Name overlay on top of image gradient */}
          <div className="absolute bottom-4 left-4 right-16 z-10">
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-white drop-shadow-md">
              {car.name}
            </h2>
            <p className="font-sans text-xs md:text-sm text-zinc-300 italic">
              {car.tagline}
            </p>
          </div>
        </div>

        {/* ── Thumbnails Strip (if multiple photos available) ── */}
        {images.length > 1 && (
          <div className="flex items-center gap-2 overflow-x-auto p-3 bg-muted/40 border-b border-border scrollbar-thin">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImageIndex(idx)}
                className={`relative h-14 w-20 shrink-0 overflow-hidden rounded-lg border-2 transition-all duration-200 ${
                  activeImageIndex === idx
                    ? "border-accent scale-105 shadow-md shadow-accent/20"
                    : "border-transparent opacity-60 hover:opacity-100"
                }`}
              >
                <Image
                  src={img}
                  alt={`Thumbnail ${idx + 1}`}
                  fill
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        )}

        {/* ── Scrollable Body Content ── */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Spec Grid */}
          <div>
            <h4 className="mb-3 font-sans text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Vehicle Specifications
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-muted/20 p-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/10 text-accent">
                  <Users className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-sans text-[10px] text-muted-foreground uppercase">Seating</p>
                  <p className="font-sans text-sm font-semibold">{car.seats} Seats</p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-muted/20 p-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/10 text-accent">
                  <Gauge className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-sans text-[10px] text-muted-foreground uppercase">Transmission</p>
                  <p className="font-sans text-sm font-semibold">{car.transmission}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-muted/20 p-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/10 text-accent">
                  <Fuel className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-sans text-[10px] text-muted-foreground uppercase">Fuel Type</p>
                  <p className="font-sans text-sm font-semibold">{car.fuelType}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-muted/20 p-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/10 text-accent">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-sans text-[10px] text-muted-foreground uppercase">Service</p>
                  <p className="font-sans text-sm font-semibold">
                    {car.isChauffeurOnly ? "Chauffeur" : "Self-Drive / Chauffeur"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Features List */}
          {car.features && car.features.length > 0 && (
            <div>
              <h4 className="mb-3 font-sans text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Key Features & Amenities
              </h4>
              <div className="flex flex-wrap gap-2">
                {car.features.map((feature, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 font-sans text-xs font-medium text-amber-500"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 text-amber-500" />
                    {feature}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Pricing Highlight & Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-border bg-gradient-to-r from-card via-muted/30 to-card p-5">
            <div>
              <p className="font-sans text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
                Daily Rental Rate
              </p>
              <div className="flex items-baseline gap-1">
                <span className="font-serif text-3xl font-bold text-accent">
                  ₹{car.pricePerDay.toLocaleString("en-IN")}
                </span>
                <span className="font-sans text-xs text-muted-foreground">/ 24 Hours</span>
              </div>
            </div>

            <div className="flex w-full sm:w-auto items-center gap-3">
              <Button
                variant="outline"
                nativeButton={false}
                className="flex-1 sm:flex-initial rounded-full font-sans text-xs font-semibold h-11 px-5"
                render={<Link href="/contact" />}
                onClick={onClose}
              >
                <PhoneCall className="mr-2 h-4 w-4 text-accent" />
                Contact Us
              </Button>

              <Button
                onClick={() => {
                  onClose();
                  onBook(car);
                }}
                className="flex-1 sm:flex-initial rounded-full bg-accent px-6 font-sans text-xs font-semibold text-accent-foreground hover:bg-accent/90 shadow-lg shadow-accent/20 h-11"
              >
                <Calendar className="mr-2 h-4 w-4" />
                Reserve Now
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
