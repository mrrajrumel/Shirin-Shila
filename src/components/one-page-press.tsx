"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ExternalLink, X, ZoomIn, ChevronLeft, ChevronRight } from "lucide-react";
import { getStoredPress } from "@/data/storage";
import { PressItem, pressMeta } from "@/data/press";

export interface PressSectionProps {
  id?: string;
}

export function OnePagePress({ id = "press" }: PressSectionProps) {
  const [items, setItems] = useState<PressItem[]>([]);
  const [activeTab, setActiveTab] = useState<"All" | "News article" | "Newspaper clipping">("All");
  const [activeClipping, setActiveClipping] = useState<PressItem | null>(null);
  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadItems = () => {
      fetch("/api/press", { cache: "no-store" })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data && data.items && data.items.length > 0) {
            setItems(data.items);
          } else {
            setItems(getStoredPress());
          }
        })
        .catch(() => setItems(getStoredPress()));
    };

    loadItems();

    const handleUpdate = () => {
      loadItems();
    };

    window.addEventListener("shirin_shila_press_updated", handleUpdate);
    window.addEventListener("shirin_shila_reset", handleUpdate);
    window.addEventListener("storage", (e) => {
      if (e.key === "shirin_shila_sync_press") loadItems();
    });
    return () => {
      window.removeEventListener("shirin_shila_press_updated", handleUpdate);
      window.removeEventListener("shirin_shila_reset", handleUpdate);
    };
  }, []);

  const filteredItems = items.filter((item) => {
    if (activeTab === "All") return true;
    return item.kind === activeTab;
  });

  const scroll = (direction: "left" | "right") => {
    if (carouselRef.current) {
      const scrollAmount = direction === "left" ? -360 : 360;
      carouselRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  return (
    <section id={id} className="section notable-works-section press-section">
      <motion.div
        className="section-head text-center"
        style={{ marginBottom: "24px" }}
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="section-kicker">{pressMeta.kicker}</div>
        <h2 className="serif">
          {pressMeta.titlePrefix} <span className="pink">{pressMeta.titleHighlight}</span> {pressMeta.titleSuffix}
        </h2>
        {pressMeta.subtitle && (
          <p className="muted" style={{ marginTop: 8, fontSize: "0.95rem" }}>
            {pressMeta.subtitle}
          </p>
        )}
      </motion.div>

      {/* Category Filter Tabs matching Notable Works */}
      <motion.div
        className="poster-filter-bar"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.65, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
      >
        <button
          type="button"
          onClick={() => setActiveTab("All")}
          className={`poster-filter-btn ${activeTab === "All" ? "active" : ""}`}
        >
          All Coverage
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("News article")}
          className={`poster-filter-btn ${activeTab === "News article" ? "active" : ""}`}
        >
          Online News
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("Newspaper clipping")}
          className={`poster-filter-btn ${activeTab === "Newspaper clipping" ? "active" : ""}`}
        >
          Newspaper Clippings
        </button>
      </motion.div>

      {/* Press Carousel */}
      <motion.div
        className="poster-carousel-wrapper"
        initial={{ opacity: 0, y: 36 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.75, delay: 0.14, ease: [0.16, 1, 0.3, 1] }}
      >
        <button
          type="button"
          onClick={() => scroll("left")}
          className="poster-nav-btn prev"
          aria-label="Previous press coverage"
        >
          <ChevronLeft size={22} />
        </button>

        <div className="poster-carousel-track" ref={carouselRef}>
          {filteredItems.map((item) => {
            const isPaperCut = item.kind === "Newspaper clipping";

            if (isPaperCut) {
              return (
                <div
                  key={item.id}
                  className="press-carousel-item press-papercut-card group"
                  onClick={() => setActiveClipping(item)}
                  title="Click to view full newspaper clipping"
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") setActiveClipping(item);
                  }}
                >
                  <div className="papercut-img-wrapper">
                    <img
                      src={item.image}
                      alt={item.headline || "Newspaper Clipping"}
                      loading="lazy"
                      className="papercut-img"
                    />
                    <div className="papercut-overlay">
                      <span className="papercut-zoom-badge">
                        <ZoomIn size={16} />
                        <span>View Full Clipping</span>
                      </span>
                    </div>
                  </div>
                  <div className="news-details">
                    <div className="news-meta-row">
                      <span className="news-publication">{item.publication}</span>
                      {item.date && (
                        <>
                          <span className="news-dot">•</span>
                          <span className="news-date">{item.date}</span>
                        </>
                      )}
                    </div>
                    <h3 className="news-title serif">{item.headline || "Archived Print Feature"}</h3>
                    <div className="news-read-link">
                      <ZoomIn size={14} style={{ marginRight: 6 }} />
                      <span>View Full High-Res Clipping</span>
                    </div>
                  </div>
                </div>
              );
            }

            return (
              <a
                key={item.id}
                href={item.url || "#"}
                target={item.url ? "_blank" : undefined}
                rel="noreferrer"
                className="press-carousel-item press-news-card"
              >
                <div className="news-cover-wrapper">
                  <img
                    src={item.image}
                    alt={item.headline}
                    loading="lazy"
                    className="news-cover-img"
                  />
                </div>

                <div className="news-details">
                  <div className="news-meta-row">
                    <span className="news-publication">{item.publication}</span>
                    <span className="news-dot">•</span>
                    <span className="news-date">{item.date}</span>
                  </div>
                  <h3 className="news-title serif">{item.headline}</h3>
                  <div className="news-read-link">
                    <span>Read Article</span>
                    <ExternalLink size={13} style={{ marginLeft: 6 }} />
                  </div>
                </div>
              </a>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => scroll("right")}
          className="poster-nav-btn next"
          aria-label="Next press coverage"
        >
          <ChevronRight size={22} />
        </button>
      </motion.div>

      {/* Full Clipping Zoom Modal */}
      {activeClipping && (
        <div
          className="film-modal-overlay"
          onClick={() => setActiveClipping(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="papercut-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="film-modal-close"
              onClick={() => setActiveClipping(null)}
              aria-label="Close"
            >
              <X size={22} />
            </button>
            <div className="papercut-modal-img-wrap">
              <img
                src={activeClipping.image}
                alt={activeClipping.headline || "Archived Newspaper Clipping"}
                className="papercut-modal-img"
              />
            </div>
            <div className="papercut-modal-footer">
              <span>{activeClipping.publication}</span>
              {activeClipping.date && <span> • {activeClipping.date}</span>}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export { OnePagePress as PressSection };
export default OnePagePress;
