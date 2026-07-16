"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { Menu, X, Phone } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const navLinks = [
  { label: "Fleet", href: "/fleet" },
  { label: "Why Us", href: "#why-us" },
  { label: "Testimonials", href: "#testimonials" },
  { label: "FAQ", href: "#faq" },
];

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? "bg-background/80 backdrop-blur-xl border-b border-border/50 shadow-sm"
          : "bg-transparent"
      }`}
    >
      <div className="section-container flex h-16 items-center justify-between md:h-20">
        {/* ── Logo ── */}
        <Link href="/" className="flex items-center">
          <Image
            src="/logo.jpeg"
            alt="KeralaCabs Logo"
            width={120}
            height={40}
            className="h-10 w-auto object-contain rounded-md"
            priority
          />
        </Link>

        {/* ── Desktop Navigation ── */}
        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={`font-sans text-sm font-medium tracking-wide transition-colors duration-200 hover:text-accent ${
                isScrolled ? "text-foreground/70" : "text-white/80"
              }`}
            >
              {link.label}
            </a>
          ))}
          <Button
            nativeButton={false}
            className="rounded-full bg-accent px-5 font-sans text-sm font-semibold text-accent-foreground transition-all duration-300 hover:bg-accent/90 hover:shadow-lg hover:shadow-accent/20"
            render={
              <a href="tel:+919847151674" />
            }
          >
            <Phone className="mr-1.5 h-3.5 w-3.5" />
            Book Now
          </Button>
        </nav>

        {/* ── Mobile Toggle ── */}
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className={`flex items-center justify-center rounded-lg p-2 transition-colors md:hidden ${
            isScrolled
              ? "text-foreground hover:bg-muted"
              : "text-white hover:bg-white/10"
          }`}
          aria-label="Toggle navigation menu"
        >
          {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* ── Mobile Menu ── */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden border-b border-border bg-background/95 backdrop-blur-xl md:hidden"
          >
            <nav className="section-container flex flex-col gap-1 py-4">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileOpen(false)}
                  className="rounded-lg px-4 py-3 font-sans text-sm font-medium text-foreground/80 transition-colors hover:bg-muted hover:text-accent"
                >
                  {link.label}
                </a>
              ))}
              <div className="mt-2 px-4">
                <Button
                  nativeButton={false}
                  className="w-full rounded-full bg-accent font-sans text-sm font-semibold text-accent-foreground"
                  render={
                    <a href="tel:+919847151674" />
                  }
                >
                  <Phone className="mr-1.5 h-3.5 w-3.5" />
                  Book Now
                </Button>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
