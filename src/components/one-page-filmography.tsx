"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, X, Award, Play, ExternalLink } from "lucide-react";
import { getStoredWorks } from "@/data/storage";
import {
  ProjectItem,
  filmographyCategories as categories,
  filmographyMeta,
} from "@/data/filmography";

export interface FilmographySectionProps {
  id?: string;
}

function getYoutubeId(item?: ProjectItem | null): string | null {
  if (!item) return null;
  if (item.youtubeId) return item.youtubeId;
  if (item.videoUrl) {
    const match = item.videoUrl.match(
      /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/
    );
    if (match && match[1]) return match[1];
  }
  if (item.image && item.image.includes("img.youtube.com/vi/")) {
    const match = item.image.match(/img\.youtube\.com\/vi\/([\w-]{11})/);
    if (match && match[1]) return match[1];
  }
  return null;
}

export function OnePageFilmography({ id = "filmography" }: FilmographySectionProps) {
  const [items, setItems] = useState<ProjectItem[]>([]);
  const [filter, setFilter] = useState<string>("All");
  const [selectedPoster, setSelectedPoster] = useState<ProjectItem | null>(null);
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);

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

    loadItems();

    const handleUpdate = () => {
      loadItems();
    };

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

  const filteredItems =
    filter === "All" ? items : items.filter((item) => item.category === filter);

  useEffect(() => {
    if (carouselRef.current) {
      carouselRef.current.scrollTo({ left: 0, behavior: "smooth" });
    }
  }, [filter]);

  const scroll = (direction: "left" | "right") => {
    if (carouselRef.current) {
      const scrollAmount = direction === "left" ? -340 : 340;
      carouselRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  return (
    <section id={id} className="section notable-works-section">
      <motion.div
        className="section-head text-center"
        style={{ marginBottom: "24px" }}
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="section-kicker">{filmographyMeta.kicker}</div>
        <h2 className="serif">
          {filmographyMeta.titlePrefix} <span className="pink">{filmographyMeta.titleHighlight}</span>
        </h2>
      </motion.div>

      {/* Category Filter Tabs */}
      <motion.div
        className="poster-filter-bar"
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
          >
            {cat}
          </button>
        ))}
      </motion.div>

      {/* Poster Carousel Container */}
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
          aria-label="Previous posters"
        >
          <ChevronLeft size={22} />
        </button>

        <div className="poster-carousel-track" ref={carouselRef}>
          {filteredItems.map((item) => {
            const ytId = getYoutubeId(item);
            const isVideo =
              item.category === "Music Video" ||
              item.category === "TV Show Judge" ||
              Boolean(ytId || item.videoUrl);
            const isLandscape =
              Boolean(ytId) ||
              (item.image && item.image.includes("youtube")) ||
              item.category === "Music Video";

            return (
              <div
                key={item.id}
                className="poster-card"
                onClick={() => {
                  setSelectedPoster(item);
                  setIsPlayingVideo(false);
                }}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    setSelectedPoster(item);
                    setIsPlayingVideo(false);
                  }
                }}
              >
                {/* Category Badge Pill on Card */}
                <div className="poster-top-badge">
                  {item.category === "TV Show Judge" ? "TV Judge" : item.category}
                </div>

                {/* Video Play Badge for interactive reels */}
                {isVideo && (
                  <div className="poster-video-badge" title="Watch Video Reel">
                    <Play size={13} fill="#ffffff" style={{ marginLeft: "2px" }} />
                  </div>
                )}

                <div className="poster-image-box">
                  {/* Ambient Backdrop Blur for widescreen images */}
                  <div
                    className="poster-ambient-backdrop"
                    style={{
                      backgroundImage: `url(${item.image || "/images/poster-begum-jaan.jpg"})`,
                    }}
                  />

                  {/* Main Poster or Still */}
                  <img
                    src={item.image || "/images/poster-begum-jaan.jpg"}
                    alt={item.title}
                    className={`poster-img ${isLandscape ? "poster-img-landscape" : ""}`}
                    loading="lazy"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = "/images/poster-begum-jaan.jpg";
                    }}
                  />

                  <div className="poster-overlay-gradient">
                    <div className="poster-meta">
                      <span className="poster-year">{item.year}</span>
                      <h3 className="poster-title serif">{item.title}</h3>
                      {item.banglaTitle && (
                        <span className="poster-bangla">{item.banglaTitle}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => scroll("right")}
          className="poster-nav-btn next"
          aria-label="Next posters"
        >
          <ChevronRight size={22} />
        </button>
      </motion.div>

      {/* Clean Poster Modal Preview */}
      {selectedPoster && (
        <div
          className="clean-poster-modal"
          onClick={() => {
            setSelectedPoster(null);
            setIsPlayingVideo(false);
          }}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="clean-poster-content"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => {
                setSelectedPoster(null);
                setIsPlayingVideo(false);
              }}
              className="clean-poster-close"
              aria-label="Close poster"
            >
              <X size={20} />
            </button>

            <div className="clean-modal-poster-col">
              {isPlayingVideo && getYoutubeId(selectedPoster) ? (
                <div className="clean-modal-video-frame">
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${getYoutubeId(
                      selectedPoster
                    )}?autoplay=1&rel=0`}
                    title={selectedPoster.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="clean-modal-iframe"
                  />
                </div>
              ) : (
                <div className="clean-modal-img-wrap">
                  <div
                    className="clean-modal-ambient-backdrop"
                    style={{
                      backgroundImage: `url(${
                        selectedPoster.image || "/images/poster-begum-jaan.jpg"
                      })`,
                    }}
                  />
                  <img
                    src={selectedPoster.image || "/images/poster-begum-jaan.jpg"}
                    alt={selectedPoster.title}
                    className="clean-modal-img"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = "/images/poster-begum-jaan.jpg";
                    }}
                  />
                  {getYoutubeId(selectedPoster) && (
                    <button
                      type="button"
                      onClick={() => setIsPlayingVideo(true)}
                      className="clean-modal-play-overlay-btn"
                      aria-label="Play video"
                    >
                      <Play size={22} fill="#ffffff" style={{ marginLeft: "3px" }} />
                      <span>Play Video</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="clean-modal-details-col">
              <div className="clean-modal-header">
                <div className="clean-modal-badges">
                  <span className="clean-modal-badge">{selectedPoster.category}</span>
                  <span className="clean-modal-badge year">{selectedPoster.year}</span>
                  {selectedPoster.status && (
                    <span className="clean-modal-badge year">{selectedPoster.status}</span>
                  )}
                </div>
                <h3 className="serif modal-caption-title">{selectedPoster.title}</h3>
                {selectedPoster.banglaTitle && (
                  <span className="modal-caption-bangla">{selectedPoster.banglaTitle}</span>
                )}
              </div>

              {selectedPoster.awards && (
                <div className="modal-awards-box">
                  <Award size={18} className="text-amber-400 shrink-0" />
                  <span className="modal-awards-text">{selectedPoster.awards}</span>
                </div>
              )}

              <div className="clean-modal-meta-grid">
                {selectedPoster.role && (
                  <div className="clean-modal-meta-item">
                    <span className="clean-modal-meta-label">Character / Role</span>
                    <span className="clean-modal-meta-value">{selectedPoster.role}</span>
                  </div>
                )}
                {selectedPoster.director && (
                  <div className="clean-modal-meta-item">
                    <span className="clean-modal-meta-label">Director</span>
                    <span className="clean-modal-meta-value">{selectedPoster.director}</span>
                  </div>
                )}
                {selectedPoster.coStar && (
                  <div className="clean-modal-meta-item">
                    <span className="clean-modal-meta-label">Co-Stars</span>
                    <span className="clean-modal-meta-value">{selectedPoster.coStar}</span>
                  </div>
                )}
                {selectedPoster.productionHouse && (
                  <div className="clean-modal-meta-item">
                    <span className="clean-modal-meta-label">Production</span>
                    <span className="clean-modal-meta-value">{selectedPoster.productionHouse}</span>
                  </div>
                )}
              </div>

              {selectedPoster.description && (
                <div className="modal-synopsis-wrap">
                  <h4 className="modal-synopsis-label">Overview & Synopsis</h4>
                  <p className="modal-synopsis-text">{selectedPoster.description}</p>
                </div>
              )}

              {/* Action Buttons: Play video or open external links */}
              {(getYoutubeId(selectedPoster) ||
                selectedPoster.videoUrl ||
                selectedPoster.imdbUrl) && (
                <div className="modal-action-row">
                  {getYoutubeId(selectedPoster) && !isPlayingVideo && (
                    <button
                      type="button"
                      onClick={() => setIsPlayingVideo(true)}
                      className="modal-btn-play"
                    >
                      <Play size={14} fill="currentColor" />
                      <span>Watch Video</span>
                    </button>
                  )}
                  {(selectedPoster.videoUrl || getYoutubeId(selectedPoster)) && (
                    <a
                      href={
                        selectedPoster.videoUrl ||
                        `https://www.youtube.com/watch?v=${getYoutubeId(selectedPoster)}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="modal-btn-external"
                    >
                      <ExternalLink size={13} />
                      <span>YouTube</span>
                    </a>
                  )}
                  {selectedPoster.imdbUrl && (
                    <a
                      href={selectedPoster.imdbUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="modal-btn-external"
                    >
                      <ExternalLink size={13} />
                      <span>IMDb Profile</span>
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export { OnePageFilmography as FilmographySection };
export default OnePageFilmography;
