"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";

export interface RevealTextProps {
  text?: string;
  textColor?: string;
  highlightTextColor?: string;
  overlayColor?: string;
  fontSize?: string;
  fontClassName?: string;
  letterDelay?: number;
  overlayDelay?: number;
  overlayDuration?: number;
  springDuration?: number;
  className?: string;
}

export function RevealText({
  text = "SHIRIN SHILA",
  textColor = "text-white",
  highlightTextColor = "text-[#ff3f79]",
  overlayColor = "text-[#ff3f79]",
  fontSize = "text-[clamp(32px,6.8vw,118px)]",
  fontClassName = "font-serif font-black tracking-tight",
  letterDelay = 0.07,
  overlayDelay = 0.045,
  overlayDuration = 0.4,
  springDuration = 600,
  className = "",
}: RevealTextProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredGlobalIndex, setHoveredGlobalIndex] = useState<number | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 50, y: 50 });
  const [isPointerOver, setIsPointerOver] = useState(false);
  const [showSweepEffect, setShowSweepEffect] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  // Split into words so lines wrap cleanly on mobile
  const words = text.split(" ");
  const totalLetters = text.replace(/\s+/g, "").length;

  useEffect(() => {
    // Initial entrance sweep animation
    const lastLetterDelay = (totalLetters - 1) * letterDelay;
    const totalDelay = lastLetterDelay * 1000 + springDuration;

    const timer = setTimeout(() => {
      setShowSweepEffect(true);
    }, totalDelay);

    return () => clearTimeout(timer);
  }, [totalLetters, letterDelay, springDuration]);

  // Track pointer position across the container to drive dynamic gradient illumination
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (shouldReduceMotion || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
    setMousePos({ x, y });
    setIsPointerOver(true);
  };

  const handlePointerLeave = () => {
    setIsPointerOver(false);
    setHoveredGlobalIndex(null);
  };

  let runningIndex = 0;

  return (
    <div
      ref={containerRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className={`flex flex-wrap items-center gap-x-[0.3em] gap-y-1 relative select-none ${className}`}
      style={{
        // Dynamic CSS variables driven by pointer position for smooth color interpolation
        ["--pointer-x" as any]: `${mousePos.x}%`,
        ["--pointer-y" as any]: `${mousePos.y}%`,
      }}
    >
      {words.map((word, wordIndex) => {
        const isSecondWord = wordIndex > 0;
        const currentTextColor = isSecondWord && highlightTextColor ? highlightTextColor : textColor;

        return (
          <div key={wordIndex} className="inline-flex items-center">
            {word.split("").map((letter) => {
              const globalIndex = runningIndex++;
              const isHovered = hoveredGlobalIndex === globalIndex;

              // Color system styling based on whether it is first word (white/platinum) or second word (rose/magenta)
              const normalGradient = isSecondWord
                ? "linear-gradient(135deg, #ff7ca0 0%, #ff3f79 60%, #e51c44 100%)"
                : "linear-gradient(135deg, #ffffff 0%, #f1f5f9 60%, #cbd5e1 100%)";

              const interactiveGradient = isSecondWord
                ? "linear-gradient(135deg, #ffffff 0%, #ff7ca0 35%, #ff3f79 75%, #ff1f68 100%)"
                : "linear-gradient(135deg, #ffffff 0%, #ffe4ec 40%, #ff7ca0 85%, #ff3f79 100%)";

              return (
                <motion.span
                  key={globalIndex}
                  onPointerEnter={() => setHoveredGlobalIndex(globalIndex)}
                  onPointerLeave={() => setHoveredGlobalIndex(null)}
                  className={`${fontSize} ${fontClassName} cursor-pointer relative overflow-visible leading-[0.88] inline-block transition-transform duration-200`}
                  style={{
                    transform: isHovered && !shouldReduceMotion ? "translateY(-2px) scale(1.03)" : "none",
                  }}
                  initial={{
                    scale: 0,
                    opacity: 0,
                  }}
                  animate={{
                    scale: 1,
                    opacity: 1,
                  }}
                  transition={{
                    delay: shouldReduceMotion ? 0 : globalIndex * letterDelay,
                    type: "spring",
                    damping: 10,
                    stiffness: 220,
                    mass: 0.8,
                  }}
                >
                  {/* Base chromatic letter layer */}
                  <span
                    className="inline-block transition-all duration-300"
                    style={{
                      background: isHovered
                        ? interactiveGradient
                        : isPointerOver
                        ? normalGradient
                        : undefined,
                      WebkitBackgroundClip: isHovered || isPointerOver ? "text" : undefined,
                      WebkitTextFillColor: isHovered || isPointerOver ? "transparent" : undefined,
                      color: !(isHovered || isPointerOver)
                        ? isSecondWord
                          ? "#ff3f79"
                          : "#ffffff"
                        : undefined,
                      filter: isHovered
                        ? isSecondWord
                          ? "drop-shadow(0 0 18px rgba(255, 63, 121, 0.65))"
                          : "drop-shadow(0 0 16px rgba(255, 255, 255, 0.5))"
                        : "none",
                    }}
                  >
                    {letter}
                  </span>

                  {/* Initial cinematic sweep overlay across letters on page reveal */}
                  {showSweepEffect && !shouldReduceMotion && (
                    <motion.span
                      className={`absolute inset-0 ${overlayColor} pointer-events-none`}
                      initial={{ opacity: 0 }}
                      animate={{
                        opacity: [0, 0.85, 0.85, 0],
                      }}
                      transition={{
                        delay: globalIndex * overlayDelay,
                        duration: overlayDuration,
                        times: [0, 0.1, 0.7, 1],
                        ease: "easeInOut",
                      }}
                    >
                      {letter}
                    </motion.span>
                  )}
                </motion.span>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

export default RevealText;
