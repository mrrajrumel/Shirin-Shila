"use client";

import React, { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { heroProfile, HeroProfile } from "@/data/hero";

export interface HeroSectionProps {
  id?: string;
  initialProfile?: HeroProfile;
}

export function HeroMotion({ id = "home", initialProfile }: HeroSectionProps) {
  const containerRef = useRef<HTMLElement>(null);
  const [isClient, setIsClient] = useState(false);
  const [profile, setProfile] = useState<HeroProfile>(initialProfile || heroProfile);

  const loadHeroData = () => {
    fetch("/api/hero", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.hero) {
          setProfile(data.hero);
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    setIsClient(true);
    // Only fetch on initial mount if server profile was not supplied
    if (!initialProfile) {
      loadHeroData();
    }

    const handleUpdate = () => {
      loadHeroData();
    };

    window.addEventListener("shirin_shila_hero_updated", handleUpdate);
    window.addEventListener("shirin_shila_reset", handleUpdate);
    window.addEventListener("storage", (e) => {
      if (e.key === "shirin_shila_sync_hero") loadHeroData();
    });

    return () => {
      window.removeEventListener("shirin_shila_hero_updated", handleUpdate);
      window.removeEventListener("shirin_shila_reset", handleUpdate);
    };
  }, [initialProfile]);

  // Mouse Parallax Values
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 120, mass: 0.5 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  // Parallax transforms for image and background orb
  const imgX = useTransform(smoothX, [-0.5, 0.5], [-18, 18]);
  const imgY = useTransform(smoothY, [-0.5, 0.5], [-12, 12]);
  const imgRotateY = useTransform(smoothX, [-0.5, 0.5], [-4, 4]);
  const imgRotateX = useTransform(smoothY, [-0.5, 0.5], [4, -4]);

  const orbX = useTransform(smoothX, [-0.5, 0.5], [25, -25]);
  const orbY = useTransform(smoothY, [-0.5, 0.5], [20, -20]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current || (typeof window !== "undefined" && window.innerWidth <= 860)) return;
    const { innerWidth, innerHeight } = window;
    const x = (e.clientX / innerWidth) - 0.5;
    const y = (e.clientY / innerHeight) - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  const nameParts = profile.name.split(" ");
  const firstName = nameParts[0];
  const lastName = nameParts.slice(1).join(" ");

  return (
    <section
      id={id}
      ref={containerRef}
      className="hero"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Floating Animated Ambient Glow Orb */}
      <motion.div
        className="hero-orb"
        style={{
          x: orbX,
          y: orbY,
        }}
        animate={{
          scale: [1, 1.08, 0.96, 1],
          opacity: [0.65, 0.85, 0.6, 0.65],
        }}
        transition={{
          duration: 9,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Kinetic Parallax Hero Portrait */}
      <motion.img
        className="hero-image"
        src={profile.image}
        alt={profile.imageAlt}
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).src = "/images/shirin-akter.png";
        }}
        style={{
          x: imgX,
          y: imgY,
          rotateY: imgRotateY,
          rotateX: imgRotateX,
          transformPerspective: 1000,
        }}
        initial={{ opacity: 0, scale: 0.94, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
      />

      {/* Content Side */}
      <div className="hero-content">
        {/* Eyebrow */}
        <motion.div
          className="eyebrow"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15, ease: "easeOut" }}
        >
          <span>{profile.eyebrow}</span>
        </motion.div>

        {/* Large Cinematic Serif Title */}
        <motion.h1
          className="serif"
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.28, ease: [0.16, 1, 0.3, 1] }}
        >
          {firstName} <span className="pink">{lastName}</span>
        </motion.h1>

        {/* Roles Banner */}
        <motion.div
          className="hero-role"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.42, ease: "easeOut" }}
        >
          {profile.roles}
        </motion.div>

        {/* Natural Introduction */}
        <motion.p
          className="hero-intro"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.54, ease: "easeOut" }}
        >
          {profile.intro}
        </motion.p>
      </div>

      {/* Scroll to Explore with Pulsing Indicator */}
      <motion.div
        className="hero-bottom"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.95 }}
      >
        <span>{profile.scrollIndicatorText}</span>
        <motion.span
          className="scroll-line"
          animate={{
            scaleY: [0.3, 1, 0.3],
            opacity: [0.4, 1, 0.4],
          }}
          transition={{
            duration: 2.2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </motion.div>
    </section>
  );
}

export { HeroMotion as HeroSection };
export default HeroMotion;

