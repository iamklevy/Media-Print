"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Dialog as DialogPrimitive } from "radix-ui";
import { AnimatePresence, motion, useReducedMotion, type PanInfo } from "motion/react";
import { ChevronLeft, ChevronRight, X, ZoomIn } from "lucide-react";

import { cn } from "@/lib/utils";

const SPRING = { type: "spring", stiffness: 380, damping: 38, mass: 0.9 } as const;
/** offset(px) * velocity(px/s) — a fast short flick and a slow long drag both clear this. */
const SWIPE_CONFIDENCE = 6000;
const SWIPE_DISTANCE = 90;
/** Total movement below which a released drag counts as a tap, not a swipe attempt. */
const TAP_SLOP = 8;
/** Desktop has no pinch gesture, so a mouse click still toggles zoom to this level. */
const CLICK_ZOOM = 2.4;
const MIN_SCALE = 1;
const MAX_SCALE = 4;

type Point = { x: number; y: number };
const dist = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y);
const mid = (a: Point, b: Point): Point => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });
const panBoundsFor = (scale: number, rect: { width: number; height: number }) => ({
  x: (rect.width * (scale - 1)) / 2,
  y: (rect.height * (scale - 1)) / 2,
});
const clamp = (v: number, max: number) => Math.min(max, Math.max(-max, v));

function isSwipe(info: PanInfo) {
  const power = info.offset.x * info.velocity.x;
  if (power < -SWIPE_CONFIDENCE || info.offset.x < -SWIPE_DISTANCE) return 1 as const;
  if (power > SWIPE_CONFIDENCE || info.offset.x > SWIPE_DISTANCE) return -1 as const;
  return 0;
}

/** Sane clamp so an unusually wide/tall cover photo can't blow out the
 * two-column product layout. */
const clampAspect = (r: number) => Math.min(1.6, Math.max(0.65, r));

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? "100%" : "-100%", scale: 1 }),
  center: { x: 0, scale: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? "-100%" : "100%", scale: 1 }),
};

/** Shared slide state for both the inline preview and the lightbox, so they stay in sync
 * and both animate in the direction the user actually navigated. */
function useSlides(length: number) {
  const [[active, dir], setSlide] = useState<[number, number]>([0, 0]);
  const paginate = useCallback(
    (d: 1 | -1) => setSlide(([i]) => [(i + d + length) % length, d]),
    [length],
  );
  const jumpTo = useCallback((i: number) => setSlide(([cur]) => [i, i >= cur ? 1 : -1]), []);
  return { active, dir, paginate, jumpTo };
}

export function ProductGallery({
  images,
  alt,
  coverAspect,
}: {
  images: string[];
  alt: string;
  /** Locks the frame to the cover photo's shape — see CatalogueProduct.coverAspect.
   * Every image in the set is centered inside it, so swiping never resizes the frame. */
  coverAspect: number;
}) {
  const { active, dir, paginate, jumpTo } = useSlides(images.length);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const reduce = useReducedMotion();
  const aspect = clampAspect(coverAspect);

  // Framer's own drag gesture already suppresses its tap gesture for any
  // interaction it recognizes as a drag — but a very fast, short flick can
  // reach pointerup before framer's drag tracking ever "starts" (it needs a
  // few pixels of movement to engage), so its tap gesture still fires. Track
  // the press origin ourselves so onTap can tell a real flick like that apart
  // from an actual stationary tap and swipe instead of popping the lightbox.
  const pressStart = useRef<Point | null>(null);

  return (
    <div>
      <div
        role="button"
        tabIndex={0}
        aria-label={`${alt} — open zoomed view`}
        onKeyDown={(e) => e.key === "Enter" && setLightboxOpen(true)}
        style={{ aspectRatio: aspect }}
        className="group relative cursor-zoom-in overflow-hidden rounded-[30px] bg-paper-2 shadow-deep"
      >
        <AnimatePresence initial={false} custom={dir}>
          <motion.div
            key={active}
            custom={dir}
            variants={slideVariants}
            initial={reduce ? false : "enter"}
            animate="center"
            exit={reduce ? undefined : "exit"}
            transition={reduce ? { duration: 0 } : SPRING}
            drag={images.length > 1 ? "x" : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.8}
            onDragEnd={(_, info) => {
              const d = isSwipe(info);
              if (d) paginate(d);
            }}
            onPointerDown={(e) => {
              pressStart.current = { x: e.pageX, y: e.pageY };
            }}
            onTap={(_, info) => {
              const start = pressStart.current;
              pressStart.current = null;
              if (start && images.length > 1) {
                const dx = info.point.x - start.x;
                const dy = info.point.y - start.y;
                if (Math.hypot(dx, dy) >= TAP_SLOP) {
                  // Framer's drag gesture never engaged for this one (rare — it needs a
                  // few pixels of movement to "start"), but it clearly moved, so honor it
                  // as the swipe it was meant to be instead of opening the lightbox.
                  if (Math.abs(dx) > Math.abs(dy)) paginate(dx < 0 ? 1 : -1);
                  return;
                }
              }
              setLightboxOpen(true);
            }}
            className="absolute inset-0"
          >
            <Image
              src={images[active]}
              alt={alt}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-contain"
              draggable={false}
            />
          </motion.div>
        </AnimatePresence>

        <span className="pointer-events-none absolute end-4 top-4 grid size-9 place-items-center rounded-full bg-ink/55 text-paper opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100">
          <ZoomIn className="size-4.5" />
        </span>

        {images.length > 1 && (
          <>
            <button
              type="button"
              aria-label="Previous image"
              onClick={() => paginate(-1)}
              className="absolute start-3 top-1/2 z-10 grid size-9 -translate-y-1/2 place-items-center rounded-full bg-ink/45 text-paper opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100"
            >
              <ChevronLeft className="size-5 rtl:rotate-180" />
            </button>
            <button
              type="button"
              aria-label="Next image"
              onClick={() => paginate(1)}
              className="absolute end-3 top-1/2 z-10 grid size-9 -translate-y-1/2 place-items-center rounded-full bg-ink/45 text-paper opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100"
            >
              <ChevronRight className="size-5 rtl:rotate-180" />
            </button>
            {/* Dead-center regardless of text direction — `left` on purpose, not
                the logical `start`, since a centered badge shouldn't mirror in RTL. */}
            <span className="pointer-events-none absolute bottom-3 left-1/2 z-10 -translate-x-1/2 rounded-full bg-ink/55 px-2.5 py-1 text-[0.75rem] font-semibold text-paper backdrop-blur-sm">
              {active + 1} / {images.length}
            </span>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => jumpTo(i)}
              aria-label={`${alt} ${i + 1}`}
              aria-current={i === active}
              className={`relative size-16 shrink-0 overflow-hidden rounded-lg border-2 transition-colors ${
                i === active ? "border-accent" : "border-transparent opacity-70 hover:opacity-100"
              }`}
            >
              <Image src={src} alt="" fill sizes="64px" className="object-cover" />
            </button>
          ))}
        </div>
      )}

      <Lightbox
        images={images}
        alt={alt}
        open={lightboxOpen}
        onOpenChange={setLightboxOpen}
        active={active}
        dir={dir}
        paginate={paginate}
        jumpTo={jumpTo}
      />
    </div>
  );
}

function Lightbox({
  images,
  alt,
  open,
  onOpenChange,
  active,
  dir,
  paginate,
  jumpTo,
}: {
  images: string[];
  alt: string;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  active: number;
  dir: number;
  paginate: (d: 1 | -1) => void;
  jumpTo: (i: number) => void;
}) {
  const reduce = useReducedMotion();

  // Zoom/pan for the current slide — a real two-finger pinch (like every phone's
  // native photo viewer), plus a one-finger pan once zoomed in. Reset whenever the
  // slide or the dialog's open state changes (adjusting state while rendering, per
  // https://react.dev/learn/you-might-not-need-an-effect#resetting-state).
  const [scale, setScale] = useState(MIN_SCALE);
  const [pan, setPan] = useState<Point>({ x: 0, y: 0 });
  const [interacting, setInteracting] = useState(false);
  const zoomed = scale > 1.02;

  const resetKey = `${active}-${open}`;
  const [prevResetKey, setPrevResetKey] = useState(resetKey);
  if (resetKey !== prevResetKey) {
    setPrevResetKey(resetKey);
    setScale(MIN_SCALE);
    setPan({ x: 0, y: 0 });
  }

  const viewerRef = useRef<HTMLDivElement>(null);
  // Per-pointer tracking for the pinch/pan gesture — refs, not state, since these
  // update every touch-move frame and never need to trigger a render on their own.
  const pointers = useRef(new Map<number, Point>());
  const pinch = useRef<{ dist: number; mid: Point; scale: number; pan: Point } | null>(null);
  const pan1 = useRef<{ start: Point; pan: Point } | null>(null);

  const onGestureDown = (e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    setInteracting(true);

    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      pinch.current = { dist: dist(a, b), mid: mid(a, b), scale, pan };
      pan1.current = null;
    } else if (pointers.current.size === 1 && zoomed) {
      pan1.current = { start: { x: e.clientX, y: e.clientY }, pan };
    }
  };

  const onGestureMove = (e: React.PointerEvent) => {
    if (!pointers.current.has(e.pointerId)) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const rect = viewerRef.current?.getBoundingClientRect();
    if (!rect) return;

    if (pointers.current.size >= 2 && pinch.current) {
      const [a, b] = [...pointers.current.values()];
      const distNow = dist(a, b);
      const midNow = mid(a, b);
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const prev = pinch.current;

      const scaleDelta = prev.dist > 5 ? distNow / prev.dist : 1;
      const newScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, prev.scale * scaleDelta));
      // Keep whatever was under the fingers anchored under the fingers as scale changes.
      const localX = (prev.mid.x - cx - prev.pan.x) / prev.scale;
      const localY = (prev.mid.y - cy - prev.pan.y) / prev.scale;
      const bounds = panBoundsFor(newScale, rect);
      const newPan = {
        x: clamp(midNow.x - cx - localX * newScale, bounds.x),
        y: clamp(midNow.y - cy - localY * newScale, bounds.y),
      };

      setScale(newScale);
      setPan(newPan);
      pinch.current = { dist: distNow, mid: midNow, scale: newScale, pan: newPan };
      return;
    }

    if (pointers.current.size === 1 && pan1.current) {
      const p = [...pointers.current.values()][0];
      const bounds = panBoundsFor(scale, rect);
      setPan({
        x: clamp(pan1.current.pan.x + (p.x - pan1.current.start.x), bounds.x),
        y: clamp(pan1.current.pan.y + (p.y - pan1.current.start.y), bounds.y),
      });
    }
  };

  const onGestureUp = (e: React.PointerEvent) => {
    pointers.current.delete(e.pointerId);
    pan1.current = null;

    if (pointers.current.size >= 2) {
      const [a, b] = [...pointers.current.values()];
      pinch.current = { dist: dist(a, b), mid: mid(a, b), scale, pan };
      return;
    }
    pinch.current = null;

    if (pointers.current.size === 1) {
      const p = [...pointers.current.values()][0];
      if (zoomed) pan1.current = { start: p, pan };
      return;
    }

    setInteracting(false);
    if (scale <= 1.05) {
      setScale(MIN_SCALE);
      setPan({ x: 0, y: 0 });
    }
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") paginate(1);
      else if (e.key === "ArrowLeft") paginate(-1);
      else if (e.key === "Escape") onOpenChange(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, paginate, onOpenChange]);

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-ink/92 backdrop-blur-sm data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0" />
        <DialogPrimitive.Content
          onOpenAutoFocus={(e) => e.preventDefault()}
          className="fixed inset-0 z-50 flex flex-col outline-none data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0"
        >
          <DialogPrimitive.Title className="sr-only">{alt}</DialogPrimitive.Title>

          <div className="flex items-center justify-between px-4 py-3 text-paper">
            <span className="text-[0.85rem] font-semibold opacity-80">
              {images.length > 1 ? `${active + 1} / ${images.length}` : alt}
            </span>
            <DialogPrimitive.Close
              aria-label="Close"
              className="grid size-10 place-items-center rounded-full bg-white/10 transition-colors hover:bg-white/20"
            >
              <X className="size-5" />
            </DialogPrimitive.Close>
          </div>

          <div
            ref={viewerRef}
            className={cn(
              "relative flex-1 overflow-hidden",
              zoomed ? "cursor-grab active:cursor-grabbing" : "cursor-zoom-in",
            )}
          >
            <AnimatePresence initial={false} custom={dir}>
              {/* Slide layer — swipe between images. Disabled while zoomed, so it
                  never fights with the pinch/pan layer nested inside it. */}
              <motion.div
                key={active}
                custom={dir}
                variants={zoomed ? undefined : slideVariants}
                initial={reduce || zoomed ? false : "enter"}
                animate={zoomed ? { x: 0 } : "center"}
                exit={reduce || zoomed ? undefined : "exit"}
                transition={reduce ? { duration: 0 } : SPRING}
                drag={zoomed ? false : images.length > 1 ? "x" : false}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.8}
                onDragEnd={(_, info: PanInfo) => {
                  const d = isSwipe(info);
                  if (d) paginate(d);
                }}
                onTap={(e) => {
                  // Touch devices zoom via pinch instead — see the gesture handlers below.
                  if ((e as PointerEvent).pointerType === "touch") return;
                  setScale((s) => (s > 1 ? MIN_SCALE : CLICK_ZOOM));
                  setPan({ x: 0, y: 0 });
                }}
                className="absolute inset-0"
              >
                {/* Zoom/pan layer — a real two-finger pinch, plus one-finger pan once zoomed. */}
                <div
                  onPointerDown={onGestureDown}
                  onPointerMove={onGestureMove}
                  onPointerUp={onGestureUp}
                  onPointerCancel={onGestureUp}
                  style={{
                    transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
                    transition: interacting ? "none" : "transform 200ms ease-out",
                  }}
                  className="absolute inset-0 touch-none"
                >
                  <Image
                    src={images[active]}
                    alt={alt}
                    fill
                    sizes="100vw"
                    className="object-contain"
                    draggable={false}
                    priority
                  />
                </div>
              </motion.div>
            </AnimatePresence>

            {images.length > 1 && !zoomed && (
              <>
                <button
                  type="button"
                  aria-label="Previous image"
                  onClick={() => paginate(-1)}
                  className="absolute start-2 top-1/2 z-10 hidden -translate-y-1/2 place-items-center rounded-full bg-white/10 p-2.5 text-paper transition-colors hover:bg-white/20 sm:grid"
                >
                  <ChevronLeft className="size-6 rtl:rotate-180" />
                </button>
                <button
                  type="button"
                  aria-label="Next image"
                  onClick={() => paginate(1)}
                  className="absolute end-2 top-1/2 z-10 hidden -translate-y-1/2 place-items-center rounded-full bg-white/10 p-2.5 text-paper transition-colors hover:bg-white/20 sm:grid"
                >
                  <ChevronRight className="size-6 rtl:rotate-180" />
                </button>
              </>
            )}
          </div>

          {images.length > 1 && (
            <div className="flex justify-center gap-2 overflow-x-auto px-4 py-4">
              {images.map((src, i) => (
                <button
                  key={src}
                  type="button"
                  onClick={() => jumpTo(i)}
                  aria-label={`${alt} ${i + 1}`}
                  aria-current={i === active}
                  className={`relative size-12 shrink-0 overflow-hidden rounded-md border-2 transition-colors ${
                    i === active ? "border-accent" : "border-white/20 opacity-70 hover:opacity-100"
                  }`}
                >
                  <Image src={src} alt="" fill sizes="48px" className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
