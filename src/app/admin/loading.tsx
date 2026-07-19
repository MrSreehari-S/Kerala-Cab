import { LayoutDashboard, CarIcon, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function AdminLoading() {
  return (
    <div className="min-h-screen animate-pulse">
      {/* ── Top Bar Skeleton ── */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="section-container flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <LayoutDashboard className="h-5 w-5 text-accent opacity-50" />
            <div className="h-7 w-28 rounded-md bg-muted" />
            <Badge className="ml-2 border-accent/30 bg-accent/10 font-sans text-[10px] font-semibold text-accent opacity-50">
              Admin
            </Badge>
          </div>
          <div className="h-8 w-20 rounded-md bg-muted" />
        </div>
      </header>

      <main className="section-container py-8">
        {/* ── Tabs Bar Skeleton ── */}
        <div className="mb-8 flex gap-6 border-b border-border">
          <div className="h-8 w-32 border-b-2 border-accent bg-accent/10 rounded-t" />
          <div className="h-8 w-36 bg-muted/40 rounded-t" />
        </div>

        {/* ── Page Header Skeleton ── */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="h-8 w-48 rounded bg-muted" />
            <div className="mt-2 h-4 w-36 rounded bg-muted/60" />
          </div>
          <div className="h-10 w-32 rounded-full bg-accent/20" />
        </div>

        {/* ── Search Bar Skeleton ── */}
        <div className="mb-6">
          <div className="h-10 w-full max-w-sm rounded-lg bg-muted" />
        </div>

        {/* ── Table Loading Box ── */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Loader2 className="mb-3 h-8 w-8 animate-spin text-accent" />
            <p className="font-sans text-sm text-muted-foreground">
              Loading fleet inventory...
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
