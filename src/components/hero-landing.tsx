"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useScroll, useTransform, motion, MotionValue } from "motion/react";

/* ════════════════════════════════════════════════════════════
   CONFIGURATION
   Everything that changes between environments or content
   updates lives here. Nothing below this block should need
   editing for a normal content/asset change.
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
   FRAME SEQUENCE LOADER (hook)
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
   STORY BEATS (content config — unchanged from original)
════════════════════════════════════════════════════════════ */

interface StoryBeat {
  label: string;
  title: string;
  sub: string;
  start: number;
  end: number;
}

const STORY_BEATS: StoryBeat[] = [
  {
    label: "EXPERIENCE",
    title: "Where Every\nRoad Tells a Story",
    sub: "Premium cab services across God's Own Country",
    start: 0.0,
    end: 0.22,
  },
  {
    label: "COMFORT",
    title: "Luxury Rides,\nMemorable Journeys",
    sub: "Chauffeur-driven excellence through Kerala's landscapes",
    start: 0.24,
    end: 0.46,
  },
  {
    label: "DESTINATIONS",
    title: "Munnar · Alleppey\nWayanad · Kovalam",
    sub: "Every destination, one seamless booking away",
    start: 0.5,
    end: 0.72,
  },
  {
    label: "BOOK NOW",
    title: "Your Kerala\nAdventure Awaits",
    sub: "Transparent pricing · 24/7 support · Instant confirmation",
    start: 0.76,
    end: 1.0,
  },
];

/* ════════════════════════════════════════════════════════════
   PRESENTATIONAL SUB-COMPONENTS
════════════════════════════════════════════════════════════ */

function BeatProgressBar({
  scrollProgress,
  beat,
}: {
  scrollProgress: MotionValue<number>;
  beat: StoryBeat;
}) {
  const scaleX = useTransform(scrollProgress, [beat.start, beat.end], [0, 1]);
  return (
    <div
      className="mt-8 overflow-hidden rounded-full"
      style={{ height: 1, width: 96, backgroundColor: "rgba(255,255,255,0.15)" }}
    >
      <motion.div
        style={{ scaleX, transformOrigin: "left", backgroundColor: "#f4c066" }}
        className="h-full w-full rounded-full"
      />
    </div>
  );
}

function BeatOverlay({
  beat,
  scrollProgress,
  reducedMotion,
}: {
  beat: StoryBeat;
  scrollProgress: MotionValue<number>;
  reducedMotion: boolean;
}) {
  const mid = (beat.start + beat.end) / 2;
  const fadeInEnd = beat.start + (mid - beat.start) * 0.4;
  const fadeOutStart = mid + (beat.end - mid) * 0.6;

  const opacity = useTransform(
    scrollProgress,
    [beat.start, fadeInEnd, fadeOutStart, beat.end],
    [0, 1, 1, 0]
  );
  // Reduced-motion users still get the scroll-linked crossfade (it's driven
  // by their own input, not autoplay) but we drop the vertical travel.
  const y = useTransform(
    scrollProgress,
    [beat.start, fadeInEnd, fadeOutStart, beat.end],
    reducedMotion ? [0, 0, 0, 0] : [44, 0, 0, -44]
  );
  const labelOpacity = useTransform(scrollProgress, [beat.start, fadeInEnd], [0, 1]);
  const labelX = useTransform(
    scrollProgress,
    [beat.start, fadeInEnd],
    reducedMotion ? [0, 0] : [-20, 0]
  );

  return (
    <motion.div
      style={{
        opacity,
        y,
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        pointerEvents: "none",
        paddingBottom: "clamp(3rem, 8vh, 6rem)",
        paddingLeft: "clamp(2rem, 6vw, 6rem)",
        paddingRight: "clamp(2rem, 6vw, 6rem)",
      }}
    >
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.2) 45%, transparent 100%)",
        }}
      />
      <div className="relative z-10" style={{ maxWidth: 680 }}>
        <motion.span
          style={{
            opacity: labelOpacity,
            x: labelX,
            color: "#f4c066",
            letterSpacing: "0.28em",
            fontFamily: "'Inter', system-ui, sans-serif",
            fontSize: "0.7rem",
            fontWeight: 600,
            textTransform: "uppercase",
            display: "inline-block",
            marginBottom: "1rem",
          }}
        >
          {beat.label}
        </motion.span>

        <h2
          style={{
            fontSize: "clamp(2rem, 5.5vw, 4.5rem)",
            fontFamily: "'Playfair Display', Georgia, serif",
            fontWeight: 700,
            color: "#ffffff",
            whiteSpace: "pre-line",
            lineHeight: 1.05,
            margin: 0,
            textShadow: "0 2px 40px rgba(0,0,0,0.5)",
          }}
        >
          {beat.title}
        </h2>

        <p
          style={{
            marginTop: "1rem",
            fontSize: "clamp(0.9rem, 1.6vw, 1.15rem)",
            fontFamily: "'Inter', system-ui, sans-serif",
            fontWeight: 300,
            color: "rgba(255,255,255,0.68)",
            letterSpacing: "0.01em",
          }}
        >
          {beat.sub}
        </p>

        <BeatProgressBar scrollProgress={scrollProgress} beat={beat} />
      </div>
    </motion.div>
  );
}

function ScrollIndicator({ reducedMotion }: { reducedMotion: boolean }) {
  return (
    <div
      className="absolute pointer-events-none flex flex-col items-center gap-2"
      style={{ bottom: 32, left: "50%", transform: "translateX(-50%)", zIndex: 20 }}
    >
      <span
        style={{
          color: "rgba(255,255,255,0.35)",
          fontSize: "0.6rem",
          letterSpacing: "0.25em",
          textTransform: "uppercase",
          fontFamily: "'Inter', system-ui, sans-serif",
        }}
      >
        Scroll
      </span>
      <div
        className="relative overflow-hidden rounded-full"
        style={{ width: 1, height: 40, backgroundColor: "rgba(255,255,255,0.15)" }}
      >
        {reducedMotion ? (
          // Static hint instead of a looping animation.
          <div
            className="absolute top-0 left-0 w-full rounded-full"
            style={{ height: "50%", backgroundColor: "rgba(255,255,255,0.7)" }}
          />
        ) : (
          <motion.div
            className="absolute top-0 left-0 w-full rounded-full"
            style={{ height: "50%", backgroundColor: "rgba(255,255,255,0.7)" }}
            animate={{ y: ["-100%", "200%"] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: "linear" }}
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

function FrameHud({
  frameNum,
  totalFrames,
}: {
  frameNum: MotionValue<number>;
  totalFrames: number;
}) {
  return (
    <div
      className="absolute pointer-events-none flex items-center gap-1.5"
      style={{ top: 24, right: 32, zIndex: 20 }}
      aria-hidden
    >
      <span
        style={{
          color: "rgba(255,255,255,0.25)",
          fontFamily: "monospace",
          fontSize: "0.62rem",
          letterSpacing: "0.14em",
        }}
      >
        FRAME
      </span>
      <motion.span
        style={{
          color: "rgba(255,255,255,0.45)",
          fontFamily: "monospace",
          fontSize: "0.72rem",
          letterSpacing: "0.08em",
        }}
      >
        {frameNum}
      </motion.span>
      <span
        style={{
          color: "rgba(255,255,255,0.18)",
          fontFamily: "monospace",
          fontSize: "0.62rem",
          letterSpacing: "0.08em",
        }}
      >
        / {totalFrames}
      </span>
    </div>
  );
}

/** Shown until the priority frame window is decoded. Keeps the hero from
 *  flashing blank/black on first paint or slow connections. */
function LoadingScrim({ progress }: { progress: number }) {
  return (
    <div
      className="absolute inset-0 flex items-center justify-center"
      style={{
        zIndex: 30,
        background:
          "linear-gradient(135deg, #0a0a0a 0%, #171310 50%, #0a0a0a 100%)",
      }}
      role="status"
      aria-live="polite"
    >
      <div className="flex flex-col items-center gap-3">
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: "50%",
            border: "2px solid rgba(244,192,102,0.2)",
            borderTopColor: "#f4c066",
            animation: "hero-spin 0.9s linear infinite",
          }}
        />
        <span
          style={{
            color: "rgba(255,255,255,0.4)",
            fontFamily: "'Inter', system-ui, sans-serif",
            fontSize: "0.7rem",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
          }}
        >
          Loading {Math.round(progress * 100)}%
        </span>
      </div>
      <style>{`@keyframes hero-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

/** Shown if the sequence fails outright (bad CDN path, offline, everything
 *  404s, etc). The page stays usable and on-brand instead of a broken canvas. */
function FallbackHero() {
  return (
    <div
      className="absolute inset-0 flex items-center justify-center"
      style={{
        background:
          "radial-gradient(circle at 30% 20%, #221c14 0%, #0a0a0a 70%)",
      }}
    >
      <div style={{ maxWidth: 560, padding: "0 2rem", textAlign: "center" }}>
        <span
          style={{
            color: "#f4c066",
            letterSpacing: "0.28em",
            fontFamily: "'Inter', system-ui, sans-serif",
            fontSize: "0.7rem",
            fontWeight: 600,
            textTransform: "uppercase",
          }}
        >
          Kerala Cabs
        </span>
        <h1
          style={{
            marginTop: "1rem",
            fontSize: "clamp(2rem, 5vw, 3.5rem)",
            fontFamily: "'Playfair Display', Georgia, serif",
            fontWeight: 700,
            color: "#ffffff",
            lineHeight: 1.1,
          }}
        >
          Where Every Road Tells a Story
        </h1>
        <p
          style={{
            marginTop: "1rem",
            color: "rgba(255,255,255,0.6)",
            fontFamily: "'Inter', system-ui, sans-serif",
            fontSize: "1rem",
          }}
        >
          Premium chauffeur-driven cab services across Kerala.
        </p>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   MAIN COMPONENT
════════════════════════════════════════════════════════════ */

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

  const frameNumDisplay = useTransform(scrollYProgress, (p) =>
    Math.min(Math.round(p * TOTAL_FRAMES) + 1, TOTAL_FRAMES)
  );

  // Detect canvas support once on mount (fails gracefully on ancient/locked-
  // down browsers rather than throwing on ctx.drawImage).
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
      if (!img || !img.naturalWidth) return; // nothing usable yet — keep last paint

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

  // Paint the very first available frame as soon as it lands, so there's
  // something on screen before the user starts scrolling.
  useEffect(() => {
    if (status !== "loading" && status !== "ready" && status !== "degraded") return;
    drawFrame(0);
  }, [status, progress, drawFrame]);

  // Scroll → canvas frame draw, throttled to animation frames and paused
  // when the tab isn't visible (saves battery/CPU on background tabs).
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
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,800;1,700&family=Inter:wght@300;400;600&display=swap');
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

              <div style={{ position: "absolute", inset: 0, zIndex: 10, pointerEvents: "none" }}>
                {STORY_BEATS.map((beat) => (
                  <BeatOverlay
                    key={beat.label}
                    beat={beat}
                    scrollProgress={scrollYProgress}
                    reducedMotion={reducedMotion}
                  />
                ))}
              </div>

              <div
                style={{
                  position: "absolute",
                  top: 24,
                  left: 32,
                  zIndex: 20,
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  pointerEvents: "none",
                }}
              >
                <div
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    backgroundColor: "#f4c066",
                    boxShadow: "0 0 10px #f4c066aa",
                  }}
                />
                <span
                  style={{
                    color: "rgba(255,255,255,0.88)",
                    fontFamily: "'Inter', system-ui, sans-serif",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    letterSpacing: "0.2em",
                    textTransform: "uppercase",
                  }}
                >
                  Kerala Cabs
                </span>
              </div>

              <FrameHud frameNum={frameNumDisplay} totalFrames={TOTAL_FRAMES} />

              <FadingScrollIndicator
                scrollProgress={scrollYProgress}
                reducedMotion={reducedMotion}
              />

              <div
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: 2,
                  backgroundColor: "rgba(255,255,255,0.07)",
                  zIndex: 20,
                }}
              >
                <motion.div
                  style={{
                    height: "100%",
                    backgroundColor: "#f4c066",
                    scaleX: scrollYProgress,
                    transformOrigin: "left",
                  }}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default HeroLanding;