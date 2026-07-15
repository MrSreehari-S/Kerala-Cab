"use client";

import * as React from "react";
import { motion } from "motion/react";
import { Star, Quote } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";

interface Review {
  name: string;
  role: string;
  content: string;
  rating: number;
  initials: string;
}

const reviews: Review[] = [
  {
    name: "Rohit Krishnan",
    role: "NRI Client, Dubai",
    content:
      "We reserved a Mercedes S-Class for my sister's wedding in Kochi. The vehicle was immaculate, the chauffeur was outstanding, and the coordination was seamless. Truly premium service.",
    rating: 5,
    initials: "RK",
  },
  {
    name: "Meera Nair",
    role: "Corporate Executive",
    content:
      "KeralaCabs has been our travel partner for executive visits across Kerala. The fleet is always spotless, drivers are professional, and scheduling is effortless.",
    rating: 5,
    initials: "MN",
  },
  {
    name: "Arjun Menon",
    role: "Tourism Entrepreneur",
    content:
      "I recommend KeralaCabs to all my international guests. Their luxury fleet and local expertise make every Kerala tour unforgettable. The attention to detail is unmatched.",
    rating: 5,
    initials: "AM",
  },
  {
    name: "Priya Sharma",
    role: "Destination Wedding Planner",
    content:
      "From vintage cars to modern luxury — KeralaCabs delivered every vehicle on time, beautifully decorated. My couples love them. A truly dependable partner.",
    rating: 5,
    initials: "PS",
  },
];

export function TestimonialsSection() {
  const autoplayPlugin = React.useRef(
    Autoplay({ delay: 6000, stopOnInteraction: true })
  );

  return (
    <section
      id="testimonials"
      className="relative py-24 bg-muted/20 overflow-hidden"
    >
      {/* Decorative elements */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      <div className="absolute right-12 top-16 text-accent/5">
        <Quote className="h-48 w-48" />
      </div>

      <div className="section-container relative z-10">
        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <div className="mb-4 flex items-center justify-center gap-3">
            <div className="h-px w-8 bg-accent" />
            <span className="font-sans text-xs font-semibold uppercase tracking-[0.25em] text-accent">
              Testimonials
            </span>
            <div className="h-px w-8 bg-accent" />
          </div>
          <h2 className="font-serif text-3xl font-bold tracking-wide md:text-5xl">
            Trusted by Discerning Guests
          </h2>
        </motion.div>

        {/* ── Carousel ── */}
        <Carousel
          opts={{ align: "center", loop: true }}
          plugins={[autoplayPlugin.current]}
          className="mx-auto max-w-4xl"
        >
          <CarouselContent>
            {reviews.map((rev, index) => (
              <CarouselItem key={index} className="basis-full">
                <div className="px-4 py-2">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.96 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="mx-auto max-w-2xl text-center space-y-6"
                  >
                    {/* Stars */}
                    <div className="flex justify-center gap-1">
                      {Array.from({ length: rev.rating }).map((_, i) => (
                        <Star
                          key={i}
                          className="h-4 w-4 fill-accent text-accent"
                        />
                      ))}
                    </div>

                    {/* Quote */}
                    <blockquote className="font-serif text-xl leading-relaxed text-foreground italic md:text-2xl">
                      &ldquo;{rev.content}&rdquo;
                    </blockquote>

                    {/* Author */}
                    <div className="flex flex-col items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-accent/15 font-serif text-sm font-bold text-accent">
                        {rev.initials}
                      </div>
                      <div>
                        <p className="font-sans text-sm font-semibold text-foreground">
                          {rev.name}
                        </p>
                        <p className="font-sans text-xs text-muted-foreground">
                          {rev.role}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="-left-4 hidden md:flex bg-background shadow-lg border-border" />
          <CarouselNext className="-right-4 hidden md:flex bg-background shadow-lg border-border" />
        </Carousel>
      </div>
    </section>
  );
}
