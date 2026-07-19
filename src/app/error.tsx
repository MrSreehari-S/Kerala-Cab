"use client";

import { useEffect } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { AlertCircle, RotateCcw, Home as HomeIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log unexpected errors for diagnostic purposes
    console.error("[RootError] Caught unhandled exception:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
      {/* Background radial gradient */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,oklch(0.72_0.14_70/0.05),transparent_60%)]" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-md space-y-6"
      >
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10 ring-1 ring-destructive/20">
          <AlertCircle className="h-10 w-10 text-destructive" />
        </div>

        <div className="space-y-2">
          <span className="font-sans text-xs font-semibold uppercase tracking-[0.25em] text-accent">
            Unexpected Error
          </span>
          <h1 className="font-serif text-3xl font-bold tracking-wide md:text-4xl">
            Something went wrong
          </h1>
          <p className="font-sans text-sm text-muted-foreground">
            {error.message ||
              "An unexpected error occurred. Our team has been notified."}
          </p>
          {error.digest && (
            <p className="font-mono text-[11px] text-muted-foreground/60">
              Error Digest: {error.digest}
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
          <Button
            onClick={() => reset()}
            className="rounded-full bg-accent px-6 font-sans text-sm font-semibold text-accent-foreground hover:bg-accent/90"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
          <Button
            variant="outline"
            render={<Link href="/" />}
            nativeButton={false}
            className="rounded-full border-border/60 px-6 font-sans text-sm font-semibold hover:bg-muted"
          >
            <HomeIcon className="mr-2 h-4 w-4" />
            Return Home
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
