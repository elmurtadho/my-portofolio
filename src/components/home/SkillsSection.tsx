"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Wrench,
  Sparkles,
  Layers,
  Box,
  Video,
  Palette,
  Code2,
  Cpu,
  Search,
  Award,
} from "lucide-react";
import { SkillItem } from "@/lib/mock-data";
import { AnimatedSkillBar } from "@/components/ui/AnimatedSkillBar";

interface SkillsSectionProps {
  skills: SkillItem[];
}

export function SkillsSection({ skills }: SkillsSectionProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const categories = [
    { label: "Semua", value: "All" },
    { label: "UI/UX", value: "UI/UX" },
    { label: "Desain Grafis", value: "Design" },
    { label: "3D & Visual", value: "3D" },
    { label: "Motion Video", value: "Video" },
    { label: "Teknologi Web", value: "Tech" },
  ];

  const filteredSkills = skills.filter((s) => {
    const matchesCategory =
      selectedCategory === "All" || s.category === selectedCategory;
    const matchesSearch = s.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "UI/UX":
        return <Layers className="w-4 h-4 text-emerald-400" />;
      case "3D":
        return <Box className="w-4 h-4 text-cyan-400" />;
      case "Video":
        return <Video className="w-4 h-4 text-amber-400" />;
      case "Design":
        return <Palette className="w-4 h-4 text-rose-400" />;
      case "Tech":
        return <Code2 className="w-4 h-4 text-teal-400" />;
      default:
        return <Cpu className="w-4 h-4 text-emerald-400" />;
    }
  };

  // Stats
  const expertCount = skills.filter((s) => s.level >= 90).length;
  const advancedCount = skills.filter((s) => s.level >= 80 && s.level < 90).length;
  const averageScore = Math.round(
    skills.reduce((acc, curr) => acc + curr.level, 0) / (skills.length || 1)
  );

  return (
    <section
      id="skills"
      className="relative py-24 bg-[#070f0b] overflow-hidden"
    >
      {/* Background glowing gradient */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-emerald-500/5 blur-[160px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#10291e] border border-[#1e4834] text-xs font-semibold text-emerald-300 uppercase tracking-widest mb-3">
            <Wrench className="w-3.5 h-3.5" />
            <span>Keahlian &amp; Kemampuan</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight">
            Kekuatan Teknis &amp;{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-teal-300">
              Penguasaan Alat
            </span>
          </h2>
          <p className="mt-3 text-base text-emerald-200/60 max-w-2xl leading-relaxed">
            Daftar lengkap keahlian dengan indikator persentase level penguasaan berdasarkan jam terbang dan hasil proyek nyata.
          </p>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-3 gap-3 sm:gap-6 mt-8 p-3 rounded-2xl bg-[#091811] border border-[#183928] max-w-xl w-full">
            <div className="text-center">
              <span className="text-lg sm:text-2xl font-black text-white">{expertCount}</span>
              <p className="text-[11px] text-emerald-300/70 font-semibold">Tingkat Master (90%+)</p>
            </div>
            <div className="text-center border-x border-[#183928]">
              <span className="text-lg sm:text-2xl font-black text-emerald-300">{advancedCount}</span>
              <p className="text-[11px] text-emerald-300/70 font-semibold">Tingkat Mahir (80%+)</p>
            </div>
            <div className="text-center">
              <span className="text-lg sm:text-2xl font-black text-teal-300">{averageScore}%</span>
              <p className="text-[11px] text-emerald-300/70 font-semibold">Rata-rata Kemampuan</p>
            </div>
          </div>

          {/* Category Filter Pills & Search */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 w-full max-w-4xl">
            <div className="flex flex-wrap items-center justify-center gap-1.5 p-1.5 bg-[#0b1b13] border border-[#1b3d2d] rounded-2xl shadow-inner">
              {categories.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setSelectedCategory(cat.value)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 ${
                    selectedCategory === cat.value
                      ? "bg-emerald-400 text-emerald-950 shadow-md shadow-emerald-500/20 font-bold"
                      : "text-emerald-200/70 hover:text-white hover:bg-[#132c1f]"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Quick Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400/50" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari keahlian..."
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#091811] border border-[#1c4431] text-xs text-white placeholder-emerald-400/40 focus:outline-none focus:border-emerald-400 transition"
              />
            </div>
          </div>
        </div>

        {/* Skills Grid with Animated Fill Bars */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSkills.map((skill, index) => (
            <AnimatedSkillBar
              key={skill.id}
              name={skill.name}
              level={skill.level}
              category={skill.category}
              icon={skill.icon || getCategoryIcon(skill.category)}
              delay={index}
            />
          ))}
        </div>

        {filteredSkills.length === 0 && (
          <div className="text-center py-12 p-6 rounded-2xl bg-[#0b1c14] border border-[#1b3d2d]">
            <p className="text-sm font-bold text-white">Tidak ada keahlian yang cocok</p>
            <p className="text-xs text-emerald-300/60 mt-1">
              Coba kata kunci lain atau pilih kategori &quot;Semua&quot;.
            </p>
          </div>
        )}

        {/* Skill Section Summary Banner */}
        <div className="mt-12 p-6 rounded-2xl bg-[#091711]/80 border border-[#1a3f2d] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-300 flex-shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">
                Siap Beradaptasi dengan Stack &amp; Workflow Baru
              </p>
              <p className="text-xs text-emerald-200/65">
                Cepat mempelajari tools terkini sesuai kebutuhan teknis proyek.
              </p>
            </div>
          </div>
          <a
            href="#projects"
            className="text-xs font-bold text-emerald-300 hover:text-white px-4 py-2 rounded-xl bg-[#112c1f] hover:bg-[#183d2a] border border-[#204e38] transition whitespace-nowrap"
          >
            Lihat Implementasi di Karya &rarr;
          </a>
        </div>
      </div>
    </section>
  );
}
