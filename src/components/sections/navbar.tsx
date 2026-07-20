"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { Menu, X, Phone } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const navLinks = [
  { label: "Fleet", href: "/fleet" },
  { label: "Why Us", href: "/#why-us" },
  { label: "Testimonials", href: "/#testimonials" },
  { label: "FAQ", href: "/#faq" },
  { label: "Contact", href: "/contact" },
];

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="fixed top-0 left-0 right-0 z-50 px-3 pt-3 pb-2 transition-all duration-500 pointer-events-none"
    >
      <div
        className={`pointer-events-auto mx-auto flex items-center justify-between rounded-full transition-all duration-500 relative ${
          isScrolled
            ? "max-w-4xl px-5 py-2 bg-black/40 backdrop-blur-2xl backdrop-saturate-180 border border-white/15 "
            : "max-w-6xl px-6 py-2.5 bg-black/20 backdrop-blur-xl backdrop-saturate-150 border border-white/10 "
        }`}
      >
        {/* Specular Light / Top Glass Highlight */}
        <div
          className="absolute inset-x-8 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none rounded-full"
          aria-hidden
        />

        {/* ── Logo ── */}
        <Link
          href="/"
          className="group flex items-center gap-2.5 relative z-10 transition-transform duration-300 hover:scale-105"
        >
          <div className="relative">
            <div className="absolute -inset-1 rounded-lg bg-gradient-to-r from-amber-500/20 to-amber-300/0 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <Image
              src="/images/logo-nobg.webp"
              alt="KeralaCabs Logo"
              width={85}
              height={85}
              className="h-9 md:h-11 w-auto relative z-10 drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]"
              priority
            />
          </div>
          <span className="font-serif italic font-semibold text-lg md:text-xl text-white tracking-tight leading-none hidden sm:inline-block">
            Kerala <span className="text-gold-gradient font-light">Cabs</span>
          </span>
        </Link>

        {/* ── Desktop Navigation Links (Glass Bar Capsule) ── */}
        <nav
          className="hidden items-center gap-1 md:flex relative z-10 bg-white/[0.04] p-1 rounded-full border border-white/10 shadow-inner"
          onMouseLeave={() => setHoveredIndex(null)}
        >
          {navLinks.map((link, idx) => (
            <Link
              key={link.href}
              href={link.href}
              onMouseEnter={() => setHoveredIndex(idx)}
              className="relative px-4 py-1.5 font-sans text-xs uppercase tracking-widest font-medium text-white/80 transition-colors duration-200 hover:text-white"
            >
              {hoveredIndex === idx && (
                <motion.div
                  layoutId="navbar-hover-pill"
                  className="absolute inset-0 rounded-full bg-white/15 backdrop-blur-md border border-white/20"
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              )}
              <span className="relative z-10">{link.label}</span>
            </Link>
          ))}
        </nav>

        {/* ── Desktop CTA Button ── */}
        <div className="hidden md:flex items-center gap-3 relative z-10">
          <Button
            nativeButton={false}
            className="group relative overflow-hidden rounded-full bg-gradient-to-r from-[#f4c066] via-[#e5b053] to-[#d49a37] px-6 py-2 font-sans text-xs font-semibold uppercase tracking-wider text-black transition-all duration-300 hover:shadow-[0_0_20px_rgba(244,192,102,0.4)] hover:scale-105 border border-amber-200/40"
            render={<Link href="/contact" />}
          >
            <span className="absolute inset-0 bg-white/30 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
            <span className="relative z-10 flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5 fill-black/20" />
              Book Now
            </span>
          </Button>
        </div>

        {/* ── Mobile Toggle Button ── */}
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="relative z-10 flex items-center justify-center rounded-full p-2 text-white/90 bg-white/10 border border-white/15 transition-all hover:bg-white/20 md:hidden"
          aria-label="Toggle navigation menu"
        >
          {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* ── Mobile Menu Dropdown ── */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="pointer-events-auto mx-auto mt-2 max-w-sm overflow-hidden rounded-2xl border border-white/15 bg-black/80 backdrop-blur-2xl p-4 shadow-2xl md:hidden"
          >
            <nav className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileOpen(false)}
                  className="rounded-xl px-4 py-2.5 font-sans text-sm font-medium text-white/90 transition-all hover:bg-white/10 hover:text-white hover:pl-6"
                >
                  {link.label}
                </Link>
              ))}
              <div className="mt-2 pt-2 border-t border-white/10">
                <Button
                  nativeButton={false}
                  className="w-full rounded-xl bg-gradient-to-r from-[#f4c066] to-[#d49a37] py-2.5 font-sans text-sm font-semibold text-black shadow-lg"
                  render={<Link href="/contact" />}
                >
                  <Phone className="mr-2 h-4 w-4" />
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
