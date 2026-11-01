"use client";

import { useEffect, useId, useRef, useState, useCallback, type CSSProperties, type PointerEvent } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
  Maximize2,
  Pause,
  Play,
  X,
  Award,
  Film,
  Info,
} from "lucide-react";

import "./glassy-carousel.css";


export interface GlassyCarouselItem {
  id: string;
  title: string;
  banglaTitle?: string;
  category?: string;
  year?: string;
  director?: string;
  coStar?: string;
  role?: string;
  productionHouse?: string;
  awards?: string;
  status?: string;
  subtitle: string;
  image: string;
  accent?: string;
  description?: string;
  href?: string;
  linkLabel?: string;
  trailerUrl?: string;
}

export interface GlassyCarouselProps {
  items: GlassyCarouselItem[];
  initialIndex?: number;
  layout?: "website" | "poster";
  interval?: number;
  autoPlay?: boolean;
  label?: string;
  className?: string;
  style?: CSSProperties;
  brand?: { image: string; lightImage?: string; alt: string; href?: string };
  onSelect?: (item: GlassyCarouselItem, index: number) => void;
}

const wrap = (value: number, length: number) => ((value % length) + length) % length;

function projectDomain(url?: string) {
  try {
    return url ? new URL(url).hostname.replace(/^www\./, "") : "Project details";
  } catch {
    return "Project details";
  }
}

function trailerEmbed(url?: string) {
  if (!url) return undefined;
  try {
    if (/^[\w-]{11}$/.test(url.trim())) {
      return `https://www.youtube-nocookie.com/embed/${url.trim()}?autoplay=1&rel=0&playsinline=1`;
    }
    const parsed = new URL(url);
    const videoId =
      parsed.hostname === "youtu.be"
        ? parsed.pathname.slice(1)
        : /(^|\.)youtube\.com$/.test(parsed.hostname)
        ? parsed.searchParams.get("v") ||
          (parsed.pathname.startsWith("/embed/") ? parsed.pathname.slice(7) : null) ||
          (parsed.pathname.startsWith("/shorts/") ? parsed.pathname.slice(8) : null)
        : null;
    return videoId && /^[\w-]{11}$/.test(videoId)
      ? `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&playsinline=1`
      : undefined;
  } catch {
    return undefined;
  }
}

export default function GlassyCarousel({
  items,
  initialIndex = 0,
  layout = "poster",
  interval = 6000,
  autoPlay = false,
  label = "Curated Filmography & Notable Works",
  className = "",
  style,
  brand,
  onSelect,
}: GlassyCarouselProps) {
  const [index, setIndex] = useState(Number.isFinite(initialIndex) ? Math.trunc(initialIndex) : 0);
  const [playing, setPlaying] = useState(autoPlay);
  const [reduced, setReduced] = useState(false);
  const [drag, setDrag] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [stageSize, setStageSize] = useState({ width: 1100, height: 400 });
  const [preview, setPreview] = useState<GlassyCarouselItem | null>(null);
  const [pageVisible, setPageVisible] = useState(true);
  const [hovered, setHovered] = useState(false);
  const [cardFocused, setCardFocused] = useState(false);

  const stage = useRef<HTMLDivElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const gesture = useRef<{ x: number; y: number; time: number; horizontal: boolean } | null>(null);
  const suppressClickUntil = useRef(0);
  const focusSelection = useRef(false);
  const id = useId();

  // Reset index when items array length changes (e.g. category filter switch)
  useEffect(() => {
    setIndex(0);
  }, [items.length]);

  const activeIndex = items.length ? wrap(index, items.length) : 0;
  const active = items[activeIndex];

  const cardWidth =
    layout === "poster"
      ? Math.min(260, stageSize.width * 0.55, Math.max(120, (stageSize.height - 20) / 1.5))
      : Math.min(420, stageSize.width * 0.72);

  const step = cardWidth * 0.78;
  const running =
    playing && !reduced && !preview && !dragging && pageVisible && !hovered && !cardFocused && items.length > 1;
  const duration = Number.isFinite(interval) ? Math.max(2500, interval) : 6000;
  const before = Math.min(2, Math.floor((items.length - 1) / 2));
  const after = Math.min(2, Math.ceil((items.length - 1) / 2));
  const slots =
    items.length > 1
      ? Array.from({ length: before + after + 3 }, (_, position) => index + position - before - 1)
      : [index];

  useEffect(() => setPlaying(autoPlay), [autoPlay]);

  useEffect(() => {
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!stage.current) return;
    const measure = () =>
      setStageSize({ width: stage.current!.clientWidth, height: stage.current!.clientHeight });
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(stage.current);
    return () => observer.disconnect();
  }, [items.length]);

  useEffect(() => {
    const update = () => setPageVisible(!document.hidden);
    update();
    document.addEventListener("visibilitychange", update);
    return () => document.removeEventListener("visibilitychange", update);
  }, []);

  useEffect(() => {
    if (!running) return;
    const timer = setTimeout(() => setIndex((current) => current + 1), duration);
    return () => clearTimeout(timer);
  }, [running, index, duration]);

  useEffect(() => {
    if (active) onSelect?.(active, activeIndex);
  }, [active, activeIndex, onSelect]);

  useEffect(() => {
    if (focusSelection.current) {
      stage.current?.querySelector<HTMLButtonElement>(".gc-card[data-active]")?.focus({ preventScroll: true });
      focusSelection.current = false;
    }
  }, [index]);

  useEffect(() => {
    if (preview && dialog.current && !dialog.current.open) dialog.current.showModal();
    if (!preview && dialog.current?.open) dialog.current.close();
  }, [preview]);

  const select = (next: number) => {
    setIndex(next);
    setDrag(0);
  };

  const open = useCallback((item: GlassyCarouselItem) => {
    if (typeof performance !== "undefined" && performance.now() > suppressClickUntil.current) {
      setPreview(item);
    }
  }, []);

  const pointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (!event.isPrimary || (event.pointerType === "mouse" && event.button !== 0)) return;
    gesture.current = { x: event.clientX, y: event.clientY, time: performance.now(), horizontal: false };
  };

  const pointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const start = gesture.current;
    if (!start) return;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    if (!start.horizontal && Math.abs(dy) > 12 && Math.abs(dy) > Math.abs(dx)) {
      gesture.current = null;
      return;
    }
    if (!start.horizontal && Math.abs(dx) > 8) {
      start.horizontal = true;
      event.currentTarget.setPointerCapture(event.pointerId);
      setDragging(true);
    }
    if (start.horizontal) setDrag(Math.max(-1.2, Math.min(1.2, dx / step)));
  };

  const pointerUp = (event: PointerEvent<HTMLDivElement>, cancel = false) => {
    const start = gesture.current;
    gesture.current = null;
    if (start?.horizontal) {
      const dx = event.clientX - start.x;
      const velocity = Math.abs(dx) / Math.max(1, performance.now() - start.time);
      if (
        !cancel &&
        (Math.abs(dx) > Math.min(55, cardWidth * 0.18) || (Math.abs(dx) > 14 && velocity > 0.35))
      ) {
        setIndex((current) => current + (dx < 0 ? 1 : -1));
      }
      suppressClickUntil.current = performance.now() + 300;
    }
    setDrag(0);
    setDragging(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  if (!items.length || !active) return null;

  const video = trailerEmbed(preview?.trailerUrl);
  const brandImages = brand && (
    <>
      <img className={brand.lightImage ? "gc-logo-dark" : undefined} src={brand.image} alt={brand.alt} />
      {brand.lightImage && <img className="gc-logo-light" src={brand.lightImage} alt={brand.alt} />}
    </>
  );

  return (
    <section
      data-layout={layout}
      className={`gc-shell dark ${className}`}
      aria-label={label}
      aria-roledescription="carousel"
      style={
        {
          "--gc-card-width": `${cardWidth}px`,
          "--gc-accent": active.accent || "#ff3f79",
          "--gc-duration": `${duration}ms`,
          ...style,
        } as CSSProperties
      }
      onKeyDown={(event) => {
        if (preview || event.altKey || event.ctrlKey || event.metaKey) return;
        if (["ArrowRight", "ArrowLeft", "Home", "End"].includes(event.key)) {
          focusSelection.current = (event.target as HTMLElement).closest(".gc-card") !== null;
        }
        if (event.key === "ArrowRight") {
          event.preventDefault();
          select(index + 1);
        }
        if (event.key === "ArrowLeft") {
          event.preventDefault();
          select(index - 1);
        }
        if (event.key === "Home") {
          event.preventDefault();
          select(0);
        }
        if (event.key === "End") {
          event.preventDefault();
          select(items.length - 1);
        }
      }}
    >
      <div className="gc-atmosphere" aria-hidden="true" />
      {brand && (
        <header className="gc-header">
          {brand.href ? (
            <a className="gc-brand" href={brand.href} target="_blank" rel="noreferrer">
              {brandImages}
            </a>
          ) : (
            <span className="gc-brand">{brandImages}</span>
          )}
        </header>
      )}
      <div
        className="gc-stage"
        ref={stage}
        data-dragging={dragging || undefined}
        onPointerDown={pointerDown}
        onPointerMove={pointerMove}
        onPointerUp={(event) => pointerUp(event)}
        onPointerCancel={(event) => pointerUp(event, true)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onFocusCapture={() => setCardFocused(true)}
        onBlurCapture={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setCardFocused(false);
        }}
      >
        <div className="gc-floor" aria-hidden="true" />
        {slots.map((slot) => {
          const item = items[wrap(slot, items.length)];
          const d = slot - index;
          const offset = d + drag;
          const abs = Math.abs(offset);
          const x = offset * step;
          const selected = slot === index;
          return (
            <button
              key={slot}
              type="button"
              className="gc-card"
              data-active={selected || undefined}
              tabIndex={selected ? 0 : -1}
              aria-label={
                selected
                  ? item.trailerUrl
                    ? `Watch ${item.title} trailer`
                    : `Preview ${item.title}`
                  : `Select ${item.title}`
              }
              aria-current={selected ? "true" : undefined}
              aria-hidden={d < -before || d > after || undefined}
              onClick={() => {
                if (performance.now() < suppressClickUntil.current) return;
                selected ? open(item) : select(index + d);
              }}
              style={
                {
                  transform: `translate3d(${x}px, 0, ${-Math.min(abs, 3) * 130}px) rotateY(${-Math.max(
                    -42,
                    Math.min(42, offset * 30),
                  )}deg) scale(${1 - Math.min(abs, 3) * 0.08})`,
                  opacity: d < -before || d > after ? 0 : 1,
                  zIndex: 10 - Math.abs(d),
                  pointerEvents: d < -before || d > after ? "none" : undefined,
                  "--gc-item-accent": item.accent,
                  "--gc-shade": Math.min(abs, 2) * 0.19,
                } as CSSProperties
              }
            >
              {layout === "website" && (
                <span className="gc-browser-bar" aria-hidden="true">
                  <span className="gc-browser-dots">
                    <i />
                    <i />
                    <i />
                  </span>
                  <span>{projectDomain(item.href)}</span>
                  <Maximize2 size={10} />
                </span>
              )}
              <span className="gc-poster">
                <img
                  src={item.image}
                  alt={`${item.title} ${layout === "poster" ? "poster" : "website preview"}`}
                  draggable={false}
                  loading={Math.abs(d) < 2 ? "eager" : "lazy"}
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = "/images/poster-begum-jaan.jpg";
                  }}
                />
                <span className="gc-poster-shade" aria-hidden="true" />
                {item.trailerUrl && (
                  <span className="gc-watch" aria-hidden="true">
                    <Play size={12} fill="currentColor" strokeWidth={0} /> Watch trailer
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>

      {/* Improved Editorial Spotlight Details */}
      <div className="gc-bottom">
        <div className="gc-active-info">
          {/* Category & Year Tags */}
          <div className="gc-active-badges">
            {active.category && <span className="gc-tag">{active.category}</span>}
            {active.year && <span className="gc-tag">{active.year}</span>}
            {active.status && active.status !== "Released" && (
              <span className="gc-tag gc-tag-gold">{active.status}</span>
            )}
            {active.awards && (
              <span className="gc-tag gc-tag-gold" style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                <Award size={11} /> {active.awards}
              </span>
            )}
          </div>

          {/* Large Title & Bangla Title */}
          <h3 className="gc-active-title">
            {active.title}
            {active.banglaTitle && <span className="gc-active-bangla">({active.banglaTitle})</span>}
          </h3>

          {/* Cast & Crew Line */}
          {(active.role || active.director || active.coStar) && (
            <div className="gc-active-meta-row">
              {active.role && (
                <span className="gc-active-meta-item">
                  <strong>Role:</strong> {active.role}
                </span>
              )}
              {active.director && (
                <span className="gc-active-meta-item">
                  <strong>Director:</strong> {active.director}
                </span>
              )}
              {active.coStar && (
                <span className="gc-active-meta-item">
                  <strong>Co-Star:</strong> {active.coStar}
                </span>
              )}
            </div>
          )}

          {/* Description */}
          {active.description && <p className="gc-active-desc">{active.description}</p>}

          {/* Interactive Action Buttons */}
          <div className="gc-active-actions">
            <button
              type="button"
              onClick={() => open(active)}
              className="gc-action-btn gc-action-btn-primary"
            >
              {active.trailerUrl ? <Play size={13} fill="currentColor" /> : <Info size={13} />}
              <span>{active.trailerUrl ? "Watch Trailer / Screener" : "Project Details"}</span>
            </button>
            {active.href && (
              <a
                href={active.href}
                target="_blank"
                rel="noreferrer"
                className="gc-action-btn gc-action-btn-secondary"
              >
                <span>{active.linkLabel || "View on IMDb"}</span>
                <ArrowUpRight size={13} />
              </a>
            )}
          </div>
        </div>

        {/* Carousel Control Dock */}
        <div className="gc-dock" role="group" aria-label="Carousel controls">
          <span className="gc-position" aria-hidden="true">
            <span>{String(activeIndex + 1).padStart(2, "0")}</span>
            <span>/</span>
            <span>{String(items.length).padStart(2, "0")}</span>
          </span>
          <div className="gc-transport">
            <button
              type="button"
              onClick={() => select(index - 1)}
              aria-label="Previous slide"
              disabled={items.length < 2}
            >
              <ChevronLeft size={19} />
            </button>
            <button
              type="button"
              className="gc-play-toggle"
              onClick={() => setPlaying((value) => !value)}
              aria-label={playing ? "Pause carousel" : "Play carousel"}
              aria-pressed={playing}
              disabled={reduced || items.length < 2}
            >
              {playing ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" />}
            </button>
            <button
              type="button"
              onClick={() => select(index + 1)}
              aria-label="Next slide"
              disabled={items.length < 2}
            >
              <ChevronRight size={19} />
            </button>
          </div>
        </div>
        <p className="gc-hint">
          <span>Drag to explore</span>
          <span className="gc-hint-separator">or</span>
          <ArrowLeft size={12} />
          <ArrowRight size={12} />
          <span>to browse</span>
        </p>
      </div>

      <p className="gc-sr-only" aria-live="polite" aria-atomic="true">
        {!playing && `${active.title}. ${activeIndex + 1} of ${items.length}.`}
      </p>

      {/* Deluxe Cinema Festival Modal Dialog */}
      <dialog
        ref={dialog}
        className="gc-dialog"
        aria-labelledby={`${id}-preview-title`}
        onCancel={() => setPreview(null)}
        onClose={() => setPreview(null)}
        onClick={(event) => {
          if (event.target === event.currentTarget) setPreview(null);
        }}
      >
        {preview && (
          <div className="gc-dialog-panel">
            {/* Modal Bar */}
            <div className="gc-dialog-bar">
              <span>
                <i /> {video ? "Official Video Screener" : "Official Cinema Archive"}
                {preview.category && <span>• {preview.category}</span>}
                {preview.year && <span>• {preview.year}</span>}
              </span>
              <button type="button" onClick={() => setPreview(null)}>
                <X size={15} /> Close
              </button>
            </div>

            {/* Video / Poster Screen */}
            <div className={`gc-project-preview ${video ? "is-video" : "is-image"}`}>
              {video ? (
                <iframe
                  src={video}
                  title={`${preview.title} official trailer`}
                  allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                  allowFullScreen
                  referrerPolicy="strict-origin-when-cross-origin"
                />
              ) : (
                <div className="gc-poster-stage">
                  {/* Atmospheric blurred ambient halo from poster colors */}
                  <img
                    src={preview.image}
                    alt=""
                    aria-hidden="true"
                    className="gc-poster-backdrop"
                  />
                  {/* Full sharp uncropped movie poster */}
                  <img
                    src={preview.image}
                    alt={`${preview.title} preview`}
                    className="gc-poster-foreground"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = "/images/poster-begum-jaan.jpg";
                    }}
                  />
                </div>
              )}
            </div>

            {/* Two Column Grid */}
            <div className="gc-dialog-grid">
              {/* Left Column: Synopsis & Narrative */}
              <div className="gc-dialog-main">
                <h2 id={`${id}-preview-title`}>
                  {preview.title}
                  {preview.banglaTitle && (
                    <span style={{ fontSize: "0.8em", color: "#ff7399", marginLeft: 8 }}>
                      ({preview.banglaTitle})
                    </span>
                  )}
                </h2>

                <p className="gc-dialog-synopsis">{preview.description}</p>

                {preview.awards && (
                  <div className="gc-dialog-award-box">
                    <Award size={18} style={{ flexShrink: 0, marginTop: 2 }} />
                    <div>
                      <strong style={{ display: "block", color: "#fef08a", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                        Accolades & Recognition
                      </strong>
                      <span>{preview.awards}</span>
                    </div>
                  </div>
                )}

                {/* External Actions */}
                <div style={{ marginTop: 20, display: "flex", gap: 12, flexWrap: "wrap" }}>
                  {preview.trailerUrl && (
                    <a
                      className="gc-action-btn gc-action-btn-primary"
                      href={preview.trailerUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <Play size={13} fill="currentColor" />
                      <span>Watch Full Clip on YouTube</span>
                      <ArrowUpRight size={13} />
                    </a>
                  )}
                  {preview.href && (
                    <a
                      className="gc-action-btn gc-action-btn-secondary"
                      href={preview.href}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <span>{preview.linkLabel || "View on IMDb"}</span>
                      <ArrowUpRight size={13} />
                    </a>
                  )}
                </div>
              </div>

              {/* Right Column: Structured Metadata Card */}
              <div className="gc-dialog-meta-card">
                <div className="gc-dialog-meta-row">
                  <span className="gc-dialog-meta-label">Format / Category</span>
                  <span className="gc-dialog-meta-val">{preview.category || "Cinema Feature"}</span>
                </div>

                <div className="gc-dialog-meta-row">
                  <span className="gc-dialog-meta-label">Release Year</span>
                  <span className="gc-dialog-meta-val">{preview.year || "Archive"}</span>
                </div>

                {preview.role && (
                  <div className="gc-dialog-meta-row">
                    <span className="gc-dialog-meta-label">Character / Role</span>
                    <span className="gc-dialog-meta-val" style={{ color: "#ff7399" }}>
                      {preview.role}
                    </span>
                  </div>
                )}

                {preview.director && (
                  <div className="gc-dialog-meta-row">
                    <span className="gc-dialog-meta-label">Director</span>
                    <span className="gc-dialog-meta-val">{preview.director}</span>
                  </div>
                )}

                {preview.coStar && (
                  <div className="gc-dialog-meta-row">
                    <span className="gc-dialog-meta-label">Co-Stars / Cast</span>
                    <span className="gc-dialog-meta-val">{preview.coStar}</span>
                  </div>
                )}

                {preview.productionHouse && (
                  <div className="gc-dialog-meta-row">
                    <span className="gc-dialog-meta-label">Production House</span>
                    <span className="gc-dialog-meta-val">{preview.productionHouse}</span>
                  </div>
                )}

                {preview.status && (
                  <div className="gc-dialog-meta-row">
                    <span className="gc-dialog-meta-label">Distribution Status</span>
                    <span className="gc-dialog-meta-val">{preview.status}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </dialog>
    </section>
  );
}
