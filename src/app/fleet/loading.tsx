import { Loader2 } from "lucide-react";

export default function FleetLoading() {
  return (
    <div className="min-h-screen bg-background pt-20 animate-pulse">
      {/* ── Hero Header Skeleton ── */}
      <section className="relative overflow-hidden bg-primary/90 py-16 text-primary-foreground md:py-24">
        <div className="section-container text-center space-y-4">
          <div className="mx-auto h-4 w-36 rounded-full bg-accent/30" />
          <div className="mx-auto h-12 w-64 rounded bg-primary-foreground/20 md:w-96" />
          <div className="mx-auto h-4 w-80 rounded bg-primary-foreground/10" />
        </div>
      </section>

      {/* ── Category Filter Pills Skeleton ── */}
      <section className="pt-12 pb-4">
        <div className="section-container flex flex-wrap justify-center gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-10 w-24 rounded-full bg-muted border border-border/40"
            />
          ))}
        </div>
      </section>

      {/* ── Search Bar Skeleton ── */}
      <section className="border-b border-border py-4 bg-background/80">
        <div className="section-container flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="h-10 w-full max-w-sm rounded-lg bg-muted" />
          <div className="h-10 w-44 rounded-lg bg-muted" />
        </div>
      </section>

      {/* ── Fleet Grid Skeleton ── */}
      <section className="section-container py-12">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl border border-border bg-card p-4 space-y-4"
            >
              <div className="h-44 w-full rounded-lg bg-muted" />
              <div className="h-5 w-3/4 rounded bg-muted" />
              <div className="h-4 w-1/2 rounded bg-muted/60" />
              <div className="flex justify-between items-center pt-2">
                <div className="h-6 w-20 rounded bg-accent/20" />
                <div className="h-9 w-24 rounded-full bg-muted" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
