"use client";

import React, { useEffect, useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Sparkles, Layers, Box, Video, Palette, Code2, Cpu } from "lucide-react";

interface AnimatedSkillBarProps {
  name: string;
  level: number;
  category: string;
  icon?: string | React.ReactNode;
  delay?: number;
}

function SkillIconRenderer({ icon, category }: { icon?: string | React.ReactNode; category: string }) {
  const [imgError, setImgError] = useState(false);

  if (React.isValidElement(icon)) {
    return icon;
  }

  if (typeof icon === "string" && icon.trim() && !imgError) {
    const trimmed = icon.trim();
    const isImage =
      trimmed.startsWith("/") ||
      trimmed.startsWith("http://") ||
      trimmed.startsWith("https://") ||
      trimmed.startsWith("data:image/") ||
      /\.(png|jpe?g|svg|webp|gif|ico)(\?.*)?$/i.test(trimmed);

    if (isImage) {
      return (
        <img
          src={trimmed}
          alt="Skill Logo"
          className="w-full h-full object-contain rounded-lg p-0.5"
          onError={() => setImgError(true)}
        />
      );
    }

    // Lucide icon name matching
    switch (trimmed.toLowerCase()) {
      case "figma":
      case "palette":
      case "design":
        return <Palette className="w-4 h-4 text-emerald-300" />;
      case "blender":
      case "3d":
      case "box":
      case "layers":
        return <Box className="w-4 h-4 text-cyan-300" />;
      case "video":
      case "motion":
      case "film":
        return <Video className="w-4 h-4 text-amber-300" />;
      case "code":
      case "react":
      case "nextjs":
      case "tech":
        return <Code2 className="w-4 h-4 text-teal-300" />;
      case "cpu":
        return <Cpu className="w-4 h-4 text-emerald-300" />;
      default:
        return <Sparkles className="w-4 h-4 text-emerald-300" />;
    }
  }

  // Fallback based on category
  switch (category.toLowerCase()) {
    case "ui/ux":
    case "design & ui/ux":
      return <Layers className="w-4 h-4 text-emerald-400" />;
    case "3d":
    case "3d & creative":
      return <Box className="w-4 h-4 text-cyan-400" />;
    case "video":
    case "video & motion":
      return <Video className="w-4 h-4 text-amber-400" />;
    case "design":
      return <Palette className="w-4 h-4 text-rose-400" />;
    case "tech":
    case "development":
      return <Code2 className="w-4 h-4 text-teal-400" />;
    default:
      return <Sparkles className="w-4 h-4 text-emerald-400" />;
  }
}

export function AnimatedSkillBar({
  name,
  level,
  category,
  icon,
  delay = 0,
}: AnimatedSkillBarProps) {

  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const [count, setCount] = useState(0);

  // Animated percentage counter
  useEffect(() => {
    if (!isInView) return;

    let start = 0;
    const duration = 1200; // ms
    const stepTime = Math.max(10, Math.floor(duration / level));

    const timer = setInterval(() => {
      start += 1;
      setCount(start);
      if (start >= level) {
        setCount(level);
        clearInterval(timer);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [isInView, level]);

  const getMastery = (val: number) => {
    if (val >= 90) return { text: "Master", color: "text-emerald-300" };
    if (val >= 80) return { text: "Mahir", color: "text-teal-300" };
    return { text: "Menengah", color: "text-emerald-400/80" };
  };

  const mastery = getMastery(level);

  return (
    <div
      ref={ref}
      className="p-6 rounded-2xl bg-[#0b1c14] border border-[#1b4330] hover:border-emerald-500/50 hover:bg-[#0f241a] transition-all duration-300 group shadow-xl shadow-black/20 flex flex-col justify-between"
    >
      <div>
        {/* Header: Icon, Name & Animated Count */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0e251b] border border-[#1e4c36] flex items-center justify-center flex-shrink-0 p-1.5 shadow-md shadow-emerald-500/10 group-hover:border-emerald-400/50 group-hover:scale-105 transition-all">
              <SkillIconRenderer icon={icon} category={category} />
            </div>
            <h3 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors">
              {name}
            </h3>
          </div>
          <span className="text-xs font-bold text-emerald-300 bg-[#133223] px-2.5 py-1 rounded-md border border-[#205139] shadow-inner font-mono">
            {count}%
          </span>
        </div>

        {/* Progress Bar with Glowing Head */}
        <div className="relative mt-4 mb-2 w-full h-3 bg-[#08150f] rounded-full overflow-hidden p-0.5 border border-[#183928]">
          <motion.div
            className="relative h-full bg-gradient-to-r from-emerald-600 via-teal-400 to-emerald-300 rounded-full shadow-[0_0_14px_rgba(52,211,153,0.5)]"
            initial={{ width: "0%" }}
            animate={isInView ? { width: `${level}%` } : { width: "0%" }}
            transition={{
              duration: 1.2,
              delay: delay * 0.08,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            {/* Shimmer light sweep animation */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_infinite]" />
            {/* Bright glowing head indicator */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white shadow-[0_0_8px_#34d399]" />
          </motion.div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#143224] text-xs">
        <span className="text-emerald-300/60 font-medium">
          Bidang: {category}
        </span>
        <span className={`font-semibold ${mastery.color}`}>
          {mastery.text}
        </span>
      </div>
    </div>
  );
}
