"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Award, Film, GraduationCap } from "lucide-react";
import {
  biography as defaultBio,
  profileFacts as defaultFacts,
  aboutMeta as defaultMeta,
  defaultPrestigeMilestones,
  PrestigeMilestone,
} from "@/data/about";

export interface AboutSectionProps {
  id?: string;
  initialData?: {
    meta?: typeof defaultMeta;
    biography?: typeof defaultBio;
    profileFacts?: typeof defaultFacts;
    prestigeMilestones?: PrestigeMilestone[];
  };
}

export function OnePageAbout({ id = "about", initialData }: AboutSectionProps) {
  const [aboutMeta, setAboutMeta] = useState(initialData?.meta || defaultMeta);
  const [biography, setBiography] = useState(initialData?.biography || defaultBio);
  const [prestigeMilestones, setPrestigeMilestones] = useState<PrestigeMilestone[]>(
    initialData?.prestigeMilestones && initialData.prestigeMilestones.length > 0
      ? initialData.prestigeMilestones
      : defaultPrestigeMilestones
  );
  const [profileFacts, setProfileFacts] = useState(() => {
    const raw = initialData?.profileFacts || defaultFacts;
    return raw.filter((f: any) => !/representation|email/i.test(f.label || ""));
  });

  const loadAboutData = () => {
    fetch("/api/about", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.about) {
          if (data.about.meta) setAboutMeta(data.about.meta);
          if (data.about.biography) setBiography(data.about.biography);
          if (Array.isArray(data.about.prestigeMilestones) && data.about.prestigeMilestones.length > 0) {
            setPrestigeMilestones(data.about.prestigeMilestones);
          }
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
    if (!initialData) {
      loadAboutData();
    }

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
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="section-kicker">BIOGRAPHY &amp; PROFILE</div>
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
            {prestigeMilestones.map((item, idx) => {
              const isAward = item.icon === 'award';
              const isFilm = item.icon === 'film';
              return (
                <div className="about-prestige-card" key={item.id || idx}>
                  {isFilm ? (
                    <Film size={18} className="prestige-icon" />
                  ) : isAward ? (
                    <Award size={18} className="prestige-icon pink" />
                  ) : (
                    <GraduationCap size={18} className="prestige-icon" />
                  )}
                  <div className="prestige-info">
                    <span className="prestige-title">{item.title}</span>
                    <span className="prestige-sub">{item.subtitle}</span>
                  </div>
                </div>
              );
            })}
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
            {/* Cinematic Portrait Frame */}
            <div className="about-dossier-portrait-wrap">
              <img
                src={aboutMeta.portraitSrc}
                alt={aboutMeta.portraitAlt}
                className="about-dossier-portrait-img"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = "/images/portrait.jpg";
                }}
              />
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
