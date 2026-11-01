"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUp, Facebook, Instagram, Youtube } from "lucide-react";
import { footerData, defaultFooterLinks, FooterLink } from "@/data/footer";
import { initialContactInfo, SocialChannels } from "@/data/contact";

function ImdbIcon({ size = 16, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill={color} style={{ display: "inline-block", verticalAlign: "middle" }}>
      <title>IMDb</title>
      <path d="M22.231 11.348v9.159h2.134l0.143-0.581c0.173 0.219 0.386 0.397 0.63 0.526l0.011 0.005c0.246 0.107 0.533 0.169 0.835 0.169 0.003 0 0.006 0 0.009-0h-0c0.016 0.001 0.035 0.001 0.054 0.001 0.344 0 0.662-0.111 0.921-0.299l-0.005 0.003c0.246-0.166 0.43-0.407 0.52-0.691l0.003-0.009c0.071-0.327 0.112-0.702 0.112-1.087 0-0.048-0.001-0.096-0.002-0.144l0 0.007v-2.572c0.001-0.055 0.002-0.121 0.002-0.186 0-0.315-0.016-0.626-0.048-0.932l0.003 0.038c-0.033-0.198-0.107-0.375-0.214-0.527l0.003 0.004c-0.136-0.181-0.315-0.323-0.523-0.411l-0.008-0.003c-0.23-0.091-0.496-0.144-0.775-0.144-0.015 0-0.030 0-0.045 0l0.002-0c-0.307 0.001-0.599 0.060-0.868 0.165l0.016-0.006c-0.249 0.127-0.459 0.294-0.63 0.496l-0.002 0.003v-2.986zM25.309 18.29c0.003 0.049 0.004 0.107 0.004 0.165 0 0.237-0.026 0.468-0.076 0.69l0.004-0.021c-0.041 0.118-0.236 0.177-0.379 0.177-0.007 0.001-0.016 0.001-0.024 0.001-0.114 0-0.211-0.069-0.253-0.167l-0.001-0.002c-0.052-0.185-0.081-0.397-0.081-0.616 0-0.056 0.002-0.112 0.006-0.168l-0 0.007v-2.422c-0.003-0.048-0.005-0.103-0.005-0.16 0-0.219 0.026-0.431 0.076-0.634l-0.004 0.018c0.043-0.091 0.134-0.153 0.24-0.153 0.011 0 0.021 0.001 0.032 0.002l-0.001-0c0.143 0 0.337 0.051 0.387 0.177 0.051 0.181 0.080 0.39 0.080 0.605 0 0.051-0.002 0.102-0.005 0.152l0-0.007zM18.916 20.508c0.048 0.001 0.104 0.002 0.16 0.002 0.394 0 0.78-0.034 1.154-0.1l-0.040 0.006c0.273-0.050 0.513-0.166 0.711-0.331l-0.002 0.002c0.198-0.163 0.341-0.386 0.403-0.641l0.002-0.008c0.084-0.415 0.132-0.893 0.132-1.381 0-0.093-0.002-0.185-0.005-0.277l0 0.013v-3.213c0.003-0.091 0.004-0.197 0.004-0.304 0-0.508-0.035-1.009-0.103-1.498l0.006 0.057c-0.054-0.312-0.192-0.584-0.39-0.802l0.001 0.001c-0.243-0.257-0.559-0.442-0.915-0.521l-0.012-0.002c-0.546-0.106-1.173-0.167-1.815-0.167-0.136 0-0.271 0.003-0.405 0.008l0.019-0.001h-1.772v9.159zM18.942 13.001c0.093 0.053 0.159 0.144 0.176 0.251l0 0.002c0.030 0.184 0.048 0.395 0.048 0.611 0 0.067-0.002 0.134-0.005 0.2l0-0.009v3.551c0.006 0.072 0.009 0.155 0.009 0.24 0 0.312-0.047 0.612-0.134 0.896l0.006-0.022c-0.076 0.143-0.287 0.211-0.624 0.211v-6.014c0.028-0.003 0.061-0.004 0.094-0.004 0.155 0 0.303 0.033 0.437 0.092l-0.007-0.003zM15.239 11.348v9.159h-2.066v-6.182l-0.835 6.182h-1.476l-0.869-6.047-0.008 6.047h-2.075v-9.159h3.070c0.093 0.557 0.186 1.206 0.287 1.957l0.337 2.328 0.548-4.285zM7.108 11.348v9.159h-2.37v-9.159zM28.978 1.691c0.785 0.060 1.4 0.711 1.4 1.506 0 0.001 0 0.003 0 0.004v-0 25.598c0 0.001 0 0.002 0 0.003 0 0.787-0.6 1.433-1.368 1.507l-0.006 0h-25.868c-0.74-0.067-1.322-0.658-1.375-1.395l-0-0.005v-25.809c0.049-0.754 0.646-1.355 1.395-1.408l0.005-0zM28.978 1.074h-25.817c-1.076 0.063-1.936 0.911-2.015 1.977l-0 0.007-0.001 25.851c0.054 1.063 0.881 1.917 1.927 2.013l0.008 0.001c0.016 0.002 0.034 0.003 0.052 0.003 0.001 0 0.003 0 0.004-0h25.868q0.027 0 0.054-0.003c1.089-0.109 1.932-1.018 1.936-2.125v-25.598c-0.004-1.119-0.866-2.035-1.963-2.124l-0.008-0c-0.013-0.002-0.029-0.002-0.045-0.002-0 0-0.001 0-0.001 0h0z" />
    </svg>
  );
}

function TikTokIcon({ size = 16, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.31 0 .61.05.89.14V9.04a6.28 6.28 0 0 0-.89-.06 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V9.05a8.16 8.16 0 0 0 4.77 1.52V7.12a4.85 4.85 0 0 1-1-.43z" />
    </svg>
  );
}

function WikipediaIcon({ size = 16, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 5h4M10 5h4M17 5h4M4 7l4.5 12L12 9l3.5 10L20 7" />
    </svg>
  );
}

export interface FooterProps {
  initialSocials?: SocialChannels;
}

export function Footer({ initialSocials }: FooterProps = {}) {
  const [links, setLinks] = useState<FooterLink[]>(defaultFooterLinks);
  const [socials, setSocials] = useState<SocialChannels>(initialSocials || initialContactInfo.socials);

  useEffect(() => {
    if (initialSocials) {
      setSocials(initialSocials);
    }
  }, [initialSocials]);

  useEffect(() => {
    const loadLinks = async () => {
      try {
        const seoRes = await fetch("/api/seo", { cache: "no-store" }).then((r) => (r.ok ? r.json() : null));

        if (seoRes?.seo?.footerLinks && Array.isArray(seoRes.seo.footerLinks) && seoRes.seo.footerLinks.length > 0) {
          const activeLinks = seoRes.seo.footerLinks
            .filter((item: any) => {
              if (item.isVisible === false) return false;
              // Never display llms.txt in the public user-facing footer
              if (item.href === "/llms.txt" || item.id === "llms") {
                return false;
              }
              // Completely exclude About and Contact from footer
              const isAbout = item.id === "about" || item.href === "/about" || item.href === "/#about" || /about/i.test(item.label || "");
              const isContact = item.id === "contact" || item.href === "/contact" || item.href === "/#contact" || /contact/i.test(item.label || "");
              if (isAbout || isContact) {
                return false;
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

        // Default to approved legal footer links (Privacy Policy, Terms of Representation)
        setLinks(defaultFooterLinks);
      } catch {
        setLinks(defaultFooterLinks);
      }
    };

    const loadContact = async () => {
      try {
        const res = await fetch("/api/contact", { cache: "no-store" }).then((r) => (r.ok ? r.json() : null));
        if (res?.info?.socials) {
          setSocials(res.info.socials);
        }
      } catch {
        // Fallback already preset with initialContactInfo.socials
      }
    };

    loadLinks();
    loadContact();

    const handleStorage = (e: StorageEvent) => {
      if (e.key === "shirin_shila_sync_contact") {
        loadContact();
      }
      if (e.key === "shirin_shila_sync_seo") {
        loadLinks();
      }
    };

    window.addEventListener("shirin_shila_seo_updated", loadLinks);
    window.addEventListener("shirin_shila_pages_updated", loadLinks);
    window.addEventListener("shirin_shila_contact_updated", loadContact);
    window.addEventListener("shirin_shila_contact_info_updated", loadContact);
    window.addEventListener("storage", handleStorage);
    return () => {
      window.removeEventListener("shirin_shila_seo_updated", loadLinks);
      window.removeEventListener("shirin_shila_pages_updated", loadLinks);
      window.removeEventListener("shirin_shila_contact_updated", loadContact);
      window.removeEventListener("shirin_shila_contact_info_updated", loadContact);
      window.removeEventListener("storage", handleStorage);
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

      {/* Official Artist Channels & Social Links */}
      <div className="footer-social-row" aria-label="Official Social Channels">
        <a
          href={socials.imdb || "https://www.imdb.com/name/nm6897284/"}
          target="_blank"
          rel="noopener noreferrer"
          className="footer-social-icon footer-imdb-icon"
          aria-label="IMDb Filmography Profile"
          title="IMDb Filmography Profile"
        >
          <ImdbIcon size={20} color="var(--pink)" />
        </a>
        <a
          href={socials.facebookPage || socials.facebookProfile || "https://www.facebook.com/shirinshilaofficial"}
          target="_blank"
          rel="noopener noreferrer"
          className="footer-social-icon"
          aria-label="Official Facebook Page"
          title="Official Facebook Page"
        >
          <Facebook size={17} />
        </a>
        <a
          href={socials.instagram || "https://www.instagram.com/shirin_shila"}
          target="_blank"
          rel="noopener noreferrer"
          className="footer-social-icon"
          aria-label="Instagram Profile"
          title="Instagram Profile"
        >
          <Instagram size={17} />
        </a>
        <a
          href={socials.youtube || "https://www.youtube.com/@shirinshilaofficial"}
          target="_blank"
          rel="noopener noreferrer"
          className="footer-social-icon"
          aria-label="YouTube Channel"
          title="YouTube Channel"
        >
          <Youtube size={17} />
        </a>
        <a
          href={socials.tiktok || "https://www.tiktok.com/@shirinshilaofficial"}
          target="_blank"
          rel="noopener noreferrer"
          className="footer-social-icon"
          aria-label="TikTok Profile"
          title="TikTok Profile"
        >
          <TikTokIcon size={16} />
        </a>
        <a
          href={socials.wikipedia || "https://bn.wikipedia.org/wiki/%E0%A6%B6%E0%A6%BF%E0%A6%B0%E0%A6%BF%E0%A6%A8_%E0%A6%B6%E0%A6%BF%E0%A6%B2%E0%A6%BE"}
          target="_blank"
          rel="noopener noreferrer"
          className="footer-social-icon"
          aria-label="Wikipedia Article"
          title="Wikipedia Article"
        >
          <WikipediaIcon size={16} />
        </a>
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
