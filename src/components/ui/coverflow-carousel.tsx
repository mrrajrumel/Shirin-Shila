"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight, Play, X, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

const useIsoLayoutEffect =
  typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect;

export interface CoverflowSlide {
  src: string;
  alt: string;
  title?: string;
  subtitle?: string;
  meta?: { label: string; value: string }[];
  youtubeId?: string;
  videoUrl?: string;
  description?: string;
}

export interface CoverflowCarouselProps {
  slides: CoverflowSlide[];
  /** Degrees the first neighbour tilts. */
  rotate?: number;
  /** How far the first neighbour recedes, as a fraction of card width. */
  depth?: number;
  /** Viewer distance as a multiple of card width — smaller is a wider lens. */
  perspective?: number;
  /** Exponent on distance. Below 1 the rake eases off as cards travel out. */
  falloff?: number;
  /** Opacity lost per step from the centre. */
  fade?: number;
  /** Any CSS length. Everything else is derived from it, so the rake scales. */
  cardWidth?: string;
  /** Space between cards, as a fraction of card width. */
  gap?: number;
  loop?: boolean;
  showCaption?: boolean;
  showPagination?: boolean;
  showNavigation?: boolean;
  /** Names the carousel for assistive tech. */
  label?: string;
  className?: string;
  cardClassName?: string;
  onPlayVideo?: (slide: CoverflowSlide) => void;
}

export function CoverflowCarousel({
  slides,
  rotate = 40,
  depth = 0.55,
  perspective = 3.2,
  falloff = 0.58,
  fade = 0.12,
  cardWidth = "clamp(260px, 38vw, 480px)",
  gap = 0.08,
  loop = true,
  showCaption = true,
  showPagination = true,
  showNavigation = true,
  label = "Showreel cover carousel",
  className,
  cardClassName,
  onPlayVideo,
}: CoverflowCarouselProps) {
  const count = slides.length;

  const frameRef = React.useRef<HTMLDivElement>(null);
  const cardRefs = React.useRef<(HTMLDivElement | null)[]>([]);
  /** Fractional card index at the centre. The single source of truth. */
  const posRef = React.useRef(0);
  /** Where the current settle is headed. Stepping off `pos` instead would
      swallow a keypress that lands mid-flight, before the round-off moves. */
  const targetRef = React.useRef(0);
  const widthRef = React.useRef(0);
  const rafRef = React.useRef<number | null>(null);
  const dragRef = React.useRef<{
    id: number;
    x: number;
    pos: number;
    v: number;
    t: number;
  } | null>(null);

  const [selected, setSelected] = React.useState(0);
  const [playingIndex, setPlayingIndex] = React.useState<number | null>(null);
  const [activeVideoModal, setActiveVideoModal] = React.useState<CoverflowSlide | null>(null);

  /** Nearest whole card, folded back into 0..count-1. */
  const indexAt = React.useCallback(
    (pos: number) => {
      if (!count) return 0;
      return ((Math.round(pos) % count) + count) % count;
    },
    [count],
  );

  // Paint straight to the DOM. Sixty state updates a second would re-render
  // every card for numbers React never needs to see.
  const paint = React.useCallback(() => {
    const width = widthRef.current;
    if (!width || !count) return;
    const pitch = width * (1 + gap);
    const pos = posRef.current;

    cardRefs.current.forEach((card, index) => {
      if (!card) return;

      let offset = index - pos;
      if (loop) {
        offset = ((offset % count) + count) % count;
        if (offset > count / 2) offset -= count;
      }

      const distance = Math.abs(offset);
      const ramp = Math.pow(distance, falloff);
      const tilt = Math.min(rotate * ramp, 80) * Math.sign(offset);

      card.style.transform =
        `translateX(calc(-50% + ${offset * pitch}px)) ` +
        `translateZ(${-depth * width * ramp}px) rotateY(${-tilt}deg)`;

      const edge = loop ? Math.min(1, Math.max(0, count / 2 - distance)) : 1;
      card.style.opacity = String(Math.max(0, 1 - fade * distance) * edge);
      card.style.zIndex = String(100 - Math.round(distance));
    });
  }, [count, depth, fade, falloff, gap, loop, rotate]);

  const settle = React.useCallback(
    (target: number) => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      targetRef.current = target;
      setSelected(indexAt(target));

      const step = () => {
        const remaining = target - posRef.current;
        if (Math.abs(remaining) < 0.0004) {
          posRef.current = target;
          paint();
          rafRef.current = null;
          return;
        }
        posRef.current += remaining * 0.16;
        paint();
        rafRef.current = requestAnimationFrame(step);
      };
      rafRef.current = requestAnimationFrame(step);
    },
    [indexAt, paint],
  );

  const clamp = React.useCallback(
    (pos: number) => {
      if (!count) return 0;
      return loop ? pos : Math.max(0, Math.min(count - 1, pos));
    },
    [count, loop],
  );

  const goTo = React.useCallback(
    (index: number) => {
      if (!count) return;
      setPlayingIndex(null);
      const target = loop
        ? index + Math.round((targetRef.current - index) / count) * count
        : index;
      settle(clamp(target));
    },
    [clamp, count, loop, settle],
  );

  const nudge = React.useCallback(
    (by: number) => {
      setPlayingIndex(null);
      settle(clamp(Math.round(targetRef.current) + by));
    },
    [clamp, settle],
  );

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    event.currentTarget.setPointerCapture(event.pointerId);
    targetRef.current = posRef.current;
    dragRef.current = {
      id: event.pointerId,
      x: event.clientX,
      pos: posRef.current,
      v: 0,
      t: performance.now(),
    };
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.id !== event.pointerId) return;

    const pitch = widthRef.current * (1 + gap);
    if (!pitch) return;

    const now = performance.now();
    const previous = posRef.current;
    posRef.current = clamp(drag.pos - (event.clientX - drag.x) / pitch);
    drag.v = ((posRef.current - previous) / Math.max(now - drag.t, 1)) * 1000;
    drag.t = now;

    const index = indexAt(posRef.current);
    if (index !== selected) setSelected(index);
    paint();
  };

  const endDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.id !== event.pointerId) return;
    dragRef.current = null;
    setPlayingIndex(null);
    const carried = Math.max(-2, Math.min(2, drag.v * 0.18));
    settle(clamp(Math.round(posRef.current + carried)));
  };

  useIsoLayoutEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;

    const measure = () => {
      const card = cardRefs.current[0];
      if (!card) return;
      const w = card.offsetWidth;
      if (w > 0) {
        widthRef.current = w;
        paint();
      }
    };

    measure();
    const rId = requestAnimationFrame(measure);
    const observer = new ResizeObserver(measure);
    observer.observe(frame);
    return () => {
      cancelAnimationFrame(rId);
      observer.disconnect();
    };
  }, [paint, slides]);

  React.useEffect(
    () => () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    },
    [],
  );

  const active = slides[selected];

  const handleCardClick = (slide: CoverflowSlide, index: number) => {
    if (slide.youtubeId) {
      if (index !== selected) {
        goTo(index);
        setPlayingIndex(index);
      } else {
        setPlayingIndex((prev) => (prev === index ? null : index));
      }
    } else if (onPlayVideo) {
      if (index !== selected) goTo(index);
      onPlayVideo(slide);
    } else {
      if (index !== selected) goTo(index);
      setActiveVideoModal(slide);
    }
  };

  return (
    <div
      className={cn("w-full", className)}
      style={{ ["--cf-card" as string]: cardWidth }}
      role="region"
      aria-roledescription="carousel"
      aria-label={label}
    >
      <div className="relative">
        <div
          ref={frameRef}
          tabIndex={0}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onKeyDown={(event) => {
            if (event.key === "ArrowLeft") {
              event.preventDefault();
              nudge(-1);
            } else if (event.key === "ArrowRight") {
              event.preventDefault();
              nudge(1);
            }
          }}
          className="cursor-grab overflow-hidden py-10 outline-none ring-ring focus-visible:ring-2 active:cursor-grabbing"
          style={{
            perspective: `calc(var(--cf-card) * ${perspective})`,
            touchAction: "pan-y",
          }}
        >
          <div
            className="relative select-none"
            style={{
              height: "calc(var(--cf-card) * 0.58)", // 16:9 cinematic aspect height
              transformStyle: "preserve-3d",
            }}
          >
            {slides.map((slide, index) => {
              const isSelected = index === selected;
              const isPlaying = isSelected && playingIndex === index && Boolean(slide.youtubeId);

              return (
                <div
                  key={index}
                  ref={(node) => {
                    cardRefs.current[index] = node;
                  }}
                  role="group"
                  aria-roledescription="slide"
                  aria-label={`${index + 1} of ${count}`}
                  onClick={() => handleCardClick(slide, index)}
                  className={cn(
                    "group absolute left-1/2 top-0 aspect-video overflow-hidden rounded-2xl bg-neutral-900 shadow-2xl will-change-transform cursor-pointer border border-white/10 transition-shadow duration-300",
                    isSelected
                      ? "ring-2 ring-pink-500 shadow-[0_0_35px_rgba(255,63,121,0.35)]"
                      : "opacity-85 hover:opacity-100",
                    cardClassName,
                  )}
                  style={{ width: "var(--cf-card)" }}
                >
                  {isPlaying ? (
                    <div className="relative w-full h-full bg-black z-30" onClick={(e) => e.stopPropagation()}>
                      <iframe
                        src={`https://www.youtube-nocookie.com/embed/${slide.youtubeId}?autoplay=1&rel=0&modestbranding=1&playsinline=1`}
                        title={slide.title || "Showreel Video"}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                        className="w-full h-full border-0 pointer-events-auto"
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPlayingIndex(null);
                        }}
                        className="absolute top-2 right-2 z-40 size-8 rounded-full bg-black/85 hover:bg-pink-600 text-white flex items-center justify-center transition-colors shadow-lg cursor-pointer"
                        aria-label="Stop video"
                        title="Stop video"
                      >
                        <X className="size-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      {/* YouTube Video Thumbnail */}
                      <img
                        src={slide.src}
                        alt={slide.alt || slide.title || "Showreel preview"}
                        draggable={false}
                        className="h-full w-full select-none object-cover transition-transform duration-500 group-hover:scale-105 filter brightness-95"
                        onError={(e) => {
                          const target = e.currentTarget as HTMLImageElement;
                          if (!target.src.endsWith("/images/gallery-3.jpg")) {
                            target.src = "/images/gallery-3.jpg";
                          }
                        }}
                      />

                      {/* Gradient vignette */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent pointer-events-none" />

                      {/* Play Button Overlay */}
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div
                          className={cn(
                            "flex items-center justify-center rounded-full transition-all duration-300 shadow-xl",
                            isSelected
                              ? "size-14 bg-gradient-to-tr from-pink-600 to-rose-500 text-white scale-100 group-hover:scale-110 shadow-[0_0_24px_rgba(255,63,121,0.8)]"
                              : "size-10 bg-black/60 backdrop-blur-sm text-white/80 group-hover:scale-105"
                          )}
                        >
                          <Play className={cn("fill-current ml-0.5", isSelected ? "size-6" : "size-4")} />
                        </div>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {showNavigation && count > 1 && (
          <>
            <button
              type="button"
              aria-label="Previous slide"
              onClick={() => nudge(-1)}
              className="absolute left-1 sm:left-4 top-1/2 z-[200] -translate-y-1/2 rounded-full bg-black/75 border border-white/15 p-2 sm:p-3 text-white backdrop-blur transition hover:bg-pink-600 hover:border-pink-500 shadow-lg"
            >
              <ChevronLeft className="size-4 sm:size-5" />
            </button>
            <button
              type="button"
              aria-label="Next slide"
              onClick={() => nudge(1)}
              className="absolute right-1 sm:right-4 top-1/2 z-[200] -translate-y-1/2 rounded-full bg-black/75 border border-white/15 p-2 sm:p-3 text-white backdrop-blur transition hover:bg-pink-600 hover:border-pink-500 shadow-lg"
            >
              <ChevronRight className="size-4 sm:size-5" />
            </button>
          </>
        )}
      </div>

      {showCaption && active && (
        <div
          key={selected}
          className="mt-3 flex flex-col items-center px-6 duration-300 animate-in fade-in text-center"
        >
          <div className="inline-flex items-center gap-2 mb-2">
            <span className="text-[11px] uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-pink-500/15 border border-pink-500/30 text-pink-400 font-mono">
              {active.subtitle || "Showreel Clip"}
            </span>
          </div>
          <h3 className="text-[20px] font-serif font-normal tracking-wide text-white">
            {active.title}
          </h3>
          {active.description && (
            <p className="mt-1.5 max-w-xl text-[13px] text-zinc-300/80 leading-relaxed">
              {active.description}
            </p>
          )}

          {/* Quick Play Action Button */}
          <div className="mt-4 flex items-center gap-3">
            <button
              type="button"
              onClick={() => handleCardClick(active, selected)}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-pink-600 to-rose-600 text-white font-medium text-xs hover:from-pink-500 hover:to-rose-500 transition-all shadow-[0_0_20px_rgba(255,63,121,0.4)]"
            >
              <Play className="size-3.5 fill-current" />
              <span>Watch Showreel Now</span>
            </button>
            {active.youtubeId && (
              <a
                href={`https://www.youtube.com/watch?v=${active.youtubeId}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white/5 border border-white/10 text-zinc-300 text-xs hover:bg-white/10 transition-all"
              >
                <span>YouTube</span>
                <ExternalLink className="size-3" />
              </a>
            )}
          </div>

          {active.meta && active.meta.length > 0 && (
            <dl className="mt-6 flex flex-wrap justify-center gap-x-8 gap-y-2 text-[12px] border-t border-white/10 pt-4">
              {active.meta.map((row) => (
                <div key={row.label} className="flex gap-2">
                  <dt className="text-zinc-400 font-mono">{row.label}:</dt>
                  <dd className="font-medium text-white">{row.value}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      )}

      {showPagination && count > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              type="button"
              aria-label={`Go to slide ${index + 1}`}
              aria-current={index === selected}
              onClick={() => goTo(index)}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                index === selected
                  ? "w-8 bg-pink-500 shadow-[0_0_8px_rgba(255,63,121,0.8)]"
                  : "w-2 bg-white/20 hover:bg-white/40",
              )}
            />
          ))}
        </div>
      )}

      {/* Video Modal Player */}
      {activeVideoModal && activeVideoModal.youtubeId && (
        <div
          className="fixed inset-0 z-[999] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in"
          onClick={() => setActiveVideoModal(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="relative w-full max-w-4xl bg-zinc-950 border border-pink-500/30 rounded-2xl overflow-hidden shadow-[0_0_60px_rgba(255,63,121,0.25)] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Top Bar */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/10 bg-black/40">
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-pink-500 animate-pulse" />
                <span className="text-xs uppercase tracking-wider font-mono text-zinc-400">
                  {activeVideoModal.subtitle || "Official Acting Showreel"}
                </span>
                <span className="text-white text-sm font-semibold truncate ml-2">
                  {activeVideoModal.title}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setActiveVideoModal(null)}
                className="rounded-lg p-1.5 text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Close video"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Video Player */}
            <div className="relative aspect-video w-full bg-black">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${activeVideoModal.youtubeId}?autoplay=1&rel=0&modestbranding=1&playsinline=1`}
                title={activeVideoModal.title || "Showreel Video"}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="w-full h-full border-0"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

