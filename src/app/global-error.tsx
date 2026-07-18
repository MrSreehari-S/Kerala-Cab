"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[GlobalError] Root layout exception:", error);
  }, [error]);

  return (
    <html lang="en">
      <body className="flex min-h-screen items-center justify-center bg-neutral-950 font-sans text-neutral-100 p-4 text-center">
        <div className="max-w-md space-y-6 rounded-2xl border border-neutral-800 bg-neutral-900/80 p-8 backdrop-blur-xl">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 ring-1 ring-red-500/20 text-red-400">
            ⚠️
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Application Error
            </h1>
            <p className="text-xs text-neutral-400">
              A critical error occurred while initializing the application layout.
            </p>
          </div>
          <button
            onClick={() => reset()}
            className="w-full rounded-full bg-amber-500 py-3 font-semibold text-neutral-950 transition hover:bg-amber-400 text-sm"
          >
            Refresh Application
          </button>
        </div>
      </body>
    </html>
  );
}
