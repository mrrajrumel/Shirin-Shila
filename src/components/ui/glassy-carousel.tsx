"use client";

import { useEffect, useId, useRef, useState, type CSSProperties, type PointerEvent } from "react";
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
  Sparkles,
  Info,
} from "lucide-react";

const glassyCarouselStyles = `
.gc-shell {
  color-scheme: dark;
  --gc-default-bg: transparent;
  --gc-default-fg: #f8f1f5;
  --gc-default-card: #130f18;
  --gc-default-muted: #a697a4;
  --gc-default-border: rgba(255, 63, 121, 0.28);
  --gc-default-primary: #ff3f79;
  --gc-default-primary-ink: #ffffff;
  --gc-background: var(--carousel-background, var(--gc-default-bg));
  --gc-foreground: var(--color-foreground, var(--gc-default-fg));
  --gc-card: var(--color-card, var(--gc-default-card));
  --gc-muted: var(--gc-default-muted);
  --gc-border: var(--color-border, var(--gc-default-border));
  --gc-primary: var(--color-primary, var(--gc-default-primary));
  --gc-primary-ink: var(--color-primary-foreground, var(--gc-default-primary-ink));
  --gc-hover: color-mix(in srgb, var(--gc-foreground) 8%, transparent);
  --gc-shadow: var(--carousel-shadow-color, rgba(0, 0, 0, 0.85));
}
:where(.dark,[data-theme=dark]) .gc-shell, .gc-shell.dark { color-scheme: dark; }
.gc-card { color: var(--gc-foreground); }
.gc-dialog * { box-sizing: border-box; }
.gc-dialog a:focus-visible, .gc-dialog button:focus-visible { outline: 2px solid var(--gc-primary); outline-offset: 4px; }
.gc-shell {
  box-sizing: border-box;
  position: relative;
  isolation: isolate;
  display: flex;
  flex-direction: column;
  min-height: 560px;
  width: 100%;
  padding-bottom: 24px;
  background: var(--gc-background);
  color: var(--gc-foreground);
  font-family: inherit;
  -webkit-font-smoothing: antialiased;
}
.gc-shell * { box-sizing: border-box; }
.gc-shell ::selection { background: var(--gc-primary); color: var(--gc-primary-ink); }
.gc-shell button, .gc-shell a { -webkit-tap-highlight-color: transparent; }
.gc-shell button { font: inherit; color: inherit; cursor: pointer; }
.gc-shell button:disabled { opacity: .35; cursor: default; }
.gc-shell button:focus-visible, .gc-shell a:focus-visible { outline: 2px solid var(--gc-primary); outline-offset: 5px; }
.gc-atmosphere {
  position: absolute;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  background: radial-gradient(ellipse at 50% 36%, color-mix(in srgb, var(--gc-primary) 12%, transparent), transparent 72%);
}
.gc-header { display: flex; align-items: center; padding: 0 5%; z-index: 20; }
.gc-brand { display: inline-flex; align-items: center; text-decoration: none; }
.gc-brand > img { width: 172px; height: auto; display: block; }

.gc-stage {
  position: relative;
  min-height: 380px;
  height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
  perspective: 1100px;
  transform-style: preserve-3d;
  touch-action: pan-y;
  user-select: none;
  cursor: grab;
  padding: 10px 0;
}
.gc-stage[data-dragging] { cursor: grabbing; }
.gc-floor {
  position: absolute;
  bottom: 0;
  left: 50%;
  width: min(600px, 80vw);
  height: 35px;
  transform: translate(-50%);
  background: radial-gradient(ellipse, color-mix(in srgb, var(--gc-shadow) 50%, transparent), transparent 70%);
  filter: blur(12px);
  pointer-events: none;
}
.gc-card {
  position: absolute;
  width: var(--gc-card-width);
  margin: 0;
  padding: 6px;
  display: block;
  border: 1.5px solid var(--gc-border);
  border-radius: 14px;
  background: var(--gc-card);
  box-shadow: inset 0 1px color-mix(in srgb, var(--gc-foreground) 8%, transparent), 0 18px 32px color-mix(in srgb, var(--gc-shadow) 50%, transparent);
  backface-visibility: hidden;
  transition: transform .7s cubic-bezier(.22, 1, .36, 1), opacity .5s ease, border-color .25s, box-shadow .25s;
  will-change: transform;
  cursor: pointer;
  outline-offset: 7px !important;
  text-align: center;
}
.gc-card[data-active] {
  border-color: var(--gc-primary);
  box-shadow: inset 0 1px color-mix(in srgb, var(--gc-foreground) 12%, transparent), 0 24px 44px color-mix(in srgb, var(--gc-shadow) 60%, transparent), 0 0 28px rgba(255, 63, 121, 0.4);
}
.gc-stage[data-dragging] .gc-card { transition: none; }
.gc-poster {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  width: 100%;
  aspect-ratio: 2/3;
  overflow: hidden;
  border-radius: 9px;
  background: #09050c;
  box-shadow: inset 0 2px 10px rgba(0, 0, 0, 0.7);
}
.gc-poster > img {
  max-width: 100%;
  max-height: 100%;
  width: auto;
  height: auto;
  object-fit: contain;
  object-position: center;
  display: block;
  pointer-events: none;
  filter: drop-shadow(0 8px 18px rgba(0, 0, 0, 0.8));
  transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}
.gc-card:hover .gc-poster > img {
  transform: scale(1.04);
}
.gc-poster-shade {
  position: absolute;
  inset: 0;
  background: #000;
  opacity: var(--gc-shade, 0);
  transition: opacity .4s;
  pointer-events: none;
}
.gc-browser-bar {
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 0 4px 8px;
  font-size: 10px;
  color: var(--gc-muted);
}
.gc-browser-dots { display: flex; gap: 4px; }
.gc-browser-dots i { width: 4px; height: 4px; border-radius: 50%; background: var(--gc-border); }

/* Bottom Spotlight Details Area */
.gc-bottom {
  position: relative;
  z-index: 12;
  display: flex;
  align-items: center;
  flex-direction: column;
  gap: 14px;
  padding: 16px 20px 0;
}
.gc-active-info {
  text-align: center;
  max-width: 840px;
  width: 100%;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}
.gc-active-badges {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
.gc-tag {
  font-size: 11px;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  padding: 3px 10px;
  border-radius: 9999px;
  background: rgba(255, 63, 121, 0.12);
  border: 1px solid rgba(255, 63, 121, 0.32);
  color: #ff7399;
}
.gc-tag-gold {
  background: rgba(245, 158, 11, 0.14);
  border: 1px solid rgba(245, 158, 11, 0.38);
  color: #fbbf24;
}
.gc-active-title {
  font-size: clamp(22px, 3.2vw, 34px);
  font-weight: 600;
  line-height: 1.2;
  color: #ffffff;
  margin: 0;
  font-family: var(--font-serif, "Playfair Display", Georgia, serif);
}
.gc-active-bangla {
  font-size: 0.82em;
  color: #ff7399;
  margin-left: 8px;
  font-weight: normal;
}
.gc-active-meta-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 16px;
  font-size: 13px;
  color: #cbd5e1;
  margin-top: 2px;
}
.gc-active-meta-item strong {
  color: #94a3b8;
  font-weight: 500;
  margin-right: 4px;
}
.gc-active-desc {
  font-size: 13.5px;
  line-height: 1.6;
  color: #cbd5e1;
  max-width: 660px;
  margin: 4px 0 6px;
  text-align: center;
}
.gc-active-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-top: 4px;
}
.gc-action-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 500;
  padding: 7px 16px;
  border-radius: 9999px;
  cursor: pointer;
  transition: all 0.18s ease;
  text-decoration: none;
}
.gc-action-btn-primary {
  background: linear-gradient(135deg, #ff3f79, #e11d48);
  color: #fff;
  border: 1px solid rgba(255, 63, 121, 0.4);
  box-shadow: 0 0 16px rgba(255, 63, 121, 0.35);
}
.gc-action-btn-primary:hover {
  background: linear-gradient(135deg, #ff5287, #f43f5e);
  box-shadow: 0 0 24px rgba(255, 63, 121, 0.55);
}
.gc-action-btn-secondary {
  background: rgba(255, 255, 255, 0.06);
  color: #e2e8f0;
  border: 1px solid rgba(255, 255, 255, 0.12);
}
.gc-action-btn-secondary:hover {
  background: rgba(255, 255, 255, 0.12);
  color: #fff;
}

/* Control Dock */
.gc-dock {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 5px 8px 5px 19px;
  border: 1px solid var(--gc-border);
  border-radius: 40px;
  background: color-mix(in srgb, var(--gc-card) 92%, transparent);
  box-shadow: inset 0 1px 0 var(--gc-hover), 0 8px 24px color-mix(in srgb, var(--gc-shadow) 28%, transparent);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  margin-top: 4px;
}
.gc-position {
  display: flex;
  align-items: center;
  gap: 7px;
  padding-right: 15px;
  border-right: 1px solid var(--gc-border);
  font-size: 11px;
  font-variant-numeric: tabular-nums;
  color: var(--gc-muted);
}
.gc-position > span:first-child { color: var(--gc-foreground); font-weight: 600; }
.gc-transport { display: flex; align-items: center; gap: 3px; }
.gc-dock button {
  border: 0;
  background: none;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  color: var(--gc-foreground);
  transition: background .16s, color .16s;
}
.gc-dock button:hover, .gc-transport .gc-play-toggle { background: var(--gc-hover); color: var(--gc-foreground); }
.gc-play-toggle svg { stroke-width: 0; }
.gc-hint {
  display: flex;
  align-items: center;
  gap: 7px;
  margin: 0;
  color: var(--gc-muted);
  font-size: 11px;
  line-height: 1.5;
}
.gc-hint-separator { color: var(--gc-muted); margin: 0 2px; }
.gc-sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* Modal Dialog */
.gc-dialog {
  padding: 0;
  border: 1px solid rgba(255, 63, 121, 0.35);
  border-radius: 18px;
  width: min(920px, calc(100vw - 32px));
  max-height: calc(100svh - 40px);
  background: #0f0c16;
  color: var(--gc-foreground);
  box-shadow: 0 35px 120px rgba(0, 0, 0, 0.92);
  overflow-y: auto;
  scrollbar-color: var(--gc-muted) var(--gc-card);
  font-family: inherit;
}
.gc-dialog::backdrop {
  background: rgba(0, 0, 0, 0.88);
  backdrop-filter: blur(12px);
}
.gc-dialog[open] { animation: gc-modal-in .3s cubic-bezier(.22, 1, .36, 1); }
@keyframes gc-modal-in {
  0% { opacity: 0; transform: translateY(12px) scale(.98); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}
.gc-dialog-panel { padding: 22px 26px; }
.gc-dialog-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 14px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  margin-bottom: 18px;
  gap: 16px;
}
.gc-dialog-bar > span {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: var(--gc-muted);
}
.gc-dialog-bar i { width: 6px; height: 6px; border-radius: 50%; background: var(--gc-primary); }
.gc-dialog-bar button {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  font-size: 12px;
  min-height: 38px;
  color: var(--gc-foreground);
  transition: all 0.15s ease;
}
.gc-dialog-bar button:hover {
  background: rgba(255, 63, 121, 0.15);
  border-color: rgba(255, 63, 121, 0.4);
  color: #fff;
}
.gc-project-preview {
  aspect-ratio: 16/9;
  border-radius: 12px;
  background: #000;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.08);
}
.gc-project-preview > iframe, .gc-project-preview > img {
  border: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.gc-dialog-grid {
  display: grid;
  grid-template-columns: 1fr 310px;
  gap: 24px;
  margin-top: 20px;
}
@media (max-width: 768px) {
  .gc-dialog-grid {
    grid-template-columns: 1fr;
  }
}
.gc-dialog-main h2 {
  font-size: 24px;
  font-weight: 600;
  margin: 0 0 10px;
  color: #fff;
  font-family: var(--font-serif, "Playfair Display", Georgia, serif);
}
.gc-dialog-synopsis {
  font-size: 14px;
  line-height: 1.65;
  color: #cbd5e1;
  margin: 0 0 16px;
}
.gc-dialog-award-box {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px 16px;
  border-radius: 10px;
  background: rgba(245, 158, 11, 0.08);
  border: 1px solid rgba(245, 158, 11, 0.28);
  color: #fbbf24;
  font-size: 13px;
  margin-top: 14px;
}
.gc-dialog-meta-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.gc-dialog-meta-row {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}
.gc-dialog-meta-row:last-child {
  border-bottom: none;
  padding-bottom: 0;
}
.gc-dialog-meta-label {
  font-size: 11px;
  text-transform: uppercase;
  font-family: ui-monospace, monospace;
  color: #94a3b8;
  letter-spacing: 0.05em;
}
.gc-dialog-meta-val {
  font-size: 13.5px;
  font-weight: 500;
  color: #f1f5f9;
}

.gc-shell[data-layout=poster] .gc-poster {
  aspect-ratio: 2/3;
  display: flex;
  align-items: center;
  justify-content: center;
}
.gc-shell[data-layout=poster] .gc-poster > img {
  max-width: 100%;
  max-height: 100%;
  width: auto;
  height: auto;
  object-fit: contain;
  object-position: center;
}
.gc-watch {
  position: absolute;
  bottom: 14px;
  left: 50%;
  transform: translate(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 38px;
  white-space: nowrap;
  border-radius: 24px;
  padding: 7px 16px;
  background: color-mix(in srgb, var(--gc-card) 95%, transparent);
  border: 1px solid var(--gc-border);
  backdrop-filter: blur(8px);
  font-size: 11.5px;
  font-weight: 600;
  color: #fff;
  opacity: 0;
  transition: opacity .2s, background .2s;
  box-shadow: 0 4px 16px rgba(0,0,0,0.5);
}
.gc-card[data-active] .gc-watch { opacity: 1; }
.gc-card[data-active]:hover .gc-watch {
  background: var(--gc-primary);
  color: var(--gc-primary-ink);
}
@media (min-width: 1600px) {
  .gc-stage { perspective: 1250px; }
}
@media (max-width: 600px) {
  .gc-shell { min-height: 500px; padding-bottom: 16px; }
  .gc-header { padding: 0 6%; }
  .gc-stage { perspective: 900px; min-height: 320px; height: 340px; }
  .gc-card { padding: 5px; border-radius: 12px; }
  .gc-poster { border-radius: 7px; }
  .gc-bottom { gap: 12px; padding-top: 10px; }
  .gc-active-title { font-size: 22px; }
  .gc-active-desc { font-size: 12px; }
  .gc-dialog-panel { padding: 16px; }
}
`;

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

  const open = (item: GlassyCarouselItem) => {
    if (performance.now() > suppressClickUntil.current) setPreview(item);
  };

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
      <style>{glassyCarouselStyles}</style>
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
            <div className="gc-project-preview">
              {video ? (
                <iframe
                  src={video}
                  title={`${preview.title} official trailer`}
                  allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                  allowFullScreen
                  referrerPolicy="strict-origin-when-cross-origin"
                />
              ) : (
                <img
                  src={preview.image}
                  alt={`${preview.title} preview`}
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = "/images/poster-begum-jaan.jpg";
                  }}
                />
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
