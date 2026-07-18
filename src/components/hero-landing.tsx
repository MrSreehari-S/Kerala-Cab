"use client";

import { useEffect, useRef } from "react";
import { useScroll, useTransform, motion, MotionValue } from "motion/react";

/* ─────────────────────────────────────────────
   CONFIGURATION
───────────────────────────────────────────── */
const TOTAL_FRAMES = 287;
const BASE_PATH = "/images/heroAnimation";

const pad = (n: number) => String(n).padStart(3, "0");

const framePaths: string[] = Array.from(
  { length: TOTAL_FRAMES },
  (_, i) => `${BASE_PATH}/ezgif-frame-${pad(i + 1)}.jpg`
);

/* ─────────────────────────────────────────────
   TYPES
───────────────────────────────────────────── */
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

/* ─────────────────────────────────────────────
   BEAT PROGRESS BAR (isolated so hook is at top level)
───────────────────────────────────────────── */
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

/* ─────────────────────────────────────────────
   SINGLE STORY BEAT OVERLAY
───────────────────────────────────────────── */
function BeatOverlay({
  beat,
  scrollProgress,
}: {
  beat: StoryBeat;
  scrollProgress: MotionValue<number>;
}) {
  const mid = (beat.start + beat.end) / 2;
  const fadeInEnd = beat.start + (mid - beat.start) * 0.4;
  const fadeOutStart = mid + (beat.end - mid) * 0.6;

  const opacity = useTransform(
    scrollProgress,
    [beat.start, fadeInEnd, fadeOutStart, beat.end],
    [0, 1, 1, 0]
  );
  const y = useTransform(
    scrollProgress,
    [beat.start, fadeInEnd, fadeOutStart, beat.end],
    [44, 0, 0, -44]
  );
  const labelOpacity = useTransform(
    scrollProgress,
    [beat.start, fadeInEnd],
    [0, 1]
  );
  const labelX = useTransform(scrollProgress, [beat.start, fadeInEnd], [-20, 0]);

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
      {/* Bottom gradient vignette */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.2) 45%, transparent 100%)",
        }}
      />

      <div className="relative z-10" style={{ maxWidth: 680 }}>
        {/* Category label */}
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

        {/* Main headline */}
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

        {/* Sub-headline */}
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

/* ─────────────────────────────────────────────
   SCROLL INDICATOR
───────────────────────────────────────────── */
function ScrollIndicator() {
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
        <motion.div
          className="absolute top-0 left-0 w-full rounded-full"
          style={{ height: "50%", backgroundColor: "rgba(255,255,255,0.7)" }}
          animate={{ y: ["-100%", "200%"] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: "linear" }}
        />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   FRAME COUNTER HUD (top-right)
───────────────────────────────────────────── */
function FrameHud({ frameNum }: { frameNum: MotionValue<number> }) {
  return (
    <div
      className="absolute pointer-events-none flex items-center gap-1.5"
      style={{ top: 24, right: 32, zIndex: 20 }}
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
        / {TOTAL_FRAMES}
      </span>
    </div>
  );
}

/* ─────────────────────────────────────────────
   SCROLL-FADING WRAPPER
   Wraps the scroll indicator so it fades out
   once the user begins scrolling.
───────────────────────────────────────────── */
function FadingScrollIndicator({
  scrollProgress,
}: {
  scrollProgress: MotionValue<number>;
}) {
  const opacity = useTransform(scrollProgress, [0, 0.08], [1, 0]);
  return (
    <motion.div style={{ opacity }}>
      <ScrollIndicator />
    </motion.div>
  );
}

/* ─────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────── */
export function HeroLanding() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const framesRef = useRef<HTMLImageElement[]>([]);
  const currentFrameRef = useRef(0);
  const rafRef = useRef<number | null>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Derive frame number (1-indexed) for the HUD display
  const frameNumDisplay = useTransform(
    scrollYProgress,
    (p) => Math.min(Math.round(p * TOTAL_FRAMES) + 1, TOTAL_FRAMES)
  );

  /* ── Preload all frames ── */
  useEffect(() => {
    const images: HTMLImageElement[] = [];

    const drawFirstFrame = (img: HTMLImageElement) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      canvas.width = img.naturalWidth || 1920;
      canvas.height = img.naturalHeight || 1080;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    };

    framePaths.forEach((src, i) => {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        if (i === 0) drawFirstFrame(img);
      };
      images.push(img);
    });

    framesRef.current = images;
  }, []);

  /* ── Scroll → canvas frame draw ── */
  useEffect(() => {
    const drawFrame = (progress: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const frameIndex = Math.min(
        Math.floor(progress * (TOTAL_FRAMES - 1)),
        TOTAL_FRAMES - 1
      );

      if (frameIndex === currentFrameRef.current && progress !== 0) return;
      currentFrameRef.current = frameIndex;

      const img = framesRef.current[frameIndex];
      if (!img?.complete || img.naturalWidth === 0) return;

      if (
        (canvas.width !== img.naturalWidth || canvas.height !== img.naturalHeight) &&
        img.naturalWidth > 0
      ) {
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    };

    const unsubscribe = scrollYProgress.on("change", (latest) => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => drawFrame(latest));
    });

    return () => {
      unsubscribe();
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [scrollYProgress]);

  return (
    <>
      {/* Inject Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,800;1,700&family=Inter:wght@300;400;600&display=swap');
      `}</style>

      {/* ── 400vh scroll container ── */}
      <div ref={containerRef} style={{ height: "400vh", position: "relative" }}>

        {/* ── Sticky full-viewport canvas frame ── */}
        <div
          style={{
            position: "sticky",
            top: 0,
            height: "100vh",
            width: "100%",
            overflow: "hidden",
            backgroundColor: "#050505",
          }}
        >
          {/* Image sequence canvas */}
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

          {/* Cinematic grain overlay */}
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

          {/* Story text overlays */}
          <div style={{ position: "absolute", inset: 0, zIndex: 10, pointerEvents: "none" }}>
            {STORY_BEATS.map((beat) => (
              <BeatOverlay
                key={beat.label}
                beat={beat}
                scrollProgress={scrollYProgress}
              />
            ))}
          </div>

          {/* Brand mark – top left */}
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

          {/* Frame counter HUD – top right */}
          <FrameHud frameNum={frameNumDisplay} />

          {/* Animated scroll cue */}
          <FadingScrollIndicator scrollProgress={scrollYProgress} />

          {/* Bottom progress bar */}
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
        </div>
      </div>
    </>
  );
}
