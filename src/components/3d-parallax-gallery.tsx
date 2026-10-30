"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { X, ZoomIn } from "lucide-react";

import {
  galleryImages,
  galleryMeta,
  type GalleryImage,
} from "@/data/gallery";

export type { GalleryImage };

export interface GallerySectionProps {
  id?: string;
  initialImages?: GalleryImage[];
}

export function ParallaxGallery({ id = "gallery", initialImages }: GallerySectionProps) {
  const [images, setImages] = useState<GalleryImage[]>(initialImages && initialImages.length > 0 ? initialImages : galleryImages);
  const ref = useRef<HTMLElement>(null);
  const [activeModalItem, setActiveModalItem] = useState<GalleryImage | null>(null);

  useEffect(() => {
    const loadImages = () => {
      fetch("/api/gallery", { cache: "no-store" })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data && data.items && data.items.length > 0) {
            setImages(data.items);
          }
        })
        .catch(() => {});
    };

    if (!initialImages || initialImages.length === 0) {
      loadImages();
    }

    const handleUpdate = () => loadImages();
    window.addEventListener("shirin_shila_gallery_updated", handleUpdate);
    window.addEventListener("shirin_shila_reset", handleUpdate);
    window.addEventListener("storage", (e) => {
      if (e.key === "shirin_shila_sync_gallery") loadImages();
    });
    return () => {
      window.removeEventListener("shirin_shila_gallery_updated", handleUpdate);
      window.removeEventListener("shirin_shila_reset", handleUpdate);
    };
  }, []);

  // 3D Parallax Scroll Setup
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  const progress = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 24,
    mass: 0.45,
  });

  // 3D Perspective transforms for the whole matrix
  const ry = useTransform(progress, [0, 1], [-28, -4]);
  const rx = useTransform(progress, [0, 1], [16, 1]);
  const z = useTransform(progress, [0, 1], [-320, 0]);

  // Differential vertical speeds across the 3 columns
  const y1 = useTransform(progress, [0, 1], ["8%", "-30%"]);
  const y2 = useTransform(progress, [0, 1], ["-24%", "12%"]);
  const y3 = useTransform(progress, [0, 1], ["10%", "-26%"]);

  const col1 = images.filter((_, i) => i % 3 === 0);
  const col2 = images.filter((_, i) => i % 3 === 1);
  const col3 = images.filter((_, i) => i % 3 === 2);
  const columns = [col1, col2, col3];

  return (
    <section ref={ref} className="gallery-scroll" id={id} style={{ position: "relative" }}>
      <div className="gallery-sticky">
        {/* Normal Text Heading with Awards Focus */}
        <div className="gallery-heading">
          <span className="section-kicker">{galleryMeta.kicker}</span>
          <h2 className="serif">
            {galleryMeta.title}
          </h2>
          <p>{galleryMeta.subtitle}</p>
        </div>

        {/* 3D Parallax Interactive Matrix */}
        <motion.div
          className="gallery-matrix"
          style={{
            rotateY: ry,
            rotateX: rx,
            z,
            transformStyle: "preserve-3d",
          }}
        >
          {columns.map((col, ci) => (
            <motion.div
              className="gallery-column"
              style={{ y: ci === 0 ? y1 : ci === 1 ? y2 : y3 }}
              key={ci}
            >
              {[...col, ...col].map((item, i) => (
                <figure
                  className="gallery-tile"
                  key={`${ci}-${i}`}
                  onClick={() => setActiveModalItem(item)}
                  style={{ cursor: "pointer" }}
                  title="Click to view full image"
                >
                  <img
                    src={item.src}
                    alt={item.label}
                    loading="lazy"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = "/images/gallery-1.jpg";
                    }}
                  />
                  <figcaption>
                    <span>{item.label}</span>
                    <span style={{ opacity: 0.7, marginLeft: 6 }}>• {item.year}</span>
                  </figcaption>
                </figure>
              ))}
            </motion.div>
          ))}
        </motion.div>

        {/* Ambient Vignette Shadow Edges */}
        <div className="gallery-vignette" />
      </div>

      {/* Lightbox Zoom Modal */}
      {activeModalItem && (
        <div
          className="film-modal-overlay"
          onClick={() => setActiveModalItem(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="gallery-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="film-modal-close"
              onClick={() => setActiveModalItem(null)}
              aria-label="Close"
            >
              <X size={22} />
            </button>
            <div className="gallery-modal-body">
              <img
                src={activeModalItem.src}
                alt={activeModalItem.label}
                className="gallery-modal-img"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = "/images/gallery-1.jpg";
                }}
              />
              <div className="gallery-modal-caption">
                <span className="section-kicker">
                  {activeModalItem.category} • {activeModalItem.year}
                </span>
                <h3 className="serif" style={{ marginTop: 6, color: "#fff" }}>
                  {activeModalItem.label}
                </h3>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export { ParallaxGallery as GallerySection };
export default ParallaxGallery;
