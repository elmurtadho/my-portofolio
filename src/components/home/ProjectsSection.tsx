"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { FolderGit2, Play, Box, Image as ImageIcon, ExternalLink, Sparkles, Filter, X, Palette, Film, Layout, Grid } from "lucide-react";
import { ProjectItem, CategoryItem } from "@/lib/mock-data";
import { ProjectCard } from "@/components/ui/ProjectCard";

interface ProjectsSectionProps {
  projects: ProjectItem[];
  categories: CategoryItem[];
}

export function ProjectsSection({ projects, categories }: ProjectsSectionProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<string>("all");
  const [activeMediaModal, setActiveMediaModal] = useState<ProjectItem | null>(null);

  const handlePreview = (project: ProjectItem) => {
    if (project.mediaType === "model3d") {
      router.push(`/karya-3d/${project.id}`);
    } else {
      setActiveMediaModal(project);
    }
  };

  const filteredProjects =
    activeTab === "all"
      ? projects
      : projects.filter((p) => p.categorySlug === activeTab);

  const getMediaIcon = (type: ProjectItem["mediaType"]) => {
    switch (type) {
      case "video":
        return <Play className="w-3.5 h-3.5 text-amber-300" />;
      case "model3d":
        return <Box className="w-3.5 h-3.5 text-cyan-300" />;
      default:
        return <ImageIcon className="w-3.5 h-3.5 text-emerald-300" />;
    }
  };

  const getMediaLabel = (type: ProjectItem["mediaType"]) => {
    switch (type) {
      case "video":
        return "Video Motion";
      case "model3d":
        return "3D Interactive";
      default:
        return "Visual Image";
    }
  };

  // Count items per category
  const getCategoryCount = (slug: string) => {
    if (slug === "all") return projects.length;
    return projects.filter((p) => p.categorySlug === slug).length;
  };

  return (
    <section
      id="projects"
      className="relative py-24 bg-[#08150f] border-t border-[#153123] overflow-hidden scroll-mt-20"
    >
      {/* Background radial glows */}
      <div className="absolute left-1/4 top-1/3 w-96 h-96 bg-emerald-500/5 blur-[140px] pointer-events-none" />
      <div className="absolute right-[-5%] bottom-10 w-80 h-80 bg-teal-500/5 blur-[130px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col items-center text-center mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#10291e] border border-[#1e4834] text-xs font-semibold text-emerald-300 uppercase tracking-widest mb-3">
            <FolderGit2 className="w-3.5 h-3.5" />
            <span>Galeri Portofolio</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight">
            Kumpulan Hasil Karya{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-teal-300">
              Terbaik
            </span>
          </h2>
          <p className="mt-3 text-base text-emerald-200/60 max-w-2xl leading-relaxed">
            Eksplorasi ragam kreasi mulai dari desain grafis, antarmuka UI/UX, motion video sinematik, hingga model 3D interaktif.
          </p>

          {/* Category Filter Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-8 p-1.5 bg-[#0b1b13] border border-[#1a3d2d] rounded-2xl backdrop-blur-md shadow-xl">
            <button
              onClick={() => setActiveTab("all")}
              className={`relative px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 flex items-center gap-2 z-10 ${
                activeTab === "all"
                  ? "text-emerald-950 font-bold"
                  : "text-emerald-200/70 hover:text-white"
              }`}
            >
              {activeTab === "all" && (
                <motion.div
                  layoutId="activeFilterTab"
                  className="absolute inset-0 bg-emerald-400 rounded-xl shadow-md shadow-emerald-500/25 -z-10"
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              )}
              <Grid className="w-4 h-4" />
              <span>Semua Karya</span>
              <span
                className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
                  activeTab === "all"
                    ? "bg-emerald-900/30 text-emerald-950"
                    : "bg-[#163526] text-emerald-300"
                }`}
              >
                {getCategoryCount("all")}
              </span>
            </button>
            {categories.map((cat) => {
              const count = getCategoryCount(cat.slug);
              const isActive = activeTab === cat.slug;
              const catIcon =
                cat.slug === "graphic-design" ? (
                  <Palette className="w-4 h-4" />
                ) : cat.slug === "ui-ux" ? (
                  <Layout className="w-4 h-4" />
                ) : cat.slug === "video-editor" ? (
                  <Film className="w-4 h-4" />
                ) : (
                  <Box className="w-4 h-4" />
                );

              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveTab(cat.slug)}
                  className={`relative px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 flex items-center gap-2 z-10 ${
                    isActive
                      ? "text-emerald-950 font-bold"
                      : "text-emerald-200/70 hover:text-white"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeFilterTab"
                      className="absolute inset-0 bg-emerald-400 rounded-xl shadow-md shadow-emerald-500/25 -z-10"
                      transition={{ type: "spring", stiffness: 350, damping: 30 }}
                    />
                  )}
                  {catIcon}
                  <span>{cat.name}</span>
                  <span
                    className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
                      isActive
                        ? "bg-emerald-900/30 text-emerald-950"
                        : "bg-[#163526] text-emerald-300"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Filter Feedback / Count */}
        <div className="flex items-center justify-between mb-8 pb-3 border-b border-[#143023] text-xs text-emerald-300/70">
          <span className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-emerald-400" />
            Menampilkan{" "}
            <strong className="text-white font-semibold">
              {filteredProjects.length}
            </strong>{" "}
            karya dalam kategori{" "}
            <strong className="text-emerald-300 font-semibold capitalize">
              {activeTab === "all" ? "Semua Bidang" : activeTab.replace("-", " ")}
            </strong>
          </span>
          <span className="hidden sm:inline text-emerald-400/60">
            Klik kartu untuk melihat rincian media
          </span>
        </div>

        {/* Projects Animated Grid */}
        <motion.div
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          <AnimatePresence mode="popLayout">
            {filteredProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onPreview={handlePreview}
              />
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Empty State if filter yields no items */}
        {filteredProjects.length === 0 && (
          <div className="text-center py-16 p-8 rounded-2xl bg-[#0b1c14] border border-[#1a3d2c]">
            <FolderGit2 className="w-12 h-12 text-emerald-400/40 mx-auto mb-3" />
            <p className="text-base font-bold text-white">Belum Ada Karya</p>
            <p className="text-xs text-emerald-300/60 mt-1">
              Belum ada proyek yang ditambahkan pada kategori ini.
            </p>
          </div>
        )}

        {/* Media Preview Modal (for Video and Image projects) */}
        {activeMediaModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
            <div className="relative w-full max-w-2xl bg-[#0b1c14] border border-[#1e4b36] rounded-2xl overflow-hidden shadow-2xl p-6">
              <div className="flex items-center justify-between pb-4 border-b border-[#183a29] mb-4">
                <div>
                  <h3 className="text-lg font-bold text-white">
                    {activeMediaModal.title}
                  </h3>
                  <p className="text-xs text-emerald-300/70 capitalize">
                    Kategori: {activeMediaModal.categorySlug.replace("-", " ")} • {getMediaLabel(activeMediaModal.mediaType)}
                  </p>
                </div>
                <button
                  onClick={() => setActiveMediaModal(null)}
                  className="p-1.5 rounded-lg bg-[#143123] text-emerald-200 hover:text-white hover:bg-[#1a412f] transition"
                  aria-label="Tutup"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Media Content */}
              <div className="rounded-xl overflow-hidden bg-[#060e0a] border border-[#183929] mb-4 flex items-center justify-center">
                {activeMediaModal.mediaType === "video" ? (
                  <div className="aspect-video w-full">
                    <video
                      src={activeMediaModal.mediaUrl}
                      controls
                      autoPlay
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="aspect-video w-full">
                    <img
                      src={activeMediaModal.mediaUrl}
                      alt={activeMediaModal.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>

              <p className="text-sm text-emerald-100/80 leading-relaxed mb-4">
                {activeMediaModal.description}
              </p>

              <div className="flex justify-end">
                <button
                  onClick={() => setActiveMediaModal(null)}
                  className="px-5 py-2 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-emerald-950 font-bold text-xs transition shadow-md shadow-emerald-500/20"
                >
                  Selesai Melihat
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
