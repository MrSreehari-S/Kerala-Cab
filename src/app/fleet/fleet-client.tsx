"use client";

import { useState, useMemo, useCallback, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Fuse from "fuse.js";
import { motion, AnimatePresence } from "motion/react";
import {
  Search,
  SlidersHorizontal,
  ArrowUpDown,
  Car as CarIcon,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CarCard } from "@/components/car-card";
import { Navbar } from "@/components/sections/navbar";
import { FooterSection } from "@/components/sections/footer";
import { BookingModal } from "@/components/sections/booking-modal";
import { Toaster } from "sonner";
import type { Car, CarCategory } from "@/data/cars";

const categories: { value: string; label: string }[] = [
  { value: "all", label: "All Cars" },
  { value: "luxury", label: "Luxury" },
  { value: "suv", label: "SUV" },
  { value: "sedan", label: "Sedan" },
  { value: "wedding", label: "Wedding" },
];

type SortOption = "price-asc" | "price-desc" | "name-asc" | "seats-desc";

const sortOptions: { value: SortOption; label: string }[] = [
  { value: "price-asc", label: "Price: Low → High" },
  { value: "price-desc", label: "Price: High → Low" },
  { value: "name-asc", label: "Name: A → Z" },
  { value: "seats-desc", label: "Seats: Most First" },
];

interface FleetPageClientProps {
  cars: Car[];
}

export function FleetPageClient({ cars }: FleetPageClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Read initial state from URL params
  const initialCategory = searchParams.get("category") || "all";
  const initialSearch = searchParams.get("q") || "";
  const initialSort = (searchParams.get("sort") || "price-asc") as SortOption;
  const initialPage = Number(searchParams.get("page") || "1");

  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [sortBy, setSortBy] = useState<SortOption>(initialSort);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  const gridRef = useRef<HTMLDivElement>(null);

  // Fuse.js fuzzy search instance
  const fuse = useMemo(
    () =>
      new Fuse(cars, {
        keys: ["name", "tagline", "category", "transmission", "fuelType"],
        threshold: 0.4,
        ignoreLocation: true,
      }),
    [cars]
  );

  // Update URL params for shareable state
  const updateUrl = useCallback(
    (cat: string, q: string, sort: SortOption, pageNum: number) => {
      const params = new URLSearchParams();
      if (cat !== "all") params.set("category", cat);
      if (q) params.set("q", q);
      if (sort !== "price-asc") params.set("sort", sort);
      if (pageNum > 1) params.set("page", String(pageNum));
      const qs = params.toString();
      router.replace(`/fleet${qs ? `?${qs}` : ""}`, { scroll: false });
    },
    [router]
  );

  const handleCategoryChange = (cat: string | null) => {
    if (!cat) return;
    setActiveCategory(cat);
    setCurrentPage(1);
    updateUrl(cat, searchQuery, sortBy, 1);
  };

  const handleSearchChange = (q: string) => {
    setSearchQuery(q);
    setCurrentPage(1);
    updateUrl(activeCategory, q, sortBy, 1);
  };

  const handleSortChange = (sort: string | null) => {
    if (!sort) return;
    setSortBy(sort as SortOption);
    setCurrentPage(1);
    updateUrl(activeCategory, searchQuery, sort as SortOption, 1);
  };

  const handlePageChange = (pageNum: number) => {
    setCurrentPage(pageNum);
    updateUrl(activeCategory, searchQuery, sortBy, pageNum);

    // Smooth scroll back to grid top
    if (gridRef.current) {
      const elementTop = gridRef.current.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({
        top: elementTop - 110,
        behavior: "smooth",
      });
    }
  };

  const handleBookCar = useCallback((car: Car) => {
    setSelectedCar(car);
    setIsBookingOpen(true);
  }, []);

  const handleCloseBooking = useCallback(() => {
    setIsBookingOpen(false);
    setSelectedCar(null);
  }, []);

  const clearFilters = () => {
    setSearchQuery("");
    setActiveCategory("all");
    setSortBy("price-asc");
    setCurrentPage(1);
    router.replace("/fleet", { scroll: false });
  };

  // Filter → search → sort pipeline
  const filteredCars = useMemo(() => {
    let results = cars;

    // Category filter
    if (activeCategory !== "all") {
      results = results.filter(
        (car) => car.category === (activeCategory as CarCategory)
      );
    }

    // Fuzzy search
    if (searchQuery.trim()) {
      const fuseResults = fuse.search(searchQuery);
      const searchIds = new Set(fuseResults.map((r) => r.item.id));
      results = results.filter((car) => searchIds.has(car.id));
    }

    // Sort
    const sorted = [...results];
    switch (sortBy) {
      case "price-asc":
        sorted.sort((a, b) => a.pricePerDay - b.pricePerDay);
        break;
      case "price-desc":
        sorted.sort((a, b) => b.pricePerDay - a.pricePerDay);
        break;
      case "name-asc":
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "seats-desc":
        sorted.sort((a, b) => b.seats - a.seats);
        break;
    }

    return sorted;
  }, [cars, activeCategory, searchQuery, sortBy, fuse]);

  // Pagination Constants
  const pageSize = 8;
  const totalPages = Math.ceil(filteredCars.length / pageSize);

  // Paginated cars slice
  const paginatedCars = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredCars.slice(start, start + pageSize);
  }, [filteredCars, currentPage]);

  const hasActiveFilters =
    activeCategory !== "all" || searchQuery.trim() !== "" || sortBy !== "price-asc";

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-background pt-20">
        {/* ── Hero Header ── */}
        <section className="relative overflow-hidden bg-primary py-16 text-primary-foreground md:py-24">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,oklch(0.72_0.14_70/0.2),transparent_60%)]" />
          </div>
          <div className="section-container relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <div className="mb-4 flex items-center justify-center gap-3">
                <div className="h-px w-8 bg-accent" />
                <span className="font-sans text-xs font-semibold uppercase tracking-[0.25em] text-accent">
                  Complete Collection
                </span>
                <div className="h-px w-8 bg-accent" />
              </div>
              <h1 className="mb-4 font-serif text-4xl font-bold tracking-wide md:text-6xl">
                Our Premium Fleet
              </h1>
              <p className="mx-auto max-w-xl font-sans text-sm text-primary-foreground/70 md:text-base">
                Browse our entire collection of meticulously maintained vehicles.
                Find the perfect ride for every occasion across Kerala.
              </p>
            </motion.div>
          </div>
        </section>

        {/* ── Category Filter Pills ── */}
        <section className="bg-background pt-12 pb-4">
          <div className="section-container">
            <div className="flex flex-wrap justify-center gap-3">
              {categories.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => handleCategoryChange(cat.value)}
                  className={`rounded-full px-6 py-2.5 font-sans text-xs font-semibold uppercase tracking-wider transition-all duration-300 border ${
                    activeCategory === cat.value
                      ? "bg-accent text-accent-foreground border-accent shadow-lg shadow-accent/25 scale-[1.02]"
                      : "bg-card border-border/60 text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* ── Filters Bar ── */}
        <section className="sticky top-16 z-40 border-b border-border bg-background/80 backdrop-blur-xl md:top-20">
          <div className="section-container py-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              {/* Search Input */}
              <div className="relative flex-1 md:max-w-sm">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by name, brand, type..."
                  value={searchQuery}
                  onChange={(e) =>
                    handleSearchChange((e.target as HTMLInputElement).value)
                  }
                  className="pl-10 font-sans"
                />
                {searchQuery && (
                  <button
                    onClick={() => handleSearchChange("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-3">
                {/* Sort Selector */}
                <Select value={sortBy} onValueChange={handleSortChange}>
                  <SelectTrigger className="w-[170px] font-sans text-sm">
                    <ArrowUpDown className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    {sortOptions.map((opt) => (
                      <SelectItem
                        key={opt.value}
                        value={opt.value}
                        className="font-sans"
                      >
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Clear Filters */}
                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    onClick={clearFilters}
                    className="font-sans text-xs text-muted-foreground hover:text-foreground"
                  >
                    <X className="mr-1 h-3.5 w-3.5" />
                    Clear
                  </Button>
                )}
              </div>
            </div>

            {/* Active filter badges */}
            {hasActiveFilters && (
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="font-sans text-xs text-muted-foreground">
                  Showing:
                </span>
                {activeCategory !== "all" && (
                  <Badge
                    className="cursor-pointer gap-1 font-sans text-xs"
                    onClick={() => handleCategoryChange("all")}
                  >
                    {categories.find((c) => c.value === activeCategory)?.label}
                    <X className="h-3 w-3" />
                  </Badge>
                )}
                {searchQuery && (
                  <Badge
                    className="cursor-pointer gap-1 font-sans text-xs"
                    onClick={() => handleSearchChange("")}
                  >
                    &ldquo;{searchQuery}&rdquo;
                    <X className="h-3 w-3" />
                  </Badge>
                )}
                <span className="font-sans text-xs text-muted-foreground">
                  — {filteredCars.length}{" "}
                  {filteredCars.length === 1 ? "car" : "cars"}
                </span>
              </div>
            )}
          </div>
        </section>

        {/* ── Car Grid ── */}
        <section ref={gridRef} className="section-container py-12">
          <AnimatePresence mode="wait">
            {paginatedCars.length > 0 ? (
              <div className="space-y-16">
                <motion.div
                  key={`${activeCategory}-${searchQuery}-${sortBy}-${currentPage}`}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.3 }}
                  className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                >
                  {paginatedCars.map((car) => (
                    <CarCard key={car.id} car={car} onBook={handleBookCar} />
                  ))}
                </motion.div>

                {/* ── Pagination Controls ── */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 pt-8">
                    {/* Prev Button */}
                    <Button
                      variant="outline"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="rounded-full px-4 text-xs font-sans font-semibold border-border/80 hover:bg-muted"
                    >
                      <ChevronLeft className="mr-1 h-4 w-4" />
                      Prev
                    </Button>

                    {/* Page Numbers */}
                    <div className="flex items-center gap-1.5">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`h-9 w-9 rounded-full font-sans text-xs font-bold transition-all duration-300 ${
                            currentPage === pageNum
                              ? "bg-accent text-accent-foreground scale-105"
                              : "bg-card border border-border/40 hover:bg-muted text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          {pageNum}
                        </button>
                      ))}
                    </div>

                    {/* Next Button */}
                    <Button
                      variant="outline"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="rounded-full px-4 text-xs font-sans font-semibold border-border/80 hover:bg-muted"
                    >
                      Next
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center justify-center py-24 text-center"
              >
                <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                  <CarIcon className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="mb-2 font-serif text-2xl font-semibold">
                  No cars found
                </h3>
                <p className="mb-6 max-w-md font-sans text-sm text-muted-foreground">
                  We couldn&apos;t find any vehicles matching your filters. Try
                  adjusting your search or browse all categories.
                </p>
                <Button
                  onClick={clearFilters}
                  className="rounded-full bg-accent px-6 font-sans text-sm font-semibold text-accent-foreground"
                >
                  View All Cars
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </main>

      <FooterSection />

      <BookingModal
        car={selectedCar}
        isOpen={isBookingOpen}
        onClose={handleCloseBooking}
      />

      <Toaster
        position="top-right"
        toastOptions={{ className: "font-sans" }}
        richColors
      />
    </>
  );
}
