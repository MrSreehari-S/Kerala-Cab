import { Loader2 } from "lucide-react";

export default function HomeLoading() {
  return (
    <div className="min-h-screen bg-background flex flex-col justify-between animate-pulse">
      {/* ── Navbar Skeleton ── */}
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="section-container flex h-20 items-center justify-between">
          <div className="h-10 w-32 rounded-md bg-muted" />
          <div className="hidden md:flex gap-8">
            <div className="h-4 w-16 rounded bg-muted/60" />
            <div className="h-4 w-16 rounded bg-muted/60" />
            <div className="h-4 w-16 rounded bg-muted/60" />
            <div className="h-4 w-16 rounded bg-muted/60" />
          </div>
          <div className="h-10 w-28 rounded-full bg-accent/20" />
        </div>
      </header>

      {/* ── Hero Skeleton ── */}
      <main className="flex-1 flex flex-col justify-center section-container py-20">
        <div className="mx-auto max-w-3xl text-center space-y-6">
          <div className="mx-auto h-4 w-40 rounded-full bg-accent/20" />
          <div className="mx-auto h-12 w-3/4 rounded-lg bg-muted" />
          <div className="mx-auto h-12 w-1/2 rounded-lg bg-muted" />
          <div className="mx-auto h-5 w-2/3 rounded bg-muted/60" />
          <div className="pt-6 flex justify-center gap-4">
            <div className="h-12 w-40 rounded-full bg-accent/30" />
            <div className="h-12 w-40 rounded-full bg-muted" />
          </div>
        </div>

        {/* Loading Indicator */}
        <div className="mt-16 flex flex-col items-center justify-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin text-accent" />
          <span className="font-sans text-xs uppercase tracking-widest text-muted-foreground">
            Preparing Experience...
          </span>
        </div>
      </main>

      {/* ── Footer Skeleton ── */}
      <footer className="border-t border-border py-8 bg-muted/20">
        <div className="section-container flex justify-between items-center">
          <div className="h-6 w-24 rounded bg-muted" />
          <div className="h-4 w-48 rounded bg-muted/60" />
        </div>
      </footer>
    </div>
  );
}
