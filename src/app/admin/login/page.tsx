"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Lock, Mail, Loader2, ShieldAlert, Clock } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Rate-limit countdown state
  const [lockedUntil, setLockedUntil] = useState<number | null>(null); // ms timestamp
  const [countdown, setCountdown] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const isLocked = lockedUntil !== null && Date.now() < lockedUntil;

  // Run the countdown ticker whenever the form is locked
  useEffect(() => {
    if (!lockedUntil) return;

    const tick = () => {
      const remaining = Math.max(0, Math.ceil((lockedUntil - Date.now()) / 1000));
      setCountdown(remaining);
      if (remaining <= 0) {
        setLockedUntil(null);
        setError("");
        if (timerRef.current) clearInterval(timerRef.current);
      }
    };

    tick(); // immediate first tick
    timerRef.current = setInterval(tick, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [lockedUntil]);

  const formatCountdown = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return m > 0 ? `${m}m ${s}s` : `${s}s`;
  };

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (isLocked) return;

      setError("");
      setLoading(true);

      try {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        const data = await res.json();

        if (res.status === 429) {
          // Rate-limited — lock the form for retryAfter seconds
          const waitSecs: number = data.retryAfter ?? 60;
          setLockedUntil(Date.now() + waitSecs * 1000);
          setError(data.error ?? "Too many attempts. Please wait.");
          return;
        }

        if (!res.ok) {
          setError(data.error || "Login failed. Check your credentials.");
          return;
        }

        router.push("/admin");
        router.refresh();
      } catch {
        setError("Network error. Please check your connection.");
      } finally {
        setLoading(false);
      }
    },
    [email, password, isLocked, router]
  );

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      {/* Background decorations */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,oklch(0.72_0.14_70/0.08),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_70%,oklch(0.72_0.14_70/0.05),transparent_50%)]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        {/* Glass card */}
        <div className="rounded-2xl border border-border/50 bg-card/60 p-8 backdrop-blur-xl shadow-2xl shadow-black/20">
          {/* Logo */}
          <div className="mb-8 flex flex-col items-center text-center">
            <Image
              src="/logo.jpeg"
              alt="KeralaCabs Logo"
              width={160}
              height={53}
              className="h-14 w-auto object-contain rounded-md mb-2"
              priority
            />
            <p className="font-sans text-xs uppercase tracking-widest text-accent font-semibold">
              Admin Dashboard
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="font-sans text-xs font-medium uppercase tracking-wider text-muted-foreground"
              >
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@keralacabs.com"
                  value={email}
                  onChange={(e) => setEmail((e.target as HTMLInputElement).value)}
                  className="pl-10 font-sans"
                  disabled={isLocked || loading}
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label
                htmlFor="password"
                className="font-sans text-xs font-medium uppercase tracking-wider text-muted-foreground"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) =>
                    setPassword((e.target as HTMLInputElement).value)
                  }
                  className="pl-10 font-sans"
                  disabled={isLocked || loading}
                  required
                />
              </div>
            </div>

            {/* Error / Rate-limit banner */}
            <AnimatePresence mode="wait">
              {isLocked ? (
                <motion.div
                  key="locked"
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="flex items-start gap-3 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3"
                >
                  <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
                  <div className="flex-1 font-sans text-sm">
                    <p className="font-semibold text-amber-300">
                      Account temporarily locked
                    </p>
                    <p className="mt-0.5 text-xs text-amber-200/70">
                      Too many failed attempts. Try again in{" "}
                      <span className="inline-flex items-center gap-1 font-mono font-bold text-amber-300">
                        <Clock className="h-3 w-3" />
                        {formatCountdown(countdown)}
                      </span>
                    </p>
                  </div>
                </motion.div>
              ) : error ? (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-2.5 font-sans text-sm text-destructive"
                >
                  {error}
                </motion.div>
              ) : null}
            </AnimatePresence>

            {/* Submit */}
            <Button
              type="submit"
              disabled={loading || isLocked}
              className="w-full rounded-full bg-accent py-3 font-sans text-sm font-semibold text-accent-foreground transition-all duration-300 hover:bg-accent/90 hover:shadow-lg hover:shadow-accent/20 h-auto disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in…
                </>
              ) : isLocked ? (
                <>
                  <Clock className="mr-2 h-4 w-4" />
                  Locked — {formatCountdown(countdown)}
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          <p className="mt-6 text-center font-sans text-xs text-muted-foreground/60">
            Protected area • Authorized personnel only
          </p>
        </div>
      </motion.div>
    </div>
  );
}
