import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Car, Home as HomeIcon, ArrowRight } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
      {/* Background ambient lighting */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,oklch(0.72_0.14_70/0.08),transparent_60%)]" />
      </div>

      <div className="max-w-md space-y-6">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-accent/10 border border-accent/20">
          <Car className="h-10 w-10 text-accent" />
        </div>

        <div className="space-y-2">
          <span className="font-sans text-xs font-semibold uppercase tracking-[0.25em] text-accent">
            404 — Page Not Found
          </span>
          <h1 className="font-serif text-4xl font-bold tracking-wide md:text-5xl">
            Off the beaten track
          </h1>
          <p className="font-sans text-sm text-muted-foreground">
            The page or vehicle reference you are looking for does not exist or has been moved.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
          <Button
            render={<Link href="/" />}
            nativeButton={false}
            className="rounded-full bg-accent px-6 font-sans text-sm font-semibold text-accent-foreground hover:bg-accent/90"
          >
            <HomeIcon className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
          <Button
            variant="outline"
            render={<Link href="/fleet" />}
            nativeButton={false}
            className="rounded-full border-border/60 px-6 font-sans text-sm font-semibold hover:bg-muted"
          >
            Explore Fleet
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
