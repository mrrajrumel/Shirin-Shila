"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

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
  letterImages?: string[];
  className?: string;
}

export function RevealText({
  text = "SHIRIN SHILA",
  textColor = "text-white",
  highlightTextColor = "text-[#ff3f79]",
  overlayColor = "text-[#ff3f79]",
  fontSize = "text-[clamp(52px,8.5vw,130px)]",
  fontClassName = "font-serif font-black tracking-tight",
  letterDelay = 0.08,
  overlayDelay = 0.05,
  overlayDuration = 0.45,
  springDuration = 600,
  letterImages = [
    "/images/hero.jpg",
    "/images/poster-hitman.jpg",
    "/images/gallery-1.jpg",
    "/images/award-diff-stage.jpg",
    "/images/gallery-2.jpg",
    "/images/poster-begum-jaan.jpg",
    "/images/award-trophy-gala.jpg",
    "/images/poster-seshbazi.jpg",
    "/images/gallery-3.jpg",
    "/images/poster-birangona71.jpg",
    "/images/gallery-4.jpg",
  ],
  className = "",
}: RevealTextProps) {
  const [hoveredGlobalIndex, setHoveredGlobalIndex] = useState<number | null>(null);
  const [showRedText, setShowRedText] = useState(false);

  // Split into words so lines wrap cleanly on mobile
  const words = text.split(" ");
  const totalLetters = text.replace(/\s+/g, "").length;

  useEffect(() => {
    // Calculate when the last letter animation completes
    const lastLetterDelay = (totalLetters - 1) * letterDelay;
    const totalDelay = lastLetterDelay * 1000 + springDuration;

    const timer = setTimeout(() => {
      setShowRedText(true);
    }, totalDelay);

    return () => clearTimeout(timer);
  }, [totalLetters, letterDelay, springDuration]);

  // Keep track of running index across words
  let runningIndex = 0;

  return (
    <div className={`flex flex-wrap items-center gap-x-[0.3em] gap-y-1 relative select-none ${className}`}>
      {words.map((word, wordIndex) => {
        // Second word (e.g. "SHILA") gets the signature brand highlight color
        const isSecondWord = wordIndex > 0;
        const currentTextColor = isSecondWord && highlightTextColor ? highlightTextColor : textColor;

        return (
          <div key={wordIndex} className="inline-flex items-center">
            {word.split("").map((letter) => {
              const globalIndex = runningIndex++;
              const isHovered = hoveredGlobalIndex === globalIndex;
              const imgUrl = letterImages[globalIndex % letterImages.length];

              return (
                <motion.span
                  key={globalIndex}
                  onMouseEnter={() => setHoveredGlobalIndex(globalIndex)}
                  onMouseLeave={() => setHoveredGlobalIndex(null)}
                  className={`${fontSize} ${fontClassName} cursor-pointer relative overflow-hidden leading-[0.88] inline-block`}
                  initial={{
                    scale: 0,
                    opacity: 0,
                  }}
                  animate={{
                    scale: 1,
                    opacity: 1,
                  }}
                  transition={{
                    delay: globalIndex * letterDelay,
                    type: "spring",
                    damping: 8,
                    stiffness: 200,
                    mass: 0.8,
                  }}
                >
                  {/* Base text layer */}
                  <motion.span
                    className={`inline-block ${currentTextColor}`}
                    animate={{
                      opacity: isHovered ? 0 : 1,
                    }}
                    transition={{ duration: 0.12 }}
                  >
                    {letter}
                  </motion.span>

                  {/* Image text layer with cinematic background panning */}
                  <motion.span
                    className="absolute inset-0 text-transparent bg-clip-text bg-cover bg-no-repeat"
                    animate={{
                      opacity: isHovered ? 1 : 0,
                      backgroundPosition: isHovered ? "20% center" : "0% center",
                    }}
                    transition={{
                      opacity: { duration: 0.12 },
                      backgroundPosition: {
                        duration: 3,
                        ease: "easeInOut",
                      },
                    }}
                    style={{
                      backgroundImage: `url('${imgUrl}')`,
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    {letter}
                  </motion.span>

                  {/* Overlay text layer that sweeps across each letter */}
                  {showRedText && (
                    <motion.span
                      className={`absolute inset-0 ${overlayColor} pointer-events-none`}
                      initial={{ opacity: 0 }}
                      animate={{
                        opacity: [0, 1, 1, 0],
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

