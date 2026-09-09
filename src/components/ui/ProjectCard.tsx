"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Play, Box, Image as ImageIcon, ExternalLink, Sparkles, Star, Eye } from "lucide-react";
import { ProjectItem } from "@/lib/mock-data";

interface ProjectCardProps {
  project: ProjectItem;
  onPreview: (project: ProjectItem) => void;
}

export function ProjectCard({ project, onPreview }: ProjectCardProps) {
  const router = useRouter();
  const [isPlayingInline, setIsPlayingInline] = React.useState(false);

  const is3D = project.mediaType === "model3d";
  const review3DUrl = `/karya-3d/${project.id}`;

  const getMediaBadge = (type: ProjectItem["mediaType"]) => {
    switch (type) {
      case "video":
        return {
          icon: <Play className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />,
          label: "Motion Video",
          badgeColor: "bg-amber-500/15 border-amber-500/30 text-amber-200",
        };
      case "model3d":
        return {
          icon: <Box className="w-3.5 h-3.5 text-cyan-300" />,
          label: "Interactive 3D",
          badgeColor: "bg-cyan-500/15 border-cyan-500/30 text-cyan-200",
        };
      default:
        return {
          icon: <ImageIcon className="w-3.5 h-3.5 text-emerald-300" />,
          label: "Visual Image",
          badgeColor: "bg-emerald-500/15 border-emerald-500/30 text-emerald-200",
        };
    }
  };

  const badge = getMediaBadge(project.mediaType);

  const handleCardClick = () => {
    if (is3D) {
      router.push(review3DUrl);
    } else {
      onPreview(project);
    }
  };

  return (
    <motion.div
      layout
      whileHover={{ y: -7, scale: 1.01 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      onClick={handleCardClick}
      className="group relative rounded-2xl bg-[#0b1c14] border border-[#1b4330] hover:border-emerald-400/80 overflow-hidden shadow-xl hover:shadow-[0_18px_40px_rgba(16,185,129,0.22)] flex flex-col justify-between transition-colors duration-300 cursor-pointer"
    >
      {/* Thumbnail / Video Player Area */}
      <div className="relative aspect-[16/10] overflow-hidden bg-[#060e0a]">
        {isPlayingInline && project.mediaType === "video" ? (
          <div className="relative w-full h-full" onClick={(e) => e.stopPropagation()}>
            <video
              src={project.mediaUrl}
              controls
              autoPlay
              className="w-full h-full object-cover"
            />
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsPlayingInline(false);
              }}
              className="absolute top-3 right-3 z-30 p-1.5 rounded-lg bg-black/70 hover:bg-black text-white text-xs backdrop-blur-md transition"
              title="Tutup Pemutar Video"
            >
              ✕ Tutup Video
            </button>
          </div>
        ) : (
          <>
            <img
              src={project.thumbnailUrl}
              alt={project.title}
              className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0b1c14] via-transparent to-black/40" />

            {/* If video project, show glowing central play button */}
            {project.mediaType === "video" && (
              <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                <div className="w-14 h-14 rounded-full bg-emerald-400/90 text-emerald-950 flex items-center justify-center shadow-[0_0_25px_rgba(52,211,153,0.5)] group-hover:scale-110 transition-transform">
                  <Play className="w-6 h-6 fill-emerald-950 text-emerald-950 ml-1" />
                </div>
              </div>
            )}

            {/* If 3D project, show 3D indicator overlay icon */}
            {is3D && (
              <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                <div className="w-13 h-13 rounded-2xl bg-[#091a12]/85 border border-[#205139] text-cyan-300 flex flex-col items-center justify-center shadow-[0_0_25px_rgba(6,182,212,0.35)] group-hover:scale-110 group-hover:border-cyan-400/60 transition-transform p-2">
                  <Box className="w-6 h-6" />
                  <span className="text-[9px] font-bold uppercase tracking-wider text-cyan-200 mt-0.5">360° 3D</span>
                </div>
              </div>
            )}

            {/* Top Badges Bar */}
            <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none z-20">
              {/* Media Type Badge */}
              <div
                className={`px-3 py-1 rounded-full text-[11px] font-semibold flex items-center gap-1.5 backdrop-blur-md border shadow-md ${badge.badgeColor}`}
              >
                {badge.icon}
                <span>{badge.label}</span>
              </div>

              {/* Featured Star Badge */}
              {project.featured && (
                <div className="px-2.5 py-1 rounded-full bg-emerald-400 text-emerald-950 font-bold text-[10px] flex items-center gap-1 shadow-lg shadow-emerald-400/30">
                  <Star className="w-3 h-3 fill-emerald-950" />
                  <span>Unggulan</span>
                </div>
              )}
            </div>

            {/* Hover Action Overlay */}
            <div
              className="absolute inset-0 z-20 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 bg-black/60 backdrop-blur-[2px] transition-all duration-300"
              onClick={(e) => e.stopPropagation()}
            >
              {project.mediaType === "video" && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsPlayingInline(true);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-emerald-400 text-emerald-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-500/40 hover:bg-emerald-300 transition-all"
                >
                  <Play className="w-3.5 h-3.5 fill-emerald-950" />
                  <span>Putar di Kartu</span>
                </button>
              )}

              {is3D ? (
                <Link
                  href={review3DUrl}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400 text-emerald-950 font-bold text-xs flex items-center gap-2 shadow-xl shadow-emerald-500/30 hover:brightness-110 active:scale-95 transition-all"
                >
                  <Box className="w-4 h-4" />
                  <span>Review 3D 360° &amp; Bongkar</span>
                </Link>
              ) : (
                <button
                  onClick={() => onPreview(project)}
                  className="px-4 py-2.5 rounded-xl bg-[#143525] border border-[#21543b] text-emerald-200 hover:text-white hover:bg-[#1a4430] font-semibold text-xs flex items-center gap-1.5 shadow-lg transition-all"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Rincian</span>
                </button>
              )}
            </div>
          </>
        )}
      </div>

      {/* Card Content Body */}
      <div className="p-6 flex-1 flex flex-col justify-between">
        <div>
          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {project.tags.map((tag, i) => (
              <span
                key={i}
                className="px-2 py-0.5 rounded-md bg-[#132d20] border border-[#204e37] text-[11px] font-medium text-emerald-300/80"
              >
                #{tag}
              </span>
            ))}
          </div>

          {/* Project Title */}
          <h3 className="text-lg font-bold text-white group-hover:text-emerald-300 transition-colors line-clamp-1">
            {project.title}
          </h3>

          {/* Description */}
          <p className="mt-2 text-xs sm:text-sm text-emerald-100/65 line-clamp-2 leading-relaxed">
            {project.description}
          </p>
        </div>

        {/* Bottom Details Footer */}
        <div className="pt-4 mt-5 border-t border-[#183929] flex items-center justify-between text-xs">
          <span className="text-emerald-400/80 font-medium capitalize">
            {project.categorySlug.replace("-", " ")}
          </span>

          {is3D ? (
            <Link
              href={review3DUrl}
              onClick={(e) => e.stopPropagation()}
              className="text-cyan-300 hover:text-white font-semibold flex items-center gap-1.5 group-hover:translate-x-0.5 transition-all"
            >
              <span>Review 3D 360°</span>
              <Box className="w-3.5 h-3.5" />
            </Link>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onPreview(project);
              }}
              className="text-emerald-300 hover:text-white font-semibold flex items-center gap-1 group-hover:translate-x-0.5 transition-all"
            >
              Preview &rarr;
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
