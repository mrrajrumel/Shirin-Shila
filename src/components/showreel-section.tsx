"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { showreelVideos, showreelMeta, ShowreelItem } from "@/data/showreel";
import { CoverflowCarousel, CoverflowSlide } from "@/components/ui/coverflow-carousel";

export interface ShowreelSectionProps {
  id?: string;
}

export function ShowreelSection({ id = "showreel" }: ShowreelSectionProps) {
  const [videos, setVideos] = useState<ShowreelItem[]>(showreelVideos);

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

  const slides: CoverflowSlide[] = videos.map((v) => {
    // User explicitly requested YouTube video thumbnails for showreels
    const ytThumb = v.youtubeId
      ? `https://img.youtube.com/vi/${v.youtubeId}/hqdefault.jpg`
      : v.thumbnail || "/images/gallery-3.jpg";

    return {
      src: ytThumb,
      alt: v.title,
      title: v.title,
      subtitle: v.category || (v.year ? `${v.year} Showreel` : "Cinematic Performance"),
      youtubeId: v.youtubeId,
      description: v.description || v.sceneHighlight,
      meta: [
        { label: "Year", value: v.year || "2026" },
        { label: "Duration", value: v.duration || "HD Reel" },
        ...(v.director ? [{ label: "Director", value: v.director }] : []),
        ...(v.coStar ? [{ label: "Co-Star", value: v.coStar }] : []),
      ],
    };
  });

  return (
    <section id={id} className="section notable-works-section showreel-carousel-section">
      <motion.div
        className="section-head text-center"
        style={{ marginBottom: "16px" }}
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
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.75, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
      >
        <CoverflowCarousel
          slides={slides}
          showCaption={false}
          showPagination
          showNavigation
          cardWidth="clamp(250px, 70vw, 620px)"
          rotate={30}
          depth={0.45}
          fade={0.12}
        />
      </motion.div>
    </section>
  );
}

export default ShowreelSection;
