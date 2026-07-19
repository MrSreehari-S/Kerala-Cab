"use client";

import { useState, useRef, useCallback } from "react";
import { AlertTriangle } from "lucide-react";
import { SmoothScrollProvider } from "@/components/smooth-scroll-provider";
import { Navbar } from "@/components/sections/navbar";
import { HeroLanding } from "@/components/hero-landing";
import { HeroSection } from "@/components/sections/hero";
import { FleetBrowser } from "@/components/sections/fleet-browser";
import { WhyUsSection } from "@/components/sections/why-us";
import { TestimonialsSection } from "@/components/sections/testimonials";
import { BookingModal } from "@/components/sections/booking-modal";
import { FooterSection } from "@/components/sections/footer";
import type { Car } from "@/data/cars";

interface HomeClientProps {
  cars: Car[];
  dbError?: boolean;
}

export function HomeClient({ cars, dbError = false }: HomeClientProps) {
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const fleetRef = useRef<HTMLDivElement>(null);

  const handleBookCar = useCallback((car: Car) => {
    setSelectedCar(car);
    setIsBookingOpen(true);
  }, []);

  const handleExploreFleet = useCallback(() => {
    fleetRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const handleCloseBooking = useCallback(() => {
    setIsBookingOpen(false);
    setSelectedCar(null);
  }, []);

  return (
    <SmoothScrollProvider>
      <Navbar />

      {/* ── DB Error Banner ── */}
      {dbError && (
        <div className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 flex items-center gap-3 rounded-xl border border-amber-500/30 bg-amber-950/90 px-5 py-3 text-amber-200 shadow-2xl backdrop-blur-md">
          <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400" />
          <p className="font-sans text-xs font-medium">
            Could not connect to the database — fleet is temporarily unavailable.
            Please try again shortly.
          </p>
        </div>
      )}

      <main className="flex-1">
        <HeroLanding />
        <HeroSection onExploreFleet={handleExploreFleet} />

        <div ref={fleetRef}>
          <FleetBrowser cars={cars} onBook={handleBookCar} dbError={dbError} />
        </div>

        <WhyUsSection />
        <TestimonialsSection />
      </main>

      <FooterSection />

      {/* ── Booking Modal ── */}
      <BookingModal
        car={selectedCar}
        isOpen={isBookingOpen}
        onClose={handleCloseBooking}
      />

    </SmoothScrollProvider>
  );
}
