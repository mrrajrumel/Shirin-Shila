"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { ChevronLeft, ChevronRight, Award, Trophy, Star } from "lucide-react";
import {
  JourneyItem,
  Month,
  monthOrder,
  defaultTopJourneyData,
  defaultBottomJourneyData,
  timelineMeta,
  TimelineMetaConfig,
  computeTimelinePeriodLabel,
} from "@/data/timeline";

export type { JourneyItem, Month, TimelineMetaConfig };

export type TimelineProps = {
  id?: string;
  title?: string;
  periodLabel?: string;
  textColor?: string;
  mutedTextColor?: string;
  activeColor?: string;
  backgroundColor?: string;
  imageUrl?: string;
  imageAlt?: string;
  topData?: JourneyItem[];
  bottomData?: JourneyItem[];
  initialMeta?: TimelineMetaConfig;
};

function renderFormattedTitle(rawTitle: string) {
  if (!rawTitle) return <>Awards &amp; <span className="pink">Honors Archive</span></>;
  if (rawTitle.includes('&')) {
    const parts = rawTitle.split('&');
    return (
      <>
        {parts[0].trim()} &amp; <span className="pink">{parts.slice(1).join('&').trim()}</span>
      </>
    );
  }
  const words = rawTitle.split(' ');
  if (words.length > 1) {
    const main = words.slice(0, -1).join(' ');
    const last = words[words.length - 1];
    return (
      <>
        {main} <span className="pink">{last}</span>
      </>
    );
  }
  return <>{rawTitle}</>;
}

export default function CareerJourneyTimeline({
  id = "timeline",
  title,
  periodLabel,
  textColor = "#f8f1f5",
  mutedTextColor = "#b6a7b2",
  activeColor = "#ff3f79",
  backgroundColor = "#0b080c",
  imageUrl,
  imageAlt,
  topData = defaultTopJourneyData,
  bottomData = defaultBottomJourneyData,
  initialMeta,
}: TimelineProps) {
  const initialSorted = [...topData, ...bottomData].sort((a, b) => {
    const yA = parseInt(a.year, 10) || 0;
    const yB = parseInt(b.year, 10) || 0;
    if (yA !== yB) return yA - yB;
    return (monthOrder[a.month as Month] || 0) - (monthOrder[b.month as Month] || 0);
  });

  const [liveItems, setLiveItems] = useState<JourneyItem[]>(initialSorted);
  const [meta, setMeta] = useState<TimelineMetaConfig>(initialMeta || timelineMeta);
  const [currentCoverIndex, setCurrentCoverIndex] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);

  // Dynamic pool of authentic award images for background cycling cover
  const cycleImages = useMemo(() => {
    const pool: string[] = [];

    // 1. Primary cover image (Admin chosen image takes highest priority)
    const primary = (meta?.image && typeof meta.image === "string" && meta.image.trim()) 
      ? meta.image.trim() 
      : (imageUrl && typeof imageUrl === "string" && imageUrl.trim() && !imageUrl.includes("placeholder")) 
        ? imageUrl.trim() 
        : "";

    if (primary && !primary.includes("placeholder") && !primary.includes("demo")) {
      pool.push(primary);
    }

    // 2. Extra showcase photos explicitly added by admin
    if (Array.isArray(meta?.images)) {
      for (const img of meta.images) {
        if (img && typeof img === "string" && img.trim() && !img.includes("placeholder") && !img.includes("demo")) {
          if (!pool.includes(img.trim())) {
            pool.push(img.trim());
          }
        }
      }
    }

    // 3. Only include milestone photos if explicitly enabled by admin OR if pool is completely empty
    if (meta?.includeMilestonePhotos === true || pool.length === 0) {
      const fromItems = liveItems
        .map((it) => it.image)
        .filter(
          (img): img is string =>
            Boolean(img && typeof img === "string" && img.trim().length > 0 && !img.includes("placeholder") && !img.includes("demo"))
        );
      for (const img of fromItems) {
        if (!pool.includes(img)) {
          pool.push(img);
        }
      }
    }

    // 4. Guaranteed authentic fallback if pool is still empty
    if (pool.length === 0) {
      return ["/images/award-trophy-stage.jpg", "/images/award-trophy-gala.jpg"];
    }

    return pool;
  }, [liveItems, meta, imageUrl]);

  // Keep index within bounds whenever the pool changes
  useEffect(() => {
    if (currentCoverIndex >= cycleImages.length) {
      setCurrentCoverIndex(0);
    }
  }, [cycleImages.length, currentCoverIndex]);

  // Preload cycling images in browser memory to eliminate decoding / layout stutter
  useEffect(() => {
    if (typeof window !== "undefined" && cycleImages.length > 1) {
      cycleImages.forEach((src) => {
        const img = new window.Image();
        img.src = src;
      });
    }
  }, [cycleImages]);

  // Automatic background crossfade timer (only if > 1 image and autoRotate is not disabled)
  useEffect(() => {
    if (cycleImages.length <= 1) return;
    if (meta?.autoRotate === false) return;

    const intervalSec = Math.max(2, meta?.rotationInterval || 4);
    const timer = setInterval(() => {
      setCurrentCoverIndex((prev) => (prev + 1) % cycleImages.length);
    }, intervalSec * 1000);

    return () => clearInterval(timer);
  }, [cycleImages.length, meta?.autoRotate, meta?.rotationInterval]);

  const computedPeriodLabel = useMemo(() => {
    if (periodLabel && !periodLabel.includes("2014 - 2026") && !periodLabel.includes("2014 — 2026")) {
      return periodLabel;
    }
    return computeTimelinePeriodLabel(liveItems);
  }, [liveItems, periodLabel]);

  const loadTimeline = () => {
    fetch("/api/timeline", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.data) {
          if (data.data.meta) {
            setMeta(data.data.meta);
          }
          // The API now includes deletedIds so we can filter client-side too
          const deletedSet = new Set<string>(
            Array.isArray(data.data.deletedIds) ? data.data.deletedIds : []
          );
          const combined = [
            ...(Array.isArray(data.data.top) ? data.data.top : []),
            ...(Array.isArray(data.data.bottom) ? data.data.bottom : []),
          ].filter((it) => it && it.id && !deletedSet.has(it.id));

          // If the API responded with `loaded: true`, treat an empty list as intentional
          if (data.loaded === true) {
            combined.sort((a, b) => {
              const yA = parseInt(a.year, 10) || 0;
              const yB = parseInt(b.year, 10) || 0;
              if (yA !== yB) return yA - yB;
              return (monthOrder[a.month as Month] || 0) - (monthOrder[b.month as Month] || 0);
            });
            setLiveItems(combined);
            return;
          }

          if (combined.length > 0) {
            combined.sort((a, b) => {
              const yA = parseInt(a.year, 10) || 0;
              const yB = parseInt(b.year, 10) || 0;
              if (yA !== yB) return yA - yB;
              return (monthOrder[a.month as Month] || 0) - (monthOrder[b.month as Month] || 0);
            });
            setLiveItems(combined);
            return;
          }
        }
        // Only fall back to prop data when the API itself failed to respond
        const fallback = [...topData, ...bottomData].sort((a, b) => {
          const yA = parseInt(a.year, 10) || 0;
          const yB = parseInt(b.year, 10) || 0;
          if (yA !== yB) return yA - yB;
          return (monthOrder[a.month as Month] || 0) - (monthOrder[b.month as Month] || 0);
        });
        setLiveItems(fallback);
      })
      .catch(() => {
        const fallback = [...topData, ...bottomData].sort((a, b) => {
          const yA = parseInt(a.year, 10) || 0;
          const yB = parseInt(b.year, 10) || 0;
          if (yA !== yB) return yA - yB;
          return (monthOrder[a.month as Month] || 0) - (monthOrder[b.month as Month] || 0);
        });
        setLiveItems(fallback);
      });
  };

  useEffect(() => {
    loadTimeline();
    const handleUpdate = () => loadTimeline();
    window.addEventListener("shirin_shila_timeline_updated", handleUpdate);
    window.addEventListener("shirin_shila_reset", handleUpdate);
    window.addEventListener("storage", (e) => {
      if (e.key === "shirin_shila_sync_timeline") loadTimeline();
    });
    return () => {
      window.removeEventListener("shirin_shila_timeline_updated", handleUpdate);
      window.removeEventListener("shirin_shila_reset", handleUpdate);
    };
  }, []);

  const checkScroll = () => {
    if (!trackRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = trackRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);

    // Estimate current active card index
    const cardWidth = 320;
    const current = Math.round(scrollLeft / cardWidth);
    setActiveIndex(Math.max(0, Math.min(current, liveItems.length - 1)));
  };

  const scroll = (direction: "left" | "right") => {
    if (!trackRef.current) return;
    const scrollAmount = direction === "left" ? -340 : 340;
    trackRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
  };

  return (
    <section
      id={id}
      className="section timeline-section-root"
      style={{
        backgroundColor,
        color: textColor,
        paddingTop: "clamp(40px, 5vw, 64px)",
        paddingBottom: "clamp(40px, 5vw, 64px)",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Background ambient radial aura */}
      <div
        style={{
          position: "absolute",
          top: "20%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "min(900px, 95vw)",
          height: "400px",
          background: "radial-gradient(ellipse at center, rgba(255, 63, 121, 0.08) 0%, transparent 70%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 sm:mb-12 gap-6">
          <div>
            <div className="section-kicker">{meta.kicker || "Career Milestones"}</div>
            <h2 className="serif text-3xl sm:text-4xl lg:text-5xl font-normal tracking-tight text-white mt-1">
              {renderFormattedTitle(meta.title || "Awards & Honors Archive")}
            </h2>
            <p className="muted mt-2 text-sm sm:text-base max-w-2xl leading-relaxed">
              {meta.sectionSubtitle || "Chronological journey of prestigious Dhallywood awards, television honors, and film industry recognitions from 2014 to present."}
            </p>
          </div>

          {/* Navigation Controls & Period Tag */}
          <div className="flex items-center gap-3 self-start md:self-end">
            <span className="text-xs uppercase tracking-widest px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[#ff8cab] font-mono">
              {computedPeriodLabel}
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => scroll("left")}
                disabled={!canScrollLeft}
                aria-label="Previous milestone"
                className="size-9 rounded-full bg-white/5 border border-white/10 text-white flex items-center justify-center hover:bg-pink-600 hover:border-pink-500 disabled:opacity-30 disabled:pointer-events-none transition-all shadow-sm cursor-pointer"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                type="button"
                onClick={() => scroll("right")}
                disabled={!canScrollRight}
                aria-label="Next milestone"
                className="size-9 rounded-full bg-white/5 border border-white/10 text-white flex items-center justify-center hover:bg-pink-600 hover:border-pink-500 disabled:opacity-30 disabled:pointer-events-none transition-all shadow-sm cursor-pointer"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Milestone Horizontal Track */}
        <div className="relative">
          {/* Timeline continuous connecting bar (desktop) */}
          <div
            className="hidden md:block absolute top-[110px] left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#ff3f79]/35 to-transparent pointer-events-none z-0"
          />

          <div
            ref={trackRef}
            onScroll={checkScroll}
            className="flex gap-4 sm:gap-6 overflow-x-auto pb-6 pt-2 scroll-smooth snap-x snap-mandatory focus:outline-none scrollbar-none"
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
              WebkitOverflowScrolling: "touch",
            }}
          >
            {/* Featured Portrait Intro Card with Auto-cycling Background Cover */}
            <div className="w-[280px] sm:w-[320px] flex-shrink-0 snap-start rounded-2xl overflow-hidden border border-white/10 bg-[#140e16] relative shadow-2xl flex flex-col justify-end p-6 min-h-[380px] group/card">
              {/* Dynamic crossfading background images with zero glitch */}
              {cycleImages.map((src, idx) => {
                const isCurrent = idx === currentCoverIndex;
                return (
                  <img
                    key={`${src}-${idx}`}
                    src={src}
                    alt={meta.imageAlt || `${meta.cardTitle || "Awards & Honors"} - Shirin Shila`}
                    className={`absolute inset-0 w-full h-full object-cover filter saturate-[0.9] transition-opacity duration-700 ease-in-out ${
                      isCurrent ? "opacity-75 z-0" : "opacity-0 -z-10 pointer-events-none"
                    }`}
                    style={{ willChange: "opacity" }}
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = "/images/award-trophy-stage.jpg";
                    }}
                  />
                );
              })}

              {/* Deep cinematic vignette / gradient backdrop */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0e0810] via-[#0e0810]/60 to-black/35 pointer-events-none z-[1]" />

              {/* Dynamic rotating indicator badge (only if more than 1 image) */}
              {cycleImages.length > 1 && (
                <div className="absolute top-4 right-4 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/15 text-[10px] font-mono text-zinc-300 shadow-md">
                  <span className={`size-1.5 rounded-full ${meta.autoRotate !== false ? "bg-pink-400 animate-pulse" : "bg-zinc-400"}`} />
                  <span>
                    {String(currentCoverIndex + 1).padStart(2, "0")} / {String(cycleImages.length).padStart(2, "0")}
                  </span>
                </div>
              )}

              {/* Card Content */}
              <div className="relative z-10">
                <div className="size-10 rounded-xl bg-pink-500/20 border border-pink-500/40 text-pink-400 flex items-center justify-center mb-3 shadow-[0_0_15px_rgba(255,63,121,0.25)]">
                  <Trophy size={20} />
                </div>
                <span className="text-[11px] uppercase tracking-widest text-pink-400 font-mono block mb-1">
                  {meta.badge || "Dhallywood Honors"}
                </span>
                <h3 className="serif text-xl sm:text-2xl text-white font-semibold leading-snug">
                  {meta.cardTitle || "Recognized Excellence"}
                </h3>
                <p className="text-xs text-zinc-300/85 mt-2 leading-relaxed">
                  {meta.cardSubtitle || "Honoring a decade of memorable cinematic performances across television, mainstream film, and cultural festivals."}
                </p>

                {/* Interactive dot indicators (only if more than 1 image) */}
                {cycleImages.length > 1 && (
                  <div className="flex items-center gap-1.5 mt-4 pt-3 border-t border-white/10">
                    {cycleImages.map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setCurrentCoverIndex(i)}
                        aria-label={`View award image ${i + 1}`}
                        className={`h-1 rounded-full transition-all duration-300 cursor-pointer ${
                          i === currentCoverIndex ? "w-6 bg-pink-500" : "w-1.5 bg-white/30 hover:bg-white/60"
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Chronological Milestone Cards (Oldest to Newest) */}
            {liveItems.map((item, idx) => (
              <div
                key={item.id || idx}
                className="w-[280px] sm:w-[320px] flex-shrink-0 snap-start rounded-2xl bg-[#140e16]/95 border border-white/10 hover:border-pink-500/50 p-5 flex flex-col justify-between transition-all duration-300 hover:shadow-[0_22px_45px_rgba(0,0,0,0.85),0_0_24px_rgba(255,63,121,0.2)] hover:-translate-y-1.5 group backdrop-blur-md"
              >
                {/* Milestone Top Indicator */}
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-500/15 border border-pink-500/30 text-pink-400 font-mono text-xs font-semibold">
                      <span className="size-1.5 rounded-full bg-pink-400 animate-pulse" />
                      <span>{item.year}</span>
                      <span className="text-white/60 font-sans uppercase text-[10px] tracking-wider ml-1">
                        {item.month}
                      </span>
                    </span>

                    <span className="text-[11px] text-zinc-400 font-mono">
                      #{idx + 1}
                    </span>
                  </div>

                  {/* Milestone Photo - Preserves Natural Size & Proportions with Deep 3D Frame */}
                  {item.image && (
                    <div className="w-full h-[185px] rounded-xl overflow-hidden border border-white/10 bg-[#09050b] relative mb-3.5 group-hover:border-pink-500/40 transition-all duration-300 flex items-center justify-center p-2 shadow-[inset_0_2px_10px_rgba(0,0,0,0.7)]">
                      <img
                        src={item.image}
                        alt={item.title || item.content}
                        className="max-w-full max-h-full w-auto h-auto object-contain rounded-lg transition-transform duration-500 group-hover:scale-105 filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.8)]"
                        loading="lazy"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = "/images/award-trophy-gala.jpg";
                        }}
                      />
                    </div>
                  )}

                  {/* Milestone Title */}
                  {item.title && (
                    <h4 className="serif text-base sm:text-lg font-semibold text-white leading-snug group-hover:text-pink-300 transition-colors">
                      {item.title}
                    </h4>
                  )}

                  {/* Milestone Citation */}
                  <p className="text-xs sm:text-[13px] text-zinc-300/80 leading-relaxed mt-2">
                    {item.content}
                  </p>
                </div>

                {/* Milestone Natural Editorial Footer (No AI Verified Tag) */}
                <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-zinc-400">
                  <span className="font-serif italic text-pink-300/90 font-medium">
                    {item.month} {item.year}
                  </span>
                  <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-wider">
                    Archive Record
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export { CareerJourneyTimeline as TimelineSection };
