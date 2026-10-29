"use client";

import React from "react";
import { motion } from "framer-motion";
import { ArrowUp } from "lucide-react";
import { footerData } from "@/data/footer";

export function Footer() {
  const handleScrollToTop = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (typeof window !== "undefined") {
      const topEl = document.getElementById("home") || document.getElementById("hero");
      if (topEl) {
        topEl.scrollIntoView({ behavior: "smooth" });
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
  };

  return (
    <motion.footer
      className="footer one-page-footer"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="footer-brand-wrap">
        <a href="#home" onClick={handleScrollToTop} className="footer-logo">
          <strong>
            {footerData.brandName}
            <span className="pink">{footerData.brandHighlight}</span>
          </strong>
        </a>
        <span className="footer-tagline">
          {footerData.tagline}
        </span>
      </div>

      <div className="footer-links">
        {footerData.links.map((link) => (
          <a
            key={link.href}
            href={link.href}
            onClick={(e) => {
              if (link.href.startsWith("#")) {
                e.preventDefault();
                const target = document.querySelector(link.href);
                if (target) {
                  target.scrollIntoView({ behavior: "smooth" });
                }
              }
            }}
          >
            {link.label}
          </a>
        ))}
      </div>

      <div className="footer-bottom-row">
        <div className="footer-credits-col">
          <span>
            {footerData.copyright} | Design and Developer{" "}
            <a
              href="https://github.com/mrrajrumel"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-credit-link"
              style={{ color: "var(--pink)", textDecoration: "underline", textUnderlineOffset: "3px" }}
            >
              Rumel Ahmed
            </a>
          </span>
        </div>

        <div className="footer-bottom-right-cluster">
          <a
            href="#home"
            onClick={handleScrollToTop}
            className="footer-back-to-top"
            aria-label={footerData.backToTopText}
          >
            <span>{footerData.backToTopText}</span>
            <ArrowUp size={14} />
          </a>
        </div>
      </div>
    </motion.footer>
  );
}

export default Footer;
