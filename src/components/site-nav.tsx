"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { CustomEase } from "gsap/CustomEase";

// Register GSAP Plugins safely
if (typeof window !== "undefined") {
  gsap.registerPlugin(CustomEase);
}

import { navigationItems, navigationMeta } from "@/data/navigation";
import AlignRightIcon from "@/components/ui/align-right-icon";

export default function SiteNav() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("home");
  const pathname = usePathname();

  const menuItems = navigationItems;

  const [scrollProgress, setScrollProgress] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);

  // ScrollSpy active section tracker & Scroll Progress indicator
  useEffect(() => {
    const sectionIds = [
      "home",
      "about",
      "showreel",
      "filmography",
      "gallery",
      "timeline",
      "press",
      "contact",
    ];

    const handleScroll = () => {
      const winScroll = document.documentElement.scrollTop || document.body.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = height > 0 ? (winScroll / height) * 100 : 0;
      setScrollProgress(scrolled);
      setIsScrolled(winScroll > 30);

      const scrollPos = window.scrollY + 220;
      for (let i = sectionIds.length - 1; i >= 0; i--) {
        const id = sectionIds[i];
        const el =
          document.getElementById(id) ||
          (id === "home" ? document.getElementById("hero") : null) ||
          (id === "timeline" ? document.getElementById("journey") : null);
        if (el) {
          const top = el.offsetTop;
          if (scrollPos >= top) {
            setActiveSection(id);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    targetId: string,
    href: string
  ) => {
    if (pathname === "/") {
      e.preventDefault();
      closeMenu();
      setTimeout(() => {
        const el =
          document.getElementById(targetId) ||
          (targetId === "home" ? document.getElementById("hero") : null) ||
          (targetId === "timeline" ? document.getElementById("journey") : null);
        if (el) {
          el.scrollIntoView({ behavior: "smooth" });
          window.history.pushState(null, "", href);
          setActiveSection(targetId);
        }
      }, 90);
    } else {
      closeMenu();
    }
  };

  // Initial Setup & Shape Hover Animation
  useEffect(() => {
    if (!containerRef.current) return;

    try {
      if (!gsap.parseEase("main")) {
        CustomEase.create("main", "0.65, 0.01, 0.05, 0.99");
        gsap.defaults({ ease: "main", duration: 0.7 });
      }
    } catch (e) {
      console.warn("CustomEase fallback:", e);
      gsap.defaults({ ease: "power2.out", duration: 0.7 });
    }

    const ctx = gsap.context(() => {
      // Setup hover listeners for any items with [data-shape] (both desktop navbar & mobile drawer)
      const allShapeTriggers = containerRef.current!.querySelectorAll("[data-shape]");
      const shapesContainer = containerRef.current!.querySelector(
        ".ambient-background-shapes"
      );

      allShapeTriggers.forEach((item) => {
        const shapeIndex = item.getAttribute("data-shape");
        const shape = shapesContainer
          ? shapesContainer.querySelector(`.bg-shape-${shapeIndex}`)
          : null;

        if (!shape) return;

        const shapeEls = shape.querySelectorAll(".shape-element");

        const onEnter = () => {
          if (shapesContainer) {
            shapesContainer
              .querySelectorAll(".bg-shape")
              .forEach((s) => s.classList.remove("active"));
          }
          shape.classList.add("active");

          gsap.fromTo(
            shapeEls,
            { scale: 0.5, opacity: 0, rotation: -10 },
            {
              scale: 1,
              opacity: 1,
              rotation: 0,
              duration: 0.6,
              stagger: 0.08,
              ease: "back.out(1.7)",
              overwrite: "auto",
            }
          );
        };

        const onLeave = () => {
          gsap.to(shapeEls, {
            scale: 0.8,
            opacity: 0,
            duration: 0.3,
            ease: "power2.in",
            onComplete: () => shape.classList.remove("active"),
            overwrite: "auto",
          });
        };

        item.addEventListener("mouseenter", onEnter);
        item.addEventListener("mouseleave", onLeave);

        (item as any)._cleanup = () => {
          item.removeEventListener("mouseenter", onEnter);
          item.removeEventListener("mouseleave", onLeave);
        };
      });
    }, containerRef);

    const container = containerRef.current;
    return () => {
      ctx.revert();
      if (container) {
        const items = container.querySelectorAll("[data-shape]");
        items.forEach((item: any) => item._cleanup && item._cleanup());
      }
    };
  }, []);

  const hasMounted = useRef(false);

  // Body scroll lock when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  // Kinetic Drawer Open/Close Animation
  useEffect(() => {
    if (!containerRef.current) return;

    const navWrap = containerRef.current.querySelector(".nav-overlay-wrapper");
    const menu = containerRef.current.querySelector(".menu-content");
    const overlay = containerRef.current.querySelector(".overlay");
    const bgPanels = containerRef.current.querySelectorAll(".backdrop-layer");
    const drawerLinks = containerRef.current.querySelectorAll(".drawer-nav-link");
    const fadeTargets = containerRef.current.querySelectorAll("[data-menu-fade]");

    // Skip closing animation on initial mount
    if (!hasMounted.current) {
      hasMounted.current = true;
      if (navWrap) gsap.set(navWrap, { display: "none" });
      if (menu) gsap.set(menu, { xPercent: 105 });
      return;
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline();

      if (isMenuOpen) {
        // OPEN
        if (navWrap) {
          navWrap.setAttribute("data-nav", "open");
          tl.set(navWrap, { display: "block" });
        }

        if (overlay) {
          tl.fromTo(overlay, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.35, ease: "power2.out" }, 0);
        }

        if (menu) {
          tl.fromTo(
            menu,
            { xPercent: 105 },
            { xPercent: 0, duration: 0.55, ease: "power3.out" },
            0
          );
        }

        if (bgPanels && bgPanels.length) {
          tl.fromTo(
            bgPanels,
            { xPercent: 101 },
            { xPercent: 0, stagger: 0.08, duration: 0.45, ease: "power2.out" },
            0.05
          );
        }

        if (drawerLinks && drawerLinks.length) {
          tl.fromTo(
            drawerLinks,
            { y: 35, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              stagger: 0.06,
              duration: 0.45,
              ease: "power2.out",
              clearProps: "transform,opacity",
            },
            0.18
          );
        }

        if (fadeTargets && fadeTargets.length) {
          tl.fromTo(
            fadeTargets,
            { autoAlpha: 0, y: 15 },
            { autoAlpha: 1, y: 0, stagger: 0.04, duration: 0.35, clearProps: "all" },
            0.22
          );
        }
      } else {
        // CLOSE
        if (navWrap) navWrap.setAttribute("data-nav", "closed");

        if (menu) {
          tl.to(menu, { xPercent: 105, duration: 0.4, ease: "power2.inOut" });
        }
        if (overlay) {
          tl.to(overlay, { autoAlpha: 0, duration: 0.3 }, 0);
        }
        if (navWrap) {
          tl.set(navWrap, { display: "none" });
        }
      }
    }, containerRef);

    return () => ctx.revert();
  }, [isMenuOpen]);

  // Escape key handler
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isMenuOpen) {
        setIsMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isMenuOpen]);

  const toggleMenu = () => setIsMenuOpen((prev) => !prev);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <div ref={containerRef}>
      {/* Top Page Scroll Progress Indicator Bar */}
      <div
        className="nav-scroll-progress-bar"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          height: "2px",
          width: `${scrollProgress}%`,
          background: "linear-gradient(90deg, #ff3f79, #e51c44)",
          boxShadow: "0 0 10px rgba(255, 63, 121, 0.9)",
          zIndex: 9999,
          transition: "width 0.1s linear",
          pointerEvents: "none",
        }}
      />

      {/* Site Header */}
      <div className="site-header-wrapper">
        <header className={`header ${isScrolled ? "is-scrolled" : ""}`}>
          <div className="nav-container-full">
            <nav className="nav-row">
              {/* Brand Logo */}
              <a
                href={pathname === "/" ? "#home" : "/"}
                aria-label="home"
                className="nav-logo-row"
                onClick={(e) => {
                  if (pathname === "/") {
                    e.preventDefault();
                    window.scrollTo({ top: 0, behavior: "smooth" });
                    setActiveSection("home");
                  }
                  closeMenu();
                }}
              >
                SHIRIN SHILA<span className="pink">.</span>
              </a>

              {/* PC Desktop Navigation Links (Directly visible with kinetic dual-text roll animation) */}
              <div className="desktop-nav-links">
                {menuItems.map((item) => {
                  const isActive = pathname === "/" ? activeSection === item.targetId : false;
                  const linkHref = pathname === "/" ? item.href : `/${item.href}`;
                  return (
                    <a
                      key={item.href}
                      href={linkHref}
                      data-shape={item.shape}
                      onClick={(e) => handleNavClick(e, item.targetId, item.href)}
                      className={`desktop-nav-item ${isActive ? "active" : ""}`}
                    >
                      <div className="desktop-nav-track">
                        <span className="desktop-nav-text normal">{item.label}</span>
                        <span className="desktop-nav-text kinetic" aria-hidden="true">
                          {item.label}
                        </span>
                      </div>
                      <span className="desktop-nav-hover-bar"></span>
                      {isActive && <span className="active-dot" aria-hidden="true"></span>}
                    </a>
                  );
                })}
              </div>

              {/* Right Controls - Strictly Mobile Only */}
              <div className="nav-row__right mobile-only">
                {/* Mobile Animated AlignRight / Close Icon Button (No Border, No Background Box) */}
                <button
                  type="button"
                  aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
                  aria-expanded={isMenuOpen}
                  className={`nav-close-btn ${isMenuOpen ? "is-open" : ""}`}
                  onClick={toggleMenu}
                  style={{ pointerEvents: "auto" }}
                >
                  {isMenuOpen ? (
                    <svg
                      width={24}
                      height={24}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  ) : (
                    <AlignRightIcon size={24} aria-hidden="true" />
                  )}
                </button>
              </div>
            </nav>
          </div>
        </header>
      </div>

      {/* Fullscreen Kinetic Navigation Overlay (Sliding drawer on Mobile & Desktop) */}
      <section className="fullscreen-menu-container">
        <div
          data-nav={isMenuOpen ? "open" : "closed"}
          className={`nav-overlay-wrapper ${isMenuOpen ? "is-open" : ""}`}
        >
          <div className="overlay" onClick={closeMenu}></div>
          <nav className="menu-content">
            <div className="menu-bg">
              <div className="backdrop-layer first"></div>
              <div className="backdrop-layer second"></div>
              <div className="backdrop-layer"></div>

              {/* Ambient Background Shapes Container */}
              <div className="ambient-background-shapes">
                {/* Shape 1: Celestial rings */}
                <svg
                  className="bg-shape bg-shape-1"
                  viewBox="0 0 400 400"
                  fill="none"
                >
                  <circle
                    className="shape-element"
                    cx="100"
                    cy="120"
                    r="55"
                    fill="rgba(255,63,121,0.2)"
                  />
                  <circle
                    className="shape-element"
                    cx="310"
                    cy="90"
                    r="75"
                    fill="rgba(229,28,68,0.16)"
                  />
                  <circle
                    className="shape-element"
                    cx="210"
                    cy="310"
                    r="95"
                    fill="rgba(255,102,142,0.14)"
                  />
                  <circle
                    className="shape-element"
                    cx="340"
                    cy="290"
                    r="40"
                    fill="rgba(255,63,121,0.2)"
                  />
                </svg>

                {/* Shape 2: Cinema wave streams */}
                <svg
                  className="bg-shape bg-shape-2"
                  viewBox="0 0 400 400"
                  fill="none"
                >
                  <path
                    className="shape-element"
                    d="M0 200 Q100 100, 200 200 T 400 200"
                    stroke="rgba(255,63,121,0.25)"
                    strokeWidth="60"
                    fill="none"
                  />
                  <path
                    className="shape-element"
                    d="M0 280 Q100 180, 200 280 T 400 280"
                    stroke="rgba(229,28,68,0.2)"
                    strokeWidth="40"
                    fill="none"
                  />
                </svg>

                {/* Shape 3: Film reels constellation grid */}
                <svg
                  className="bg-shape bg-shape-3"
                  viewBox="0 0 400 400"
                  fill="none"
                >
                  <circle
                    className="shape-element"
                    cx="60"
                    cy="60"
                    r="8"
                    fill="rgba(255,63,121,0.4)"
                  />
                  <circle
                    className="shape-element"
                    cx="160"
                    cy="60"
                    r="8"
                    fill="rgba(255,124,160,0.4)"
                  />
                  <circle
                    className="shape-element"
                    cx="260"
                    cy="60"
                    r="8"
                    fill="rgba(229,28,68,0.4)"
                  />
                  <circle
                    className="shape-element"
                    cx="360"
                    cy="60"
                    r="8"
                    fill="rgba(255,63,121,0.4)"
                  />
                  <circle
                    className="shape-element"
                    cx="110"
                    cy="160"
                    r="12"
                    fill="rgba(255,124,160,0.3)"
                  />
                  <circle
                    className="shape-element"
                    cx="210"
                    cy="160"
                    r="12"
                    fill="rgba(229,28,68,0.3)"
                  />
                  <circle
                    className="shape-element"
                    cx="310"
                    cy="160"
                    r="12"
                    fill="rgba(255,63,121,0.3)"
                  />
                  <circle
                    className="shape-element"
                    cx="60"
                    cy="260"
                    r="10"
                    fill="rgba(229,28,68,0.4)"
                  />
                  <circle
                    className="shape-element"
                    cx="160"
                    cy="260"
                    r="10"
                    fill="rgba(255,63,121,0.4)"
                  />
                  <circle
                    className="shape-element"
                    cx="260"
                    cy="260"
                    r="10"
                    fill="rgba(255,124,160,0.4)"
                  />
                  <circle
                    className="shape-element"
                    cx="360"
                    cy="260"
                    r="10"
                    fill="rgba(229,28,68,0.4)"
                  />
                  <circle
                    className="shape-element"
                    cx="110"
                    cy="350"
                    r="6"
                    fill="rgba(255,63,121,0.4)"
                  />
                  <circle
                    className="shape-element"
                    cx="210"
                    cy="350"
                    r="6"
                    fill="rgba(255,124,160,0.4)"
                  />
                  <circle
                    className="shape-element"
                    cx="310"
                    cy="350"
                    r="6"
                    fill="rgba(229,28,68,0.4)"
                  />
                </svg>

                {/* Shape 4: Curated media silhouettes */}
                <svg
                  className="bg-shape bg-shape-4"
                  viewBox="0 0 400 400"
                  fill="none"
                >
                  <path
                    className="shape-element"
                    d="M100 100 Q150 50, 200 100 Q250 150, 200 200 Q150 250, 100 200 Q50 150, 100 100"
                    fill="rgba(255,63,121,0.18)"
                  />
                  <path
                    className="shape-element"
                    d="M250 200 Q300 150, 350 200 Q400 250, 350 300 Q300 350, 250 300 Q200 250, 250 200"
                    fill="rgba(229,28,68,0.15)"
                  />
                </svg>

                {/* Shape 5: Dynamic spotlight beams */}
                <svg
                  className="bg-shape bg-shape-5"
                  viewBox="0 0 400 400"
                  fill="none"
                >
                  <line
                    className="shape-element"
                    x1="0"
                    y1="100"
                    x2="300"
                    y2="400"
                    stroke="rgba(255,63,121,0.22)"
                    strokeWidth="30"
                  />
                  <line
                    className="shape-element"
                    x1="100"
                    y1="0"
                    x2="400"
                    y2="300"
                    stroke="rgba(229,28,68,0.18)"
                    strokeWidth="25"
                  />
                  <line
                    className="shape-element"
                    x1="200"
                    y1="0"
                    x2="400"
                    y2="200"
                    stroke="rgba(255,102,142,0.16)"
                    strokeWidth="20"
                  />
                </svg>
              </div>
            </div>

            <div className="menu-content-wrapper">
              <ul className="menu-list">
                {menuItems.map((item) => {
                  const isActive = pathname === "/" ? activeSection === item.targetId : false;
                  const linkHref = pathname === "/" ? item.href : `/${item.href}`;
                  return (
                    <li
                      key={item.href}
                      className="menu-list-item"
                      data-shape={item.shape}
                    >
                      <a
                        href={linkHref}
                        className={`drawer-nav-link ${isActive ? "active" : ""}`}
                        onClick={(e) => handleNavClick(e, item.targetId, item.href)}
                      >
                        <p className="drawer-nav-text">{item.label}</p>
                        <div className="drawer-nav-hover-bg"></div>
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          </nav>
        </div>
      </section>
    </div>
  );
}

export { SiteNav as Navbar };

