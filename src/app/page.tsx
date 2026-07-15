"use client";

import { useState, useRef, useCallback } from "react";
import { Toaster } from "sonner";
import { SmoothScrollProvider } from "@/components/smooth-scroll-provider";
import { Navbar } from "@/components/sections/navbar";
import { HeroSection } from "@/components/sections/hero";
import { FleetBrowser } from "@/components/sections/fleet-browser";
import { WhyUsSection } from "@/components/sections/why-us";
import { TestimonialsSection } from "@/components/sections/testimonials";
import { BookingModal } from "@/components/sections/booking-modal";
import { FooterSection } from "@/components/sections/footer";
import { cars } from "@/data/cars";
import type { Car } from "@/data/cars";

export default function Home() {
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

      <main className="flex-1">
        <HeroSection onExploreFleet={handleExploreFleet} />

        <div ref={fleetRef}>
          <FleetBrowser cars={cars} onBook={handleBookCar} />
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

      {/* ── Toast Container ── */}
      <Toaster
        position="top-right"
        toastOptions={{
          className: "font-sans",
        }}
        richColors
      />
    </SmoothScrollProvider>
  );
}
