"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUp } from "lucide-react";
import { footerData, defaultFooterLinks, FooterLink } from "@/data/footer";

export function Footer() {
  const [links, setLinks] = useState<FooterLink[]>(defaultFooterLinks);

  useEffect(() => {
    const loadLinks = async () => {
      try {
        const [seoRes, pagesRes] = await Promise.all([
          fetch("/api/seo", { cache: "no-store" }).then((r) => (r.ok ? r.json() : null)),
          fetch("/api/pages", { cache: "no-store" }).then((r) => (r.ok ? r.json() : null)),
        ]);

        const llmsPublished = Boolean(pagesRes?.pages?.llms?.isPublished);

        if (seoRes?.seo?.footerLinks && Array.isArray(seoRes.seo.footerLinks) && seoRes.seo.footerLinks.length > 0) {
          const activeLinks = seoRes.seo.footerLinks
            .filter((item: any) => {
              if (item.isVisible === false) return false;
              // Strict rule: only show llms.txt if pages.llms is explicitly published
              if (item.href === "/llms.txt" || item.id === "llms") {
                return llmsPublished;
              }
              return true;
            })
            .sort((a: any, b: any) => (a.order || 0) - (b.order || 0))
            .map((item: any) => ({
              label: item.label,
              href: item.href,
            }));

          if (activeLinks.length > 0) {
            setLinks(activeLinks);
            return;
          }
        }

        // Fallback default links: If llms.txt is published, include it
        if (llmsPublished) {
          setLinks([...defaultFooterLinks, { label: "llms.txt", href: "/llms.txt" }]);
        } else {
          setLinks(defaultFooterLinks);
        }
      } catch {
        setLinks(defaultFooterLinks);
      }
    };

    loadLinks();

    window.addEventListener("shirin_shila_seo_updated", loadLinks);
    window.addEventListener("shirin_shila_pages_updated", loadLinks);
    return () => {
      window.removeEventListener("shirin_shila_seo_updated", loadLinks);
      window.removeEventListener("shirin_shila_pages_updated", loadLinks);
    };
  }, []);

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

      {/* Primary Approved Navigation & Legal Links */}
      <nav aria-label="Footer Navigation" className="footer-links">
        {links.map((link) => {
          const isTxt = link.href.endsWith(".txt");
          const isExternal = link.href.startsWith("http");

          if (isTxt || isExternal) {
            return (
              <a
                key={link.href}
                href={link.href}
                target={isTxt ? "_blank" : undefined}
                rel={isTxt ? "noopener noreferrer" : undefined}
                style={isTxt ? { color: "#ec4899", fontWeight: 600 } : undefined}
              >
                {link.label}
              </a>
            );
          }

          return (
            <Link key={link.href} href={link.href}>
              {link.label}
            </Link>
          );
        })}
      </nav>

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
