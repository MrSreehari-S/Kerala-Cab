"use client";

import { useEffect } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { ShieldAlert, RotateCcw, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[AdminError] Exception in admin portal:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-md space-y-6"
      >
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-amber-500/10 ring-1 ring-amber-500/20">
          <ShieldAlert className="h-10 w-10 text-amber-400" />
        </div>

        <div className="space-y-2">
          <span className="font-sans text-xs font-semibold uppercase tracking-[0.25em] text-accent">
            Admin Portal
          </span>
          <h1 className="font-serif text-3xl font-bold tracking-wide md:text-4xl">
            Dashboard Error
          </h1>
          <p className="font-sans text-sm text-muted-foreground">
            {error.message ||
              "An error occurred while communicating with the admin portal."}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
          <Button
            onClick={() => reset()}
            className="rounded-full bg-accent px-6 font-sans text-sm font-semibold text-accent-foreground hover:bg-accent/90"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Retry Connection
          </Button>
          <Button
            variant="outline"
            render={<Link href="/admin/login" />}
            nativeButton={false}
            className="rounded-full border-border/60 px-6 font-sans text-sm font-semibold hover:bg-muted"
          >
            <Lock className="mr-2 h-4 w-4" />
            Re-login
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
