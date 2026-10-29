"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Award, CheckCircle2, Film, GraduationCap } from "lucide-react";
import { biography as defaultBio, profileFacts as defaultFacts, aboutMeta as defaultMeta } from "@/data/about";

export interface AboutSectionProps {
  id?: string;
}

export function OnePageAbout({ id = "about" }: AboutSectionProps) {
  const [aboutMeta, setAboutMeta] = useState(defaultMeta);
  const [biography, setBiography] = useState(defaultBio);
  const [profileFacts, setProfileFacts] = useState(defaultFacts);

  const loadAboutData = () => {
    fetch("/api/about", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.about) {
          if (data.about.meta) setAboutMeta(data.about.meta);
          if (data.about.biography) setBiography(data.about.biography);
          if (Array.isArray(data.about.profileFacts)) {
            const cleanFacts = data.about.profileFacts.filter(
              (f: any) => !/representation|email/i.test(f.label || "")
            );
            setProfileFacts(cleanFacts);
          }
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    loadAboutData();

    const handleUpdate = () => {
      loadAboutData();
    };

    window.addEventListener("shirin_shila_about_updated", handleUpdate);
    window.addEventListener("shirin_shila_reset", handleUpdate);
    window.addEventListener("storage", (e) => {
      if (e.key === "shirin_shila_sync_about") loadAboutData();
    });

    return () => {
      window.removeEventListener("shirin_shila_about_updated", handleUpdate);
      window.removeEventListener("shirin_shila_reset", handleUpdate);
    };
  }, []);

  return (
    <section id={id} className="section about-section-simple">
      <motion.div
        className="section-head text-center"
        style={{ marginBottom: "36px" }}
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="about-kicker-pill">
          <span>Official Biography &amp; Talent Profile</span>
        </div>
        <h2 className="serif">
          {aboutMeta.sectionTitle} <span className="pink">{aboutMeta.sectionHighlight}</span>
        </h2>
      </motion.div>

      <div className="about-content-grid">
        {/* Left: Concise Natural Biographical Story & Accolade Highlights */}
        <motion.div
          className="about-bio-col"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        >
          <h3 className="serif about-heading-simple">{biography.heading}</h3>

          <div className="about-story-text">
            {biography.paragraphs.map((para, idx) => (
              <p className="about-p-simple" key={idx}>
                {para}
              </p>
            ))}
          </div>

          {/* Prestige Milestone Highlights Bar */}
          <div className="about-prestige-bar">
            <div className="about-prestige-card">
              <Film size={18} className="prestige-icon" />
              <div className="prestige-info">
                <span className="prestige-title">10+ Years</span>
                <span className="prestige-sub">Dhallywood Cinema</span>
              </div>
            </div>
            <div className="about-prestige-card">
              <Award size={18} className="prestige-icon pink" />
              <div className="prestige-info">
                <span className="prestige-title">Babisas Award</span>
                <span className="prestige-sub">Best Actress</span>
              </div>
            </div>
            <div className="about-prestige-card">
              <GraduationCap size={18} className="prestige-icon" />
              <div className="prestige-info">
                <span className="prestige-title">M.Sc. Physics</span>
                <span className="prestige-sub">Jahangirnagar Univ</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right: Innovative Editorial Celebrity Dossier Card */}
        <motion.div
          className="about-card-col"
          initial={{ opacity: 0, y: 35 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="about-dossier-card">
            {/* Cinematic Portrait Frame with Overlays */}
            <div className="about-dossier-portrait-wrap">
              <img
                src={aboutMeta.portraitSrc}
                alt={aboutMeta.portraitAlt}
                className="about-dossier-portrait-img"
              />
              <div className="about-dossier-badge-top">
                <CheckCircle2 size={12} className="check-icon" />
                <span>Verified Dhallywood Artist</span>
              </div>
              <div className="about-dossier-badge-bottom">
                <span className="badge-name">Shirin Shila</span>
                <span className="badge-sub">Feature Films • Television • Fashion</span>
              </div>
            </div>

            {/* Dossier Body with 2-Column Bento Pill Grid */}
            <div className="about-dossier-body">
              <div className="about-dossier-header-row">
                <h4 className="serif about-dossier-title">{aboutMeta.cardTitle}</h4>
                <span className="about-dossier-serial">PROFILE FACTSHEET</span>
              </div>

              <div className="about-dossier-bento-grid">
                {profileFacts.map((detail) => (
                  <div
                    key={detail.label}
                    className={`about-dossier-pill ${detail.isHighlight ? "is-highlight" : ""}`}
                  >
                    <div className="dossier-pill-header">
                      <span className="dossier-pill-label">{detail.label}</span>
                      {detail.isHighlight && <Award size={12} className="dossier-highlight-icon" />}
                    </div>
                    <span className="dossier-pill-val">{detail.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export { OnePageAbout as AboutSection };
export default OnePageAbout;
