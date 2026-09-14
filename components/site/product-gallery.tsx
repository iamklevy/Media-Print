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
const ZOOM_SCALE = 2.4;

function isSwipe(info: PanInfo) {
  const power = info.offset.x * info.velocity.x;
  if (power < -SWIPE_CONFIDENCE || info.offset.x < -SWIPE_DISTANCE) return 1 as const;
  if (power > SWIPE_CONFIDENCE || info.offset.x > SWIPE_DISTANCE) return -1 as const;
  return 0;
}

/** Fallback while the real image is still loading, and a sane clamp so an
 * unusually wide/tall photo can't blow out the two-column product layout. */
const FALLBACK_ASPECT = 4 / 3;
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

export function ProductGallery({ images, alt }: { images: string[]; alt: string }) {
  const { active, dir, paginate, jumpTo } = useSlides(images.length);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const reduce = useReducedMotion();

  // Each photo's own aspect ratio, measured once on load, so the frame fits it
  // exactly instead of cropping (object-cover) or leaving letterbox gaps
  // around a fixed 4:3 box (object-contain in a box that doesn't match).
  const [aspects, setAspects] = useState<Record<number, number>>({});
  const aspect = aspects[active] ?? FALLBACK_ASPECT;
  const onImageLoad = (i: number) => (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { naturalWidth: w, naturalHeight: h } = e.currentTarget;
    if (!w || !h) return;
    const r = clampAspect(w / h);
    setAspects((prev) => (prev[i] === r ? prev : { ...prev, [i]: r }));
  };

  return (
    <div>
      <div
        role="button"
        tabIndex={0}
        aria-label={`${alt} — open zoomed view`}
        onKeyDown={(e) => e.key === "Enter" && setLightboxOpen(true)}
        style={{ aspectRatio: aspect }}
        className="group relative cursor-zoom-in overflow-hidden rounded-[30px] bg-paper-2 shadow-deep transition-[aspect-ratio] duration-300"
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
            onTap={() => setLightboxOpen(true)}
            className="absolute inset-0"
          >
            <Image
              src={images[active]}
              alt={alt}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
              draggable={false}
              onLoad={onImageLoad(active)}
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
            <span className="pointer-events-none absolute bottom-3 start-1/2 z-10 -translate-x-1/2 rounded-full bg-ink/55 px-2.5 py-1 text-[0.75rem] font-semibold text-paper backdrop-blur-sm">
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

  // Zoom state for the current slide, reset whenever the slide or the dialog's open
  // state changes (adjusting state while rendering, per
  // https://react.dev/learn/you-might-not-need-an-effect#resetting-state).
  const [zoomed, setZoomed] = useState(false);
  const resetKey = `${active}-${open}`;
  const [prevResetKey, setPrevResetKey] = useState(resetKey);
  if (resetKey !== prevResetKey) {
    setPrevResetKey(resetKey);
    setZoomed(false);
  }

  const viewerRef = useRef<HTMLDivElement>(null);
  const [panBounds, setPanBounds] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!zoomed) return;
    const el = viewerRef.current;
    if (!el) return;
    setPanBounds({
      x: (el.clientWidth * (ZOOM_SCALE - 1)) / 2,
      y: (el.clientHeight * (ZOOM_SCALE - 1)) / 2,
    });
  }, [zoomed]);

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
              <motion.div
                key={active}
                custom={dir}
                variants={zoomed ? undefined : slideVariants}
                initial={reduce || zoomed ? false : "enter"}
                animate={zoomed ? { scale: ZOOM_SCALE } : "center"}
                exit={reduce || zoomed ? undefined : "exit"}
                transition={reduce ? { duration: 0 } : SPRING}
                drag={zoomed ? true : images.length > 1}
                dragConstraints={zoomed ? { left: -panBounds.x, right: panBounds.x, top: -panBounds.y, bottom: panBounds.y } : { left: 0, right: 0 }}
                dragElastic={zoomed ? 0.15 : 0.8}
                onDragEnd={
                  zoomed
                    ? undefined
                    : (_, info: PanInfo) => {
                        const d = isSwipe(info);
                        if (d) paginate(d);
                      }
                }
                onTap={() => setZoomed((z) => !z)}
                className="absolute inset-0"
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
