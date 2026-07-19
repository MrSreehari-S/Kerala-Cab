"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useScroll, useTransform, motion, MotionValue } from "motion/react";
import { ArrowRight, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

/* ════════════════════════════════════════════════════════════
   CONFIGURATION
   Everything that changes between environments or content
   updates lives here. Nothing below this block should need
   editing for a normal content/asset change.

   ⚠️ Nothing in this file below "SCROLL / FRAME ENGINE" has been
   touched — frame loading, scroll math, and canvas drawing are
   byte-for-byte the same as before. Only presentational
   components (typography, chrome, decoration) were redesigned.
════════════════════════════════════════════════════════════ */

const TOTAL_FRAMES = 193;
const FRAME_EXT = "jpg";

/** Strip any trailing slash so we don't end up with `//` in paths. */
const stripTrailingSlash = (p: string) => p.replace(/\/+$/, "");

/**
 * Single source of truth for where frames live. Point this at your CDN in
 * production via env var; falls back to a local /public path for dev.
 *
 * One asset set is used for all viewports — at ~12MB total for the full
 * 197-frame sequence, a mobile-specific low-res variant isn't worth the
 * extra build/upload step. Revisit this only if the source frames get
 * meaningfully larger later.
 */
const BASE_PATH = stripTrailingSlash(
  process.env.NEXT_PUBLIC_FRAME_CDN_BASE ?? "/images/heroAnimation"
);

/**
 * How many frames we force-load in parallel before treating the sequence
 * as "usable". This is no longer about protecting a bandwidth quota (the
 * full sequence is ~12MB, served free via jsDelivr) — it's purely to avoid
 * firing 197 simultaneous image decodes on page load, which would jank the
 * main thread and delay interactivity on lower-end devices regardless of
 * network speed.
 */
const PRIORITY_FRAME_COUNT = 24;
/** Priority window shrinks to this on slow/metered connections, where
 *  round-trip latency (not just bandwidth) makes a large parallel batch
 *  costly. */
const PRIORITY_FRAME_COUNT_SLOW = 8;

const MAX_RETRIES_PER_FRAME = 2;
const RETRY_BASE_DELAY_MS = 700;

/** If we can't get any usable frame past this failure rate, show the fallback UI. */
const FAILURE_RATE_FOR_ERROR_STATE = 0.5;

const pad3 = (n: number) => String(n).padStart(3, "0");

function buildFramePath(basePath: string, index: number) {
  return `${basePath}/heroImg-${pad3(index + 1)}.${FRAME_EXT}`;
}

/* ════════════════════════════════════════════════════════════
   SMALL PLATFORM HELPERS
   Guarded so the component never throws on older browsers,
   SSR pre-hydration, or environments missing an API.
════════════════════════════════════════════════════════════ */

function isSlowConnection(): boolean {
  if (typeof navigator === "undefined") return false;
  const conn = (navigator as unknown as {
    connection?: { saveData?: boolean; effectiveType?: string };
  }).connection;
  if (!conn) return false;
  if (conn.saveData) return true;
  return /^(slow-2g|2g|3g)$/.test(conn.effectiveType ?? "");
}

function scheduleIdle(cb: () => void) {
  const ric = (window as unknown as {
    requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
  }).requestIdleCallback;
  if (typeof ric === "function") {
    ric(cb, { timeout: 2000 });
  } else {
    window.setTimeout(cb, 50);
  }
}

function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mql.matches);
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    // addEventListener is not present on very old Safari; guard it.
    if (mql.addEventListener) mql.addEventListener("change", handler);
    else if ("addListener" in mql) (mql as any).addListener(handler);
    return () => {
      if (mql.removeEventListener) mql.removeEventListener("change", handler);
      else if ("removeListener" in mql) (mql as any).removeListener(handler);
    };
  }, []);
  return reduced;
}

/** Walk outward from targetIndex to find the nearest frame that's actually
 *  decoded and ready to paint. Prevents flicker/blank canvas when the user
 *  scrolls ahead of what's loaded, or when an individual frame failed. */
function findNearestLoadedFrame(
  frames: ReadonlyArray<HTMLImageElement | null>,
  loaded: ReadonlyArray<boolean>,
  targetIndex: number
): HTMLImageElement | null {
  const total = frames.length;
  if (total === 0) return null;
  if (loaded[targetIndex] && frames[targetIndex]) return frames[targetIndex];

  for (let radius = 1; radius < total; radius++) {
    const left = targetIndex - radius;
    const right = targetIndex + radius;
    if (left >= 0 && loaded[left] && frames[left]) return frames[left];
    if (right < total && loaded[right] && frames[right]) return frames[right];
  }
  return null;
}

/* ════════════════════════════════════════════════════════════
   SCROLL / FRAME ENGINE — DO NOT MODIFY
   - Loads a small priority window eagerly (parallel).
   - Streams the remainder one-at-a-time during browser idle time
     so it never competes with priority frames or page interactivity.
   - Retries individual frame failures with backoff.
   - Never lets a handful of broken URLs break the whole sequence.
   - Fully cancellable on unmount (no setState-after-unmount, no
     dangling timers).
════════════════════════════════════════════════════════════ */

type LoadStatus = "loading" | "ready" | "degraded" | "error";

interface FrameSequenceHandle {
  status: LoadStatus;
  progress: number; // 0..1 across all frames, for the loading UI
  framesRef: React.MutableRefObject<Array<HTMLImageElement | null>>;
  loadedRef: React.MutableRefObject<boolean[]>;
}

function useFrameSequence(totalFrames: number, basePath: string): FrameSequenceHandle {
  const framesRef = useRef<Array<HTMLImageElement | null>>(
    new Array(totalFrames).fill(null)
  );
  const loadedRef = useRef<boolean[]>(new Array(totalFrames).fill(false));
  const [status, setStatus] = useState<LoadStatus>("loading");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (totalFrames <= 0 || !basePath) {
      setStatus("error");
      return;
    }

    let cancelled = false;
    framesRef.current = new Array(totalFrames).fill(null);
    loadedRef.current = new Array(totalFrames).fill(false);

    let loadedCount = 0;
    let failedCount = 0;
    let priorityResolved = 0;

    const priorityCount = Math.min(
      isSlowConnection() ? PRIORITY_FRAME_COUNT_SLOW : PRIORITY_FRAME_COUNT,
      totalFrames
    );

    const publishProgress = () => {
      if (cancelled) return;
      setProgress(Math.min(1, (loadedCount + failedCount) / totalFrames));
      if (priorityResolved >= priorityCount) {
        const overallFailureRate = (loadedCount + failedCount) / totalFrames > 0
          ? failedCount / (loadedCount + failedCount)
          : 0;
        if (loadedCount === 0 || overallFailureRate > FAILURE_RATE_FOR_ERROR_STATE) {
          setStatus("error");
        } else if (failedCount > 0) {
          setStatus("degraded");
        } else {
          setStatus("ready");
        }
      }
    };

    const loadFrame = (index: number, attempt = 0) => {
      if (cancelled) return;
      const img = new Image();
      // Hints the browser to decode off the main thread where possible.
      img.decoding = "async";

      const onSettled = (ok: boolean) => {
        if (cancelled) return;
        if (ok) {
          loadedRef.current[index] = true;
          framesRef.current[index] = img;
          loadedCount += 1;
        } else {
          failedCount += 1;
        }
        if (index < priorityCount) priorityResolved += 1;
        publishProgress();
      };

      img.onload = () => onSettled(true);
      img.onerror = () => {
        if (cancelled) return;
        if (attempt < MAX_RETRIES_PER_FRAME) {
          window.setTimeout(
            () => loadFrame(index, attempt + 1),
            RETRY_BASE_DELAY_MS * (attempt + 1)
          );
          return;
        }
        onSettled(false);
      };

      img.src = buildFramePath(basePath, index);
    };

    // Priority window: load in parallel immediately.
    for (let i = 0; i < priorityCount; i++) loadFrame(i);

    // Remainder: trickle in during idle time, one at a time.
    let cursor = priorityCount;
    const loadNext = () => {
      if (cancelled || cursor >= totalFrames) return;
      loadFrame(cursor);
      cursor += 1;
      scheduleIdle(loadNext);
    };
    if (cursor < totalFrames) scheduleIdle(loadNext);

    return () => {
      cancelled = true;
    };
  }, [totalFrames, basePath]);

  return { status, progress, framesRef, loadedRef };
}

/* ════════════════════════════════════════════════════════════
   STORY BEATS (content config — start/end scroll positions
   are part of the scroll choreography and are unchanged)
════════════════════════════════════════════════════════════ */

interface StoryBeat {
  label: string;
  category: string;
  title: string;
  sub: string;
  start: number;
  end: number;
  chips?: string[];
  statNumber?: string;
  statLabel?: string;
  highlightWord?: string;
}

const STORY_BEATS: StoryBeat[] = [
  {
    label: "LUXURY FLEET",
    category: "luxury",
    title: "Prestige &\nExecutive",
    highlightWord: "Luxury",
    sub: "Experience ultimate elegance with Mercedes, BMW, and Audi executive sedans.",
    start: 0.15,
    end: 0.35,
    chips: ["Mercedes S-Class", "BMW 7 Series", "Audi A8"],
    statNumber: "4.9★",
    statLabel: "VIP Rating",
  },
  {
    label: "WEDDING FLEET",
    category: "wedding",
    title: "Make Your Special\nDay",
    highlightWord: "Unforgettable",
    sub: "Decorated luxury fleets and vintage cars crafted for your grand entrance.",
    start: 0.40,
    end: 0.60,
    chips: ["Decorated Fleets", "Chauffeur Dressed", "Grand Entry"],
    statNumber: "100%",
    statLabel: "Punctuality",
  },
  {
    label: "SUV FLEET",
    category: "suv",
    title: "Commanding Power &\nSpacious",
    highlightWord: "SUVs",
    sub: "Unmatched comfort for group travels, hill stations, and long scenic routes.",
    start: 0.62,
    end: 0.82,
    chips: ["Toyota Fortuner", "Innova Crysta", "Mahindra Thar"],
    statNumber: "7+",
    statLabel: "Seater Options",
  },
  {
    label: "SEDAN FLEET",
    category: "sedan",
    title: "Smooth &\nEconomical",
    highlightWord: "Sedans",
    sub: "Reliable, fuel-efficient, and comfortable rides for city and intercity travel.",
    start: 0.85,
    end: 1.0,
    chips: ["Honda City", "Maruti Ciaz", "Hyundai Verna"],
    statNumber: "24/7",
    statLabel: "Availability",
  },
];

/* ════════════════════════════════════════════════════════════
   PRESENTATIONAL SUB-COMPONENTS — redesigned
   All motion inputs (scrollProgress, beat.start/end) are the
   exact same values the original used; only markup + styling
   changed.
════════════════════════════════════════════════════════════ */

function BeatOverlay({
  beat,
  index,
  scrollProgress,
  reducedMotion,
}: {
  beat: StoryBeat;
  index: number;
  scrollProgress: MotionValue<number>;
  reducedMotion: boolean;
}) {
  const isLeft = index % 2 === 0;

  // Smooth continuous scroll from bottom to top without pausing in the middle
  const cardOpacity = useTransform(
    scrollProgress,
    [beat.start, beat.start + 0.03, beat.end - 0.03, beat.end],
    [0, 1, 1, 0]
  );

  const cardY = useTransform(
    scrollProgress,
    [beat.start, beat.end],
    reducedMotion ? ["0vh", "0vh"] : ["75vh", "-55vh"]
  );

  const ghostOpacity = useTransform(
    scrollProgress,
    [beat.start, beat.start + 0.03, beat.end - 0.03, beat.end],
    [0, 0.5, 0.5, 0]
  );

  const chips = beat.chips || [];
  const highlightWord = beat.highlightWord || "";

  return (
    <motion.div
      style={{
        opacity: cardOpacity,
        position: "absolute",
        top: 0,
        bottom: 0,
        left: isLeft ? 0 : "auto",
        right: isLeft ? "auto" : 0,
        width: "100%",
        height: "100vh",
        pointerEvents: "none",
        zIndex: 15,
      }}
      className="max-w-[85vw] sm:max-w-[70vw] md:max-w-[30vw] px-4 sm:px-6 md:px-14"
    >
      {/* ── Directional legibility scrim ── */}
      <div
        aria-hidden
        className="absolute inset-y-0 pointer-events-none h-screen w-full md:w-[120%]"
        style={{
          left: isLeft ? 0 : "auto",
          right: isLeft ? "auto" : 0,
          background: isLeft
            ? "linear-gradient(90deg, rgba(5,5,5,0.85) 0%, rgba(5,5,5,0.55) 60%, rgba(5,5,5,0) 100%)"
            : "linear-gradient(270deg, rgba(5,5,5,0.85) 0%, rgba(5,5,5,0.55) 60%, rgba(5,5,5,0) 100%)",
        }}
      />

      {/* ── Scrolling content ── */}
      <motion.div
        style={{ y: cardY }}
        className="relative z-10 w-full py-8 flex flex-col gap-3 sm:gap-4 md:gap-5"
      >
        {/* Headline */}
        <h2 className="font-serif text-3xl sm:text-4xl md:text-[3.4rem] font-bold leading-[1.05] tracking-tight text-white whitespace-pre-line">
          {beat.title}{" "}
          {highlightWord && (
            <span className="text-gold-gradient italic font-light block sm:inline">
              {highlightWord}
            </span>
          )}
        </h2>

        {/* Subheading */}
        <p className="font-sans text-sm md:text-[15px] leading-relaxed text-zinc-300/90 max-w-sm">
          {beat.sub}
        </p>

        {/* Minimal inline detail row */}
        {chips.length > 0 && (
          <div className="font-sans text-[11px] uppercase tracking-[0.14em] text-zinc-400/80 leading-relaxed max-w-sm">
            {chips.join("   ·   ")}
          </div>
        )}

        {/* CTA row */}
        <div className="flex items-center gap-4 pt-1">
          <Link
            href={`/fleet?category=${beat.category}`}
            className="group inline-flex items-center gap-2 font-sans text-[11px] font-semibold uppercase tracking-[0.24em] text-white"
            style={{ pointerEvents: "auto" }}
          >
            <span
              className="flex items-center justify-center rounded-full transition-transform duration-300 group-hover:translate-x-0.5"
              style={{
                width: 26,
                height: 26,
                border: "1px solid rgba(255,255,255,0.35)",
              }}
            >
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path d="M1 5H9M9 5L5.5 1.5M9 5L5.5 8.5" stroke="#f4c066" strokeWidth="1.2" />
              </svg>
            </span>
            Explore {beat.category}
          </Link>

          {beat.statNumber && (
            <span className="font-sans text-[11px] text-zinc-400/80 tracking-wide">
              {beat.statNumber}{" "}
              <span className="uppercase tracking-[0.14em] text-zinc-500">
                {beat.statLabel}
              </span>
            </span>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

function ScrollIndicator({ reducedMotion }: { reducedMotion: boolean }) {
  return (
    <div
      className="absolute pointer-events-none flex flex-col items-center gap-2.5"
      style={{ bottom: 28, left: "50%", transform: "translateX(-50%)", zIndex: 20 }}
    >
      <span
        style={{
          color: "rgba(255,255,255,0.55)",
          fontSize: "0.6rem",
          letterSpacing: "0.28em",
          textTransform: "uppercase",
          fontFamily: "'Inter', sans-serif",
          fontWeight: 500,
        }}
      >
        Scroll
      </span>
      <div
        className="relative overflow-hidden"
        style={{ width: 1, height: 34, backgroundColor: "rgba(255,255,255,0.15)" }}
      >
        {reducedMotion ? (
          <div
            className="absolute top-0 left-0 w-full"
            style={{ height: "50%", backgroundColor: "#f4c066" }}
          />
        ) : (
          <motion.div
            className="absolute top-0 left-0 w-full"
            style={{ height: "40%", backgroundColor: "#f4c066" }}
            animate={{ y: ["-100%", "250%"] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "linear" }}
          />
        )}
      </div>
    </div>
  );
}

function FadingScrollIndicator({
  scrollProgress,
  reducedMotion,
}: {
  scrollProgress: MotionValue<number>;
  reducedMotion: boolean;
}) {
  const opacity = useTransform(scrollProgress, [0, 0.08], [1, 0]);
  return (
    <motion.div style={{ opacity }}>
      <ScrollIndicator reducedMotion={reducedMotion} />
    </motion.div>
  );
}

/** Minimal corner section counter — replaces the old frame-number HUD.
 *  Purely presentational; derives its value from the same scrollYProgress
 *  motion value the canvas already uses, no new scroll logic. */
function SectionCounter({
  scrollProgress,
  totalSections,
}: {
  scrollProgress: MotionValue<number>;
  totalSections: number;
}) {
  const sectionDisplay = useTransform(scrollProgress, (p) => {
    let idx = 0;
    for (let i = 0; i < STORY_BEATS.length; i++) {
      if (p >= STORY_BEATS[i].start) idx = i;
    }
    return idx + 1;
  });

  return (
    <div
      className="absolute pointer-events-none flex items-center gap-2"
      style={{ top: 28, right: 32, zIndex: 20 }}
      aria-hidden
    >
      <motion.span
        style={{
          color: "rgba(255,255,255,0.85)",
          fontFamily: "monospace",
          fontSize: "0.7rem",
          letterSpacing: "0.08em",
        }}
      >
        {sectionDisplay}
      </motion.span>
      <span style={{ width: 12, height: 1, backgroundColor: "rgba(255,255,255,0.3)" }} />
      <span
        style={{
          color: "rgba(255,255,255,0.35)",
          fontFamily: "monospace",
          fontSize: "0.7rem",
          letterSpacing: "0.08em",
        }}
      >
        0{totalSections}
      </span>
    </div>
  );
}

function LoadingScrim({ progress }: { progress: number }) {
  return (
    <div
      className="absolute inset-0 flex items-center justify-center"
      style={{ zIndex: 30, backgroundColor: "#050505" }}
      role="status"
      aria-live="polite"
    >
      <div className="flex flex-col items-center gap-4">
        <div
          style={{
            width: 26,
            height: 26,
            borderRadius: "50%",
            border: "1.5px solid rgba(244,192,102,0.2)",
            borderTopColor: "#f4c066",
            animation: "hero-spin 0.9s linear infinite",
          }}
        />
        <div className="flex flex-col items-center gap-1.5">
          <span
            style={{
              color: "#ffffff",
              fontFamily: "'Instrument Serif', Georgia, serif",
              fontSize: "1.1rem",
              fontStyle: "italic",
            }}
          >
            Kerala Cabs
          </span>
          <span
            style={{
              color: "rgba(255,255,255,0.4)",
              fontFamily: "'Inter', sans-serif",
              fontSize: "0.62rem",
              letterSpacing: "0.22em",
              textTransform: "uppercase",
            }}
          >
            {Math.round(progress * 100)}%
          </span>
        </div>
      </div>
      <style>{`@keyframes hero-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function FallbackHero() {
  return (
    <div
      className="absolute inset-0 flex items-center justify-center"
      style={{ backgroundColor: "#0a0a0a" }}
    >
      <div className="text-center px-6 max-w-lg">
        <span
          style={{
            color: "#f4c066",
            letterSpacing: "0.3em",
            fontFamily: "'Inter', sans-serif",
            fontSize: "0.68rem",
            fontWeight: 600,
            textTransform: "uppercase",
          }}
        >
          Kerala Cabs
        </span>
        <h1
          style={{
            marginTop: "0.9rem",
            fontSize: "clamp(2.2rem, 5vw, 3.8rem)",
            fontFamily: "'Instrument Serif', Georgia, serif",
            fontStyle: "italic",
            fontWeight: 400,
            color: "#ffffff",
            lineHeight: 1.05,
          }}
        >
          Where Every Road Tells a Story
        </h1>
        <p
          style={{
            marginTop: "1rem",
            color: "rgba(255,255,255,0.6)",
            fontFamily: "'Barlow', sans-serif",
            fontSize: "1rem",
            fontWeight: 300,
          }}
        >
          Premium chauffeur-driven cab services across Kerala's finest destinations.
        </p>
      </div>
    </div>
  );
}

function InitialHeroTitle({
  scrollProgress,
}: {
  scrollProgress: MotionValue<number>;
}) {
  // Reduces size and moves up to top header on scroll without fading away
  const y = useTransform(scrollProgress, [0, 0.25], ["0vh", "-5vh"]);
  const scale = useTransform(scrollProgress, [0, 0.25], [1, 0.70]);

  return (
    <motion.div
      style={{
        y,
        scale,
        transformOrigin: "center top",
        position: "absolute",
        inset: 0,
        zIndex: 25,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        pointerEvents: "none",
        textAlign: "center",
      }}
      className="px-4"
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 50% 50% at center, rgba(0,0,0,0.5) 40%, transparent 100%)",
        }}
      />

      <div className="relative z-10 flex flex-col items-center gap-3">
        <h1
          className="font-serif italic font-bold text-white tracking-tight leading-none drop-shadow-2xl"
          style={{
            fontSize: "clamp(3.5rem, 10vw, 9rem)",
            fontFamily: "'Instrument Serif', 'Playfair Display', Georgia, serif",
          }}
        >
          Kerala <span className="text-gold-gradient font-light">Cabs</span>
        </h1>
        <p className="font-sans text-xs sm:text-sm font-light tracking-[0.2em] text-zinc-300 uppercase mt-2">
          Chauffeur-Driven Luxury Fleet
        </p>

        {/* ── CTAs matching hero.tsx ── */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mt-4 pointer-events-auto">
          <Link href="/fleet">
            <Button
              className="group rounded-full bg-[#f4c066] px-8 py-3 font-sans text-sm font-semibold text-black transition-all duration-300 hover:bg-white hover:text-black hover:shadow-xl hover:shadow-[#f4c066]/20 h-auto"
            >
              Browse Our Fleet
              <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Button>
          </Link>

          <Button
            variant="outline"
            className="rounded-full border-white/20 px-8 py-3 font-sans text-sm text-white bg-black/60 backdrop-blur-md transition-all duration-300 hover:border-[#f4c066]/50 hover:bg-white/10 h-auto"
            render={
              <a
                href="https://wa.me/918848228458?text=Hello%20KeralaCabs,%20I%20would%20like%20to%20enquire%20about%20a%20car%20rental."
                target="_blank"
                rel="noopener noreferrer"
              />
            }
          >
            <Phone className="mr-2 h-4 w-4 text-[#f4c066]" />
            Contact Concierge
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

export function HeroLanding() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const currentFrameRef = useRef(0);
  const rafRef = useRef<number | null>(null);

  const [canvasSupported, setCanvasSupported] = useState(true);
  const reducedMotion = useReducedMotion();

  const { status, progress, framesRef, loadedRef } = useFrameSequence(
    TOTAL_FRAMES,
    BASE_PATH
  );

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || typeof canvas.getContext !== "function" || !canvas.getContext("2d")) {
      setCanvasSupported(false);
    }
  }, []);

  const drawFrame = useCallback(
    (progressValue: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = ctxRef.current ?? canvas.getContext("2d");
      if (!ctx) return;
      ctxRef.current = ctx;

      const frameIndex = Math.min(
        Math.max(Math.floor(progressValue * (TOTAL_FRAMES - 1)), 0),
        TOTAL_FRAMES - 1
      );

      if (frameIndex === currentFrameRef.current && progressValue !== 0) return;

      const img = findNearestLoadedFrame(
        framesRef.current,
        loadedRef.current,
        frameIndex
      );
      if (!img || !img.naturalWidth) return;

      currentFrameRef.current = frameIndex;

      if (canvas.width !== img.naturalWidth || canvas.height !== img.naturalHeight) {
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
      }
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    },
    [framesRef, loadedRef]
  );

  useEffect(() => {
    if (status !== "loading" && status !== "ready" && status !== "degraded") return;
    drawFrame(0);
  }, [status, progress, drawFrame]);

  useEffect(() => {
    const unsubscribe = scrollYProgress.on("change", (latest) => {
      if (typeof document !== "undefined" && document.hidden) return;
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => drawFrame(latest));
    });
    return () => {
      unsubscribe();
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [scrollYProgress, drawFrame]);

  const showLoadingScrim = status === "loading" && progress < 1 && currentFrameRef.current === 0;
  const showFallback = !canvasSupported || status === "error";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Playfair+Display:ital,wght@0,600;0,700;1,600;1,700&family=Barlow:wght@300;400;500;600&family=Inter:wght@300;400;500;600&display=swap');

        .text-gold-gradient {
          background: linear-gradient(135deg, #ffffff 0%, #f4c066 50%, #d49a37 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
      `}</style>

      <div ref={containerRef} style={{ height: "400vh", position: "relative" }}>
        <div
          style={{
            position: "sticky",
            top: 0,
            height: "100vh",
            width: "100%",
            overflow: "hidden",
            backgroundColor: "#050505",
          }}
          role="img"
          aria-label="Scroll-driven showcase of Kerala Cabs premium chauffeur services across Kerala's landscapes and destinations"
        >
          {showFallback ? (
            <FallbackHero />
          ) : (
            <>
              <canvas
                ref={canvasRef}
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                }}
              />

              {showLoadingScrim && <LoadingScrim progress={progress} />}

              <div
                aria-hidden
                style={{
                  position: "absolute",
                  inset: 0,
                  zIndex: 1,
                  pointerEvents: "none",
                  mixBlendMode: "overlay",
                  opacity: 0.035,
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)'/%3E%3C/svg%3E")`,
                  backgroundSize: "200px 200px",
                }}
              />

              <InitialHeroTitle scrollProgress={scrollYProgress} />

              <div style={{ position: "absolute", inset: 0, zIndex: 10, pointerEvents: "none" }}>
                {STORY_BEATS.map((beat, index) => (
                  <BeatOverlay
                    key={beat.label}
                    beat={beat}
                    index={index}
                    scrollProgress={scrollYProgress}
                    reducedMotion={reducedMotion}
                  />
                ))}
              </div>

              <SectionCounter scrollProgress={scrollYProgress} totalSections={STORY_BEATS.length} />

              <FadingScrollIndicator
                scrollProgress={scrollYProgress}
                reducedMotion={reducedMotion}
              />
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default HeroLanding;