"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Award,
  Play,
  ExternalLink,
  Film,
  X,
  Clapperboard,
  Sparkles,
} from "lucide-react";
import { getStoredWorks } from "@/data/storage";
import {
  ProjectItem,
  filmography,
  filmographyCategories as categories,
  filmographyMeta,
} from "@/data/filmography";

export interface FilmographySectionProps {
  id?: string;
  initialItems?: ProjectItem[];
}

function getTrailerEmbedUrl(videoUrl?: string, youtubeId?: string): string | null {
  if (youtubeId && /^[a-zA-Z0-9_-]{11}$/.test(youtubeId.trim())) {
    return `https://www.youtube-nocookie.com/embed/${youtubeId.trim()}?autoplay=1&rel=0&playsinline=1`;
  }
  if (!videoUrl) return null;
  const trimmed = videoUrl.trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return `https://www.youtube-nocookie.com/embed/${trimmed}?autoplay=1&rel=0&playsinline=1`;
  }
  try {
    const url = new URL(trimmed);
    let id: string | null = null;
    if (url.hostname === "youtu.be") {
      id = url.pathname.slice(1);
    } else if (url.hostname.includes("youtube.com")) {
      id =
        url.searchParams.get("v") ||
        (url.pathname.startsWith("/embed/") ? url.pathname.slice(7) : null) ||
        (url.pathname.startsWith("/shorts/") ? url.pathname.slice(8) : null);
    }
    if (id && /^[a-zA-Z0-9_-]{11}$/.test(id)) {
      return `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&playsinline=1`;
    }
  } catch {}
  return null;
}

export function OnePageFilmography({
  id = "filmography",
  initialItems,
}: FilmographySectionProps) {
  const [items, setItems] = useState<ProjectItem[]>(
    initialItems && initialItems.length > 0 ? initialItems : filmography
  );
  const [filter, setFilter] = useState<string>("All");
  const [activeTrailer, setActiveTrailer] = useState<{
    title: string;
    embedUrl: string;
  } | null>(null);

  useEffect(() => {
    const loadItems = () => {
      fetch("/api/works", { cache: "no-store" })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data && Array.isArray(data.items) && data.items.length > 0) {
            setItems(data.items);
          } else {
            setItems(getStoredWorks());
          }
        })
        .catch(() => setItems(getStoredWorks()));
    };

    if (!initialItems || initialItems.length === 0) {
      loadItems();
    }

    const handleUpdate = () => loadItems();

    window.addEventListener("shirin_shila_works_updated", handleUpdate);
    window.addEventListener("shirin_shila_reset", handleUpdate);
    window.addEventListener("storage", (e) => {
      if (e.key === "shirin_shila_sync_works") loadItems();
    });
    return () => {
      window.removeEventListener("shirin_shila_works_updated", handleUpdate);
      window.removeEventListener("shirin_shila_reset", handleUpdate);
    };
  }, []);

  // Escape key closes active trailer modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && activeTrailer) {
        setActiveTrailer(null);
      }
    };
    if (activeTrailer) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeTrailer]);

  const filteredProjects =
    filter === "All" ? items : items.filter((item) => item.category === filter);

  return (
    <section id={id} className="section notable-works-section" style={{ paddingBottom: "60px" }}>
      {/* Section Header */}
      <motion.div
        className="section-head text-center"
        style={{ marginBottom: "28px" }}
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="section-kicker">{filmographyMeta.kicker}</div>
        <h2 className="serif">
          {filmographyMeta.titlePrefix}{" "}
          <span className="pink">{filmographyMeta.titleHighlight}</span>
        </h2>
        <p
          style={{
            maxWidth: "680px",
            margin: "12px auto 0",
            fontSize: "14.5px",
            color: "#94a3b8",
            lineHeight: 1.6,
          }}
        >
          Curated silver-screen feature films, television serials, and cinematic productions
          showcasing versatile character portrayals.
        </p>
      </motion.div>

      {/* Category Filter Tabs */}
      <motion.div
        className="poster-filter-bar"
        style={{ marginBottom: "32px", display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "10px" }}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.65, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
      >
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setFilter(cat)}
            className={`poster-filter-btn ${filter === cat ? "active" : ""}`}
            style={{
              padding: "8px 18px",
              borderRadius: "999px",
              fontSize: "13px",
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
          >
            {cat}
          </button>
        ))}
      </motion.div>

      {/* Image-Free Editorial Works Grid */}
      <div className="container" style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 20px" }}>
        {filteredProjects.length === 0 ? (
          <div
            style={{
              padding: "60px 20px",
              textAlign: "center",
              color: "#94a3b8",
              background: "rgba(255, 255, 255, 0.02)",
              borderRadius: "14px",
              border: "1px solid rgba(255, 63, 121, 0.15)",
              maxWidth: "600px",
              margin: "30px auto",
            }}
          >
            No titles available in the selected category. Check back soon for upcoming releases.
          </div>
        ) : (
          <motion.div
            layout
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
              gap: "24px",
            }}
          >
            {filteredProjects.map((project) => {
              const trailerEmbed = getTrailerEmbedUrl(project.videoUrl, project.youtubeId);

              return (
                <motion.div
                  key={project.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.45 }}
                  style={{
                    background: "rgba(16, 12, 18, 0.8)",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    borderRadius: "14px",
                    padding: "24px 22px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    backdropFilter: "blur(12px)",
                    transition: "border-color 0.25s ease, transform 0.25s ease, box-shadow 0.25s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "rgba(255, 63, 121, 0.45)";
                    e.currentTarget.style.transform = "translateY(-3px)";
                    e.currentTarget.style.boxShadow = "0 12px 30px rgba(0, 0, 0, 0.5)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.08)";
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <div>
                    {/* Top Badges Row */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        flexWrap: "wrap",
                        marginBottom: "14px",
                      }}
                    >
                      {project.year && (
                        <span
                          style={{
                            fontSize: "11px",
                            fontWeight: 700,
                            letterSpacing: "0.06em",
                            padding: "3px 10px",
                            borderRadius: "12px",
                            background: "rgba(255, 63, 121, 0.14)",
                            color: "#ff3f79",
                            border: "1px solid rgba(255, 63, 121, 0.3)",
                          }}
                        >
                          {project.year}
                        </span>
                      )}

                      {project.category && (
                        <span
                          style={{
                            fontSize: "11px",
                            fontWeight: 600,
                            padding: "3px 10px",
                            borderRadius: "12px",
                            background: "rgba(255, 255, 255, 0.06)",
                            color: "#cbd5e1",
                            border: "1px solid rgba(255, 255, 255, 0.1)",
                          }}
                        >
                          {project.category}
                        </span>
                      )}

                      {project.status && project.status !== "Released" && (
                        <span
                          style={{
                            fontSize: "11px",
                            fontWeight: 600,
                            padding: "3px 10px",
                            borderRadius: "12px",
                            background: "rgba(245, 158, 11, 0.12)",
                            color: "#fbbf24",
                            border: "1px solid rgba(245, 158, 11, 0.3)",
                          }}
                        >
                          {project.status}
                        </span>
                      )}
                    </div>

                    {/* Work Title */}
                    <div style={{ marginBottom: "12px" }}>
                      <h3
                        style={{
                          fontSize: "18px",
                          fontWeight: 700,
                          color: "#ffffff",
                          letterSpacing: "-0.01em",
                          lineHeight: 1.3,
                          margin: 0,
                        }}
                      >
                        {project.title}
                      </h3>
                      {project.banglaTitle && (
                        <span
                          style={{
                            display: "block",
                            fontSize: "13px",
                            color: "#ff7ca0",
                            marginTop: "3px",
                            fontWeight: 500,
                          }}
                        >
                          {project.banglaTitle}
                        </span>
                      )}
                    </div>

                    {/* Accolade Badge if present */}
                    {project.awards && (
                      <div
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                          fontSize: "11.5px",
                          fontWeight: 600,
                          color: "#facc15",
                          background: "rgba(250, 204, 21, 0.1)",
                          border: "1px solid rgba(250, 204, 21, 0.25)",
                          padding: "4px 10px",
                          borderRadius: "8px",
                          marginBottom: "14px",
                          width: "100%",
                        }}
                      >
                        <Award size={13} style={{ flexShrink: 0 }} />
                        <span style={{ lineHeight: 1.3 }}>{project.awards}</span>
                      </div>
                    )}

                    {/* Detailed Metadata List */}
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "6px",
                        fontSize: "12.5px",
                        color: "#cbd5e1",
                        marginBottom: "14px",
                        paddingBottom: "14px",
                        borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
                      }}
                    >
                      {project.role && (
                        <div>
                          <strong style={{ color: "#94a3b8" }}>Character: </strong>
                          <span style={{ color: "#f1f5f9" }}>{project.role}</span>
                        </div>
                      )}
                      {project.director && (
                        <div>
                          <strong style={{ color: "#94a3b8" }}>Director: </strong>
                          <span>{project.director}</span>
                        </div>
                      )}
                      {project.coStar && (
                        <div>
                          <strong style={{ color: "#94a3b8" }}>Co-Star: </strong>
                          <span>{project.coStar}</span>
                        </div>
                      )}
                      {project.productionHouse && (
                        <div>
                          <strong style={{ color: "#94a3b8" }}>Production: </strong>
                          <span>{project.productionHouse}</span>
                        </div>
                      )}
                    </div>

                    {/* Editorial Synopsis */}
                    {project.description && (
                      <p
                        style={{
                          fontSize: "13px",
                          color: "#94a3b8",
                          lineHeight: 1.55,
                          marginBottom: "18px",
                          display: "-webkit-box",
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {project.description}
                      </p>
                    )}
                  </div>

                  {/* Actions Row */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      flexWrap: "wrap",
                      paddingTop: "6px",
                    }}
                  >
                    {trailerEmbed && (
                      <button
                        type="button"
                        onClick={() =>
                          setActiveTrailer({
                            title: project.title,
                            embedUrl: trailerEmbed,
                          })
                        }
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                          fontSize: "12px",
                          fontWeight: 600,
                          padding: "7px 14px",
                          borderRadius: "8px",
                          background: "#ff3f79",
                          color: "#ffffff",
                          border: "none",
                          cursor: "pointer",
                          transition: "background 0.2s ease",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "#e51c44")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "#ff3f79")}
                      >
                        <Play size={12} fill="currentColor" />
                        <span>Watch Screener</span>
                      </button>
                    )}

                    {project.imdbUrl && (
                      <a
                        href={project.imdbUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "5px",
                          fontSize: "12px",
                          fontWeight: 500,
                          padding: "7px 12px",
                          borderRadius: "8px",
                          background: "rgba(255, 255, 255, 0.05)",
                          color: "#cbd5e1",
                          border: "1px solid rgba(255, 255, 255, 0.1)",
                          textDecoration: "none",
                          transition: "all 0.2s ease",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = "#ffffff";
                          e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.25)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = "#cbd5e1";
                          e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.1)";
                        }}
                      >
                        <span>IMDb</span>
                        <ExternalLink size={11} />
                      </a>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>

      {/* Video Trailer Modal */}
      <AnimatePresence>
        {activeTrailer && (
          <motion.div
            className="video-trailer-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveTrailer(null)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0, 0, 0, 0.85)",
              backdropFilter: "blur(8px)",
              zIndex: 1000,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "20px",
            }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                width: "min(860px, 94vw)",
                background: "#0d080e",
                borderRadius: "14px",
                border: "1px solid rgba(255, 63, 121, 0.3)",
                overflow: "hidden",
                boxShadow: "0 25px 50px rgba(0, 0, 0, 0.8)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "14px 20px",
                  borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Clapperboard size={16} color="#ff3f79" />
                  <span style={{ fontSize: "14px", fontWeight: 600, color: "#ffffff" }}>
                    {activeTrailer.title} — Official Trailer
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTrailer(null)}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "#94a3b8",
                    cursor: "pointer",
                    padding: "4px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "4px",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#ffffff")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "#94a3b8")}
                  aria-label="Close trailer preview"
                >
                  <X size={18} />
                </button>
              </div>

              <div style={{ position: "relative", paddingBottom: "56.25%", height: 0 }}>
                <iframe
                  src={activeTrailer.embedUrl}
                  title={`${activeTrailer.title} Trailer`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    border: "none",
                  }}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

export { OnePageFilmography as FilmographySection };
export default OnePageFilmography;
