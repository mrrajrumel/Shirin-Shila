"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { getStoredWorks } from "@/data/storage";
import {
  ProjectItem,
  filmography,
  filmographyCategories as categories,
  filmographyMeta,
} from "@/data/filmography";
import GlassyCarousel, { GlassyCarouselItem } from "@/components/ui/glassy-carousel";

export interface FilmographySectionProps {
  id?: string;
  initialItems?: ProjectItem[];
}

export function OnePageFilmography({ id = "filmography", initialItems }: FilmographySectionProps) {
  const [items, setItems] = useState<ProjectItem[]>(initialItems && initialItems.length > 0 ? initialItems : filmography);
  const [filter, setFilter] = useState<string>("All");

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
  }, [initialItems]);

  const filteredProjects =
    filter === "All" ? items : items.filter((item) => item.category === filter);

  // Transform ProjectItem to GlassyCarouselItem with rich structured metadata
  const carouselItems: GlassyCarouselItem[] = filteredProjects.map((item) => {
    const trailer =
      item.videoUrl ||
      (item.youtubeId ? `https://www.youtube.com/watch?v=${item.youtubeId}` : undefined);

    return {
      id: item.id,
      title: item.title,
      banglaTitle: item.banglaTitle,
      category: item.category,
      year: item.year,
      director: item.director,
      coStar: item.coStar,
      role: item.role,
      productionHouse: item.productionHouse,
      awards: item.awards,
      status: item.status,
      subtitle: `${item.year} • ${item.category}${item.role ? ` • Role: ${item.role}` : ""}`,
      image: item.image || "/images/poster-begum-jaan.jpg",
      description: item.description,
      accent: "#ff3f79",
      trailerUrl: trailer,
      href: item.imdbUrl || undefined,
      linkLabel: item.imdbUrl ? "View on IMDb" : "View Details",
    };
  });

  return (
    <section id={id} className="section notable-works-section" style={{ paddingBottom: "32px" }}>
      <motion.div
        className="section-head text-center"
        style={{ marginBottom: "20px" }}
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
        style={{ marginBottom: "16px" }}
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

      {/* 3D Glassy Coverflow Carousel */}
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.75, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
      >
        {carouselItems.length > 0 ? (
          <GlassyCarousel
            key={filter} // re-mount carousel when category filter changes for smooth geometry calculation
            items={carouselItems}
            layout="poster"
            label="Curated Filmography & Notable Works"
            autoPlay={false}
          />
        ) : (
          <div
            style={{
              padding: "60px 20px",
              textAlign: "center",
              color: "var(--muted)",
              background: "rgba(255, 255, 255, 0.02)",
              borderRadius: "14px",
              border: "1px solid rgba(255, 63, 121, 0.15)",
              maxWidth: "600px",
              margin: "30px auto",
            }}
          >
            No titles available in the selected category. Check back soon for upcoming releases.
          </div>
        )}
      </motion.div>
    </section>
  );
}

export { OnePageFilmography as FilmographySection };
export default OnePageFilmography;
