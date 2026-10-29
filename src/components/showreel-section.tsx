"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { showreelVideos, showreelMeta } from "@/data/showreel";

export interface ShowreelSectionProps {
  id?: string;
}

export function ShowreelSection({ id = "showreel" }: ShowreelSectionProps) {
  const [videos, setVideos] = useState(showreelVideos);
  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadVideos = () => {
      fetch("/api/showreels", { cache: "no-store" })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data && data.items && data.items.length > 0) {
            setVideos(data.items);
          }
        })
        .catch(() => {});
    };

    loadVideos();

    const handleUpdate = () => loadVideos();
    window.addEventListener("shirin_shila_showreels_updated", handleUpdate);
    window.addEventListener("shirin_shila_reset", handleUpdate);
    window.addEventListener("storage", (e) => {
      if (e.key === "shirin_shila_sync_showreels") loadVideos();
    });
    return () => {
      window.removeEventListener("shirin_shila_showreels_updated", handleUpdate);
      window.removeEventListener("shirin_shila_reset", handleUpdate);
    };
  }, []);

  const scroll = (direction: "left" | "right") => {
    if (carouselRef.current) {
      const scrollAmount = direction === "left" ? -460 : 460;
      carouselRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  return (
    <section id={id} className="section notable-works-section showreel-carousel-section">
      <motion.div
        className="section-head text-center"
        style={{ marginBottom: "28px" }}
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="section-kicker">{showreelMeta.kicker}</div>
        <h2 className="serif">
          {showreelMeta.titlePrefix}<span className="pink">{showreelMeta.titleHighlight}</span>
        </h2>
      </motion.div>

      <motion.div
        className="poster-carousel-wrapper"
        initial={{ opacity: 0, y: 36 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.75, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
      >
        <button
          type="button"
          onClick={() => scroll("left")}
          className="poster-nav-btn prev"
          aria-label="Previous showreels"
        >
          <ChevronLeft size={22} />
        </button>

        <div className="poster-carousel-track" ref={carouselRef}>
          {videos.map((video) => (
            <article key={video.id} className="showreel-carousel-card">
              <div className="showreel-video-frame">
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${video.youtubeId}?rel=0&modestbranding=1`}
                  title={video.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  loading="lazy"
                />
              </div>
              <div className="showreel-card-caption">
                <h3 className="serif showreel-card-title">{video.title}</h3>
              </div>
            </article>
          ))}
        </div>

        <button
          type="button"
          onClick={() => scroll("right")}
          className="poster-nav-btn next"
          aria-label="Next showreels"
        >
          <ChevronRight size={22} />
        </button>
      </motion.div>
    </section>
  );
}

export default ShowreelSection;

