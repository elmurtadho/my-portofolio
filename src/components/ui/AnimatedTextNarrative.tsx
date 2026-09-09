"use client";

import React from "react";
import { motion } from "framer-motion";

interface AnimatedTextNarrativeProps {
  text: string;
  highlightWords?: string[];
  className?: string;
}

export function AnimatedTextNarrative({
  text,
  highlightWords = [
    "desainer",
    "multidisiplin",
    "pengalaman",
    "digital",
    "visual",
    "grafis",
    "UI/UX",
    "intuitif",
    "motion",
    "video",
    "3D",
    "interaktif",
    "real-time",
  ],
  className = "",
}: AnimatedTextNarrativeProps) {
  const words = text.split(" ");

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
      opacity: 1,
      transition: { staggerChildren: 0.03, delayChildren: 0.1 * i },
    }),
  };

  const childVariants = {
    hidden: {
      opacity: 0,
      y: 12,
      filter: "blur(4px)",
    },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: {
        type: "spring" as const,
        damping: 12,
        stiffness: 100,
      },
    },
  };

  // Helper to check if a word matches any highlight
  const isHighlighted = (word: string) => {
    const cleanWord = word.toLowerCase().replace(/[^a-z0-9]/g, "");
    return highlightWords.some(
      (hw) => cleanWord === hw.toLowerCase() || cleanWord.includes(hw.toLowerCase())
    );
  };

  return (
    <motion.p
      className={`flex flex-wrap gap-x-1.5 gap-y-1 text-base sm:text-lg leading-relaxed ${className}`}
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-40px" }}
    >
      {words.map((word, index) => {
        const highlighted = isHighlighted(word);
        return (
          <motion.span
            key={index}
            variants={childVariants}
            className={`inline-block transition-colors duration-300 ${
              highlighted
                ? "text-emerald-300 font-semibold drop-shadow-[0_0_12px_rgba(52,211,153,0.3)] bg-emerald-500/10 px-1 py-0.5 rounded border border-emerald-500/20"
                : "text-emerald-100/80 hover:text-white"
            }`}
          >
            {word}
          </motion.span>
        );
      })}
    </motion.p>
  );
}
