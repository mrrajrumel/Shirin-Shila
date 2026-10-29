"use client";

import {
  type CSSProperties,
  useState,
  useEffect,
  useLayoutEffect,
  useRef,
  useSyncExternalStore,
} from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

/* Stand-in for @gsap/react's useGSAP. Reverts context on unmount. */
function useGSAP(
  callback: () => void | (() => void),
  options?: {
    dependencies?: unknown[];
    scope?: { current: Element | null } | Element | null;
  }
) {
  const deps = options?.dependencies ?? [];
  const scope = options?.scope;
  const ctxRef = useRef<gsap.Context | null>(null);
  const cleanupRef = useRef<(() => void) | undefined>(undefined);

  useIsomorphicLayoutEffect(() => {
    const el =
      scope && typeof scope === "object" && "current" in scope
        ? scope.current
        : (scope as Element | null);
    ctxRef.current = gsap.context(() => {}, el ?? undefined);
    return () => {
      cleanupRef.current?.();
      cleanupRef.current = undefined;
      ctxRef.current?.revert();
      ctxRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useIsomorphicLayoutEffect(() => {
    if (!ctxRef.current) return;
    cleanupRef.current?.();
    const ret = ctxRef.current.add(callback);
    cleanupRef.current = typeof ret === "function" ? ret : undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

import {
  JourneyItem,
  Month,
  monthOrder,
  defaultTopJourneyData,
  defaultBottomJourneyData,
  timelineMeta,
} from "@/data/timeline";

export type { JourneyItem, Month };

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
  duration?: number;
  scrollDuration?: number;
  topData?: JourneyItem[];
  bottomData?: JourneyItem[];
};

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeToReducedMotion(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  const mediaQueryList = window.matchMedia(REDUCED_MOTION_QUERY);
  mediaQueryList.addEventListener("change", callback);
  return () => mediaQueryList.removeEventListener("change", callback);
}

function getReducedMotionSnapshot() {
  if (typeof window === "undefined") return false;
  return window.matchMedia?.(REDUCED_MOTION_QUERY)?.matches ?? false;
}

function getServerReducedMotionSnapshot() {
  return false;
}

function usePrefersReducedMotion() {
  return useSyncExternalStore(
    subscribeToReducedMotion,
    getReducedMotionSnapshot,
    getServerReducedMotionSnapshot
  );
}

export default function CareerJourneyTimeline({
  id = "timeline",
  title = timelineMeta.title,
  periodLabel = timelineMeta.periodLabel,
  textColor = "#f8f1f5",
  mutedTextColor = "#b6a7b2",
  activeColor = "#ff3f79",
  backgroundColor = "#0b080c",
  imageUrl = timelineMeta.image,
  imageAlt = timelineMeta.imageAlt,
  duration,
  scrollDuration = 1.2,
  topData = defaultTopJourneyData,
  bottomData = defaultBottomJourneyData,
}: TimelineProps) {
  const [liveTop, setLiveTop] = useState<JourneyItem[]>(topData);
  const [liveBottom, setLiveBottom] = useState<JourneyItem[]>(bottomData);
  const sectionRef = useRef<HTMLElement>(null);
  const wholeSliderRef = useRef<HTMLDivElement>(null);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const loadTimeline = () => {
      fetch("/api/timeline", { cache: "no-store" })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data && data.data) {
            if (Array.isArray(data.data.top) && data.data.top.length > 0) setLiveTop(data.data.top);
            if (Array.isArray(data.data.bottom) && data.data.bottom.length > 0) setLiveBottom(data.data.bottom);
          }
        })
        .catch(() => {});
    };

    loadTimeline();

    const handleUpdate = () => loadTimeline();
    window.addEventListener("shirin_shila_timeline_updated", handleUpdate);
    window.addEventListener("shirin_shila_reset", handleUpdate);
    return () => {
      window.removeEventListener("shirin_shila_timeline_updated", handleUpdate);
      window.removeEventListener("shirin_shila_reset", handleUpdate);
    };
  }, []);

  const allJourneyItems: JourneyItem[] = [...liveTop, ...liveBottom].sort(
    (a, b) => {
      const yearDiff = Number(a.year) - Number(b.year);
      if (yearDiff !== 0) return yearDiff;
      const orderA = monthOrder[a.month as Month] ?? 0;
      const orderB = monthOrder[b.month as Month] ?? 0;
      return orderA - orderB;
    }
  );

  const sectionStyle: CSSProperties = {
    color: textColor,
    backgroundColor,
  };
  const activeStyle: CSSProperties = {
    backgroundColor: activeColor,
  };
  const mutedTextStyle: CSSProperties = {
    color: mutedTextColor,
  };

  useGSAP(
    () => {
      const section = sectionRef.current;
      const slider = wholeSliderRef.current;
      if (!section || !slider) return;

      const isMobile = window.innerWidth < 768;
      const slidePercent = isMobile ? -58 : -62;
      const lineWidth = isMobile ? "85%" : "98%";

      // Initial state of milestones
      if (reducedMotion) {
        allJourneyItems.forEach((item) => {
          gsap.set(`.jl-${item.id}`, { scaleY: 1 });
          gsap.set(`.jd-${item.id}`, { scale: 1 });
          gsap.set(`.title-${item.id}`, { opacity: 1, y: 0 });
          gsap.set(`.description-${item.id}`, { opacity: 1, y: 0 });
        });
        gsap.set(".journey-line", { width: lineWidth });
      } else {
        allJourneyItems.forEach((item) => {
          const isTop = topData.some((t) => t.id === item.id);
          gsap.set(`.jl-${item.id}`, {
            scaleY: 0,
            transformOrigin: isTop ? "bottom bottom" : "top top",
          });
          gsap.set(`.jd-${item.id}`, { scale: 0 });
          gsap.set(`.title-${item.id}`, { opacity: 0, y: isTop ? -20 : 20 });
          gsap.set(`.description-${item.id}`, { opacity: 0, y: isTop ? -14 : 14 });
        });
        gsap.set(".journey-line", { width: "0%" });
      }

      // Single pinned master timeline - strictly starts when section reaches top of viewport
      const masterTl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: () => `+=${window.innerHeight * (isMobile ? 2.6 : 2.2)}`,
          pin: true,
          anticipatePin: 1,
          scrub: 1,
          invalidateOnRefresh: true,
        },
        defaults: { ease: "none" },
      });

      // 1. Horizontal slider movement
      masterTl.fromTo(
        slider,
        { xPercent: 0 },
        { xPercent: slidePercent, duration: 1 },
        0
      );

      // 2. Journey line expansion synced to slider scroll
      if (!reducedMotion) {
        masterTl.to(
          ".journey-line",
          { width: lineWidth, duration: 0.95 },
          0.02
        );

        // 3. Milestone reveal sequence linked directly to timeline progress
        allJourneyItems.forEach((item, index) => {
          const progressPoint = 0.08 + (index / (allJourneyItems.length + 0.6)) * 0.78;
          masterTl
            .to(
              `.jl-${item.id}`,
              { scaleY: 1, duration: 0.12, ease: "power1.out" },
              progressPoint
            )
            .to(
              `.jd-${item.id}`,
              { scale: 1, duration: 0.1, ease: "back.out(2)" },
              progressPoint
            )
            .to(
              `.title-${item.id}`,
              { opacity: 1, y: 0, duration: 0.14, ease: "power2.out" },
              progressPoint + 0.02
            )
            .to(
              `.description-${item.id}`,
              { opacity: 1, y: 0, duration: 0.14, ease: "power2.out" },
              progressPoint + 0.04
            );
        });
      }

      const handleResize = () => {
        ScrollTrigger.refresh();
      };
      window.addEventListener("resize", handleResize);

      return () => {
        window.removeEventListener("resize", handleResize);
      };
    },
    { dependencies: [reducedMotion, topData, bottomData], scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      id={id || "timeline"}
      className="h-screen w-full relative overflow-hidden flex items-center"
      style={sectionStyle}
    >
      <div className="w-full flex items-center overflow-hidden">
        <div
          ref={wholeSliderRef}
          className="mr-[2vw] flex h-[34vw] w-[240vw] items-center gap-[5vw] px-[5vw] max-[600px]:h-[80vh] max-[600px]:w-[800vw] max-[600px]:px-[7vw]"
          style={{ willChange: "transform" }}
        >
          {/* Portrait showcase card */}
          <div className="h-full w-[30vw] overflow-hidden rounded-[1vw] max-[600px]:h-[65vw] max-[600px]:w-[85vw] max-[600px]:rounded-[5vw] border border-white/10 relative shadow-2xl flex-shrink-0">
            <img
              src={imageUrl}
              alt={imageAlt}
              draggable={false}
              className="h-full w-full object-cover filter saturate-[0.85]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
            <div className="absolute bottom-6 left-6 right-6">
              <span className="text-[10px] uppercase tracking-[0.2em] text-[#ff8cab] font-semibold block mb-1">
                Awards & Accolades
              </span>
              <strong className="text-[16px] serif font-normal text-white">
                Prestigious Laurels
              </strong>
            </div>
          </div>

          <div className="relative h-full w-full">
            {/* Center horizontal timeline bar */}
            <div className="w-full absolute left-0 top-[49%] -translate-y-1/2 flex items-center h-fit pointer-events-none z-10">
              <div
                className="h-[.8vw] max-[600px]:h-[2vw] max-[600px]:w-[2vw] w-[.8vw] rounded-full shadow-[0_0_12px_var(--pink)]"
                style={activeStyle}
              ></div>
              <div
                className="h-px w-[0%] rounded-full journey-line shadow-[0_0_8px_var(--pink)]"
                style={activeStyle}
              ></div>
              <div
                className="h-[.8vw] max-[600px]:h-[2vw] max-[600px]:w-[2vw] w-[.8vw] rounded-full shadow-[0_0_12px_var(--pink)]"
                style={activeStyle}
              ></div>
            </div>

            {/* Top Milestones Section */}
            <div className="flex h-1/2 w-full items-center justify-start gap-[.5vw]">
              <div className="h-full w-[20%] pt-[2vw] max-[600px]:h-fit max-[600px]:pt-[5vw] flex-shrink-0">
                <span className="text-[10px] tracking-[0.25em] uppercase text-[#ff8cab] block mb-2 font-semibold">
                  Accolades
                </span>
                <h2 className="w-[85%] text-[3vw] leading-[0.95] max-[600px]:text-[8.5vw] font-serif">
                  {title}
                </h2>
              </div>

              <div className="w-full flex h-full gap-x-[15vw] max-[600px]:gap-x-[40vw]">
                {liveTop.map((item: JourneyItem) => (
                  <div
                    key={`top-${item.id}`}
                    className="relative h-full w-[34vw] px-[2.5vw] max-[600px]:flex max-[600px]:w-[78vw] max-[600px]:flex-col max-[600px]:px-[6vw] flex-shrink-0"
                  >
                    <div className="w-full absolute left-0 bottom-0 top-0 h-full pointer-events-none">
                      <div
                        className={`size-[1vw] max-[600px]:size-[2.5vw] translate-x-[-50%] relative aspect-square rounded-full jd-${item.id} shadow-[0_0_10px_var(--pink)]`}
                        style={activeStyle}
                      ></div>
                      <div
                        className={`h-[94%] w-px origin-bottom rounded-full jl-${item.id} opacity-80`}
                        style={activeStyle}
                      ></div>
                    </div>

                    <div className="mt-[-0.5vw] flex items-start gap-[1.4vw] max-[600px]:mt-[-2vw] max-[600px]:gap-[3.5vw]">
                      {item.image && (
                        <div className="w-[8.5vw] h-[11vw] min-w-[115px] min-h-[148px] max-[600px]:w-[28vw] max-[600px]:h-[36vw] max-[600px]:min-w-[95px] max-[600px]:min-h-[120px] rounded-[10px] overflow-hidden border border-[#ff3f79]/45 shadow-[0_12px_32px_rgba(0,0,0,0.85),0_0_24px_rgba(255,63,121,0.22)] flex-shrink-0 bg-[#160e18]">
                          <img
                            src={item.image}
                            alt={item.title || item.content}
                            className="w-full h-full object-cover filter saturate-[1.05]"
                            loading="lazy"
                          />
                        </div>
                      )}
                      <div className="flex-1">
                        <h4
                          className={`title-${item.id} text-[1.8vw] leading-none max-[600px]:text-[5.4vw] font-serif text-[#f8f1f5]`}
                        >
                          {item.year} <span className="text-[#ff7399] font-sans text-[1.2vw] max-[600px]:text-[3.5vw] tracking-wider uppercase ml-1">{item.month}</span>
                        </h4>
                        {item.title && (
                          <strong className="text-[0.95vw] max-[600px]:text-[3.4vw] text-[#ff8cab] font-semibold block mt-1.5 leading-snug">
                            {item.title}
                          </strong>
                        )}
                        <p
                          className={`description-${item.id} text-[1.05vw] leading-[1.45] max-[600px]:text-[3.8vw] mt-1.5`}
                          style={mutedTextStyle}
                        >
                          {item.content}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Milestones Section */}
            <div className="h-1/2 flex items-center justify-start w-full">
              <div className="w-[34%] pt-[2vw] max-[600px]:pt-[5vw] max-[600px]:w-[30%] h-full flex-shrink-0">
                <p
                  className="text-[1.3vw] leading-none max-[600px]:text-[4.2vw] tracking-widest font-mono text-[#ff8cab]"
                  style={mutedTextStyle}
                >
                  {periodLabel}
                </p>
                <span className="text-[11px] text-[#7d6878] tracking-widest uppercase block mt-2">
                  Awards & Honors Archive
                </span>
              </div>

              <div className="w-full flex h-full gap-x-[18vw] ml-[7vw] max-[600px]:gap-x-[40vw] max-[600px]:ml-[7vw]">
                {liveBottom.map((item: JourneyItem) => (
                  <div
                    key={`bottom-${item.id}`}
                    className="relative h-full w-[34vw] px-[2.5vw] max-[600px]:w-[78vw] max-[600px]:px-[6vw] flex-shrink-0"
                  >
                    <div className="w-full absolute left-0 bottom-[-1%] h-full pointer-events-none">
                      <div
                        className={`h-[94%] origin-top w-px rounded-full max-[600px]:h-full jl-${item.id} opacity-80`}
                        style={activeStyle}
                      ></div>
                      <div
                        className={`size-[1vw] max-[600px]:size-[2.5vw] translate-x-[-50%] relative w-auto aspect-square rounded-full jd-${item.id} shadow-[0_0_10px_var(--pink)]`}
                        style={activeStyle}
                      ></div>
                    </div>

                    <div className="flex h-full w-full flex-col justify-end pb-3">
                      <div className="flex items-start gap-[1.4vw] max-[600px]:gap-[3.5vw]">
                        {item.image && (
                          <div className="w-[8.5vw] h-[11vw] min-w-[115px] min-h-[148px] max-[600px]:w-[28vw] max-[600px]:h-[36vw] max-[600px]:min-w-[95px] max-[600px]:min-h-[120px] rounded-[10px] overflow-hidden border border-[#ff3f79]/45 shadow-[0_12px_32px_rgba(0,0,0,0.85),0_0_24px_rgba(255,63,121,0.22)] flex-shrink-0 bg-[#160e18]">
                            <img
                              src={item.image}
                              alt={item.title || item.content}
                              className="w-full h-full object-cover filter saturate-[1.05]"
                              loading="lazy"
                            />
                          </div>
                        )}
                        <div className="flex-1">
                          <h4
                            className={`title-${item.id} text-[1.8vw] leading-none max-[600px]:text-[5.4vw] font-serif text-[#f8f1f5]`}
                          >
                            {item.year} <span className="text-[#ff7399] font-sans text-[1.2vw] max-[600px]:text-[3.5vw] tracking-wider uppercase ml-1">{item.month}</span>
                          </h4>
                          {item.title && (
                            <strong className="text-[0.95vw] max-[600px]:text-[3.4vw] text-[#ff8cab] font-semibold block mt-1.5 leading-snug">
                              {item.title}
                            </strong>
                          )}
                          <p
                            className={`description-${item.id} text-[1.05vw] leading-[1.45] max-[600px]:text-[3.8vw] mt-1.5`}
                            style={mutedTextStyle}
                          >
                            {item.content}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export { CareerJourneyTimeline as TimelineSection };

