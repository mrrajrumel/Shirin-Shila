"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Download, Award } from "lucide-react";
import { biography as defaultBio, profileFacts as defaultFacts, aboutMeta as defaultMeta, compCardData as defaultCompCard } from "@/data/about";

export interface AboutSectionProps {
  id?: string;
}

export function OnePageAbout({ id = "about" }: AboutSectionProps) {
  const [aboutMeta, setAboutMeta] = useState(defaultMeta);
  const [biography, setBiography] = useState(defaultBio);
  const [profileFacts, setProfileFacts] = useState(defaultFacts);
  const [compCardData, setCompCardData] = useState(defaultCompCard);

  useEffect(() => {
    fetch("/api/about", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.about) {
          if (data.about.meta) setAboutMeta(data.about.meta);
          if (data.about.biography) setBiography(data.about.biography);
          if (data.about.profileFacts) setProfileFacts(data.about.profileFacts);
          if (data.about.compCardData) setCompCardData(data.about.compCardData);
        }
      })
      .catch(() => {});
  }, []);
  return (
    <section id={id} className="section about-section-simple">
      <motion.div
        className="section-head text-center"
        style={{ marginBottom: "32px" }}
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <h2 className="serif">
          {aboutMeta.sectionTitle} <span className="pink">{aboutMeta.sectionHighlight}</span>
        </h2>
      </motion.div>

      <div className="about-content-grid">
        {/* Left: Natural Biographical Story */}
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
        </motion.div>

        {/* Right: Portrait & Clean Profile Summary */}
        <motion.div
          className="about-card-col"
          initial={{ opacity: 0, y: 35 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="about-portrait-wrap">
            <img
              src={aboutMeta.portraitSrc}
              alt={aboutMeta.portraitAlt}
              className="about-portrait-image"
            />
          </div>

          <div className="about-details-card">
            <h4 className="serif about-card-title">{aboutMeta.cardTitle}</h4>

            <dl className="about-details-list">
              {profileFacts.map((detail) => (
                <div
                  key={detail.label}
                  className={`about-detail-item ${detail.isHighlight ? "highlight" : ""}`}
                >
                  <dt className="detail-dt">{detail.label}</dt>
                  <dd className="detail-dd">
                    {detail.isHighlight && <Award size={13} className="award-icon" />}
                    {detail.value}
                  </dd>
                </div>
              ))}
            </dl>

            <a
              href={compCardData.downloadUrl}
              download="Shirin_Shila_Comp_Card_2026.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="button-secondary comp-card-download-simple"
            >
              <Download size={14} />
              <span>{aboutMeta.compCardDownloadText}</span>
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export { OnePageAbout as AboutSection };
export default OnePageAbout;
