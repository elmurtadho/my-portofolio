"use client";

import React from "react";
import { CheckCircle2, User, Award, Layers, Sparkles, FileText, Compass, HeartHandshake } from "lucide-react";
import { AboutData } from "@/lib/mock-data";
import { AnimatedTextNarrative } from "@/components/ui/AnimatedTextNarrative";

interface AboutSectionProps {
  about: AboutData;
}

export function AboutSection({ about }: AboutSectionProps) {
  const [imageError, setImageError] = React.useState(false);

  const milestones = [
    {
      year: "2023 - Sekarang",
      role: "Senior Multidisciplinary & 3D Web Visualist",
      desc: "Menangani brand digital berskala nasional & internasional dengan integrasi visual interaktif.",
    },
    {
      year: "2021 - 2023",
      role: "Lead UI/UX & Motion Designer",
      desc: "Merancang desain sistem, antarmuka produk web/mobile, dan video motion promosi komersial.",
    },
    {
      year: "2019 - 2021",
      role: "Graphic Designer & Visual Content Creator",
      desc: "Menciptakan aset grafis vektor, identitas korporat, dan kampanye visual media sosial.",
    },
  ];

  return (
    <section
      id="about"
      className="relative py-24 bg-[#08140e] border-t border-b border-[#142d20] overflow-hidden scroll-mt-20"
    >
      {/* Background ambient glows */}
      <div className="absolute right-[-5%] top-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 blur-[130px] pointer-events-none" />
      <div className="absolute left-[-10%] bottom-0 w-80 h-80 bg-teal-500/5 blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col items-center text-center mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#10291e] border border-[#1e4834] text-xs font-semibold text-emerald-300 uppercase tracking-widest mb-3">
            <User className="w-3.5 h-3.5" />
            <span>Tentang Saya</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight">
            Mengenal Lebih Dekat{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-teal-300">
              Visi &amp; Perjalanan
            </span>
          </h2>
          <p className="mt-3 text-base text-emerald-200/60 max-w-2xl leading-relaxed">
            Dedikasi penuh untuk menghadirkan karya visual dan produk digital yang fungsional, berdampak, dan bernilai estetika tinggi.
          </p>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: Image with Experience Badges */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none rounded-2xl overflow-hidden border border-[#1f4b36] shadow-2xl bg-[#091a11] group min-h-[420px] flex items-center justify-center">
              {about.imageUrl && !imageError ? (
                <>
                  <img
                    src={about.imageUrl}
                    alt="Tentang Saya"
                    onError={() => setImageError(true)}
                    className="w-full h-[450px] object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#070f0b] via-[#070f0b]/30 to-transparent pointer-events-none" />
                </>
              ) : (
                <div className="w-full h-[450px] bg-gradient-to-br from-[#0b2418] via-[#071910] to-[#040e08] p-8 flex flex-col justify-between relative overflow-hidden select-none">
                  <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-300">
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <span className="px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold tracking-wider uppercase">
                      Creative Visualist
                    </span>
                  </div>

                  <div className="space-y-2 relative z-10">
                    <h3 className="text-2xl font-bold text-white tracking-tight font-designer">
                      Ahmad Elmurtadho
                    </h3>
                    <p className="text-xs text-emerald-300/80 leading-relaxed">
                      Multidisciplinary Designer &bull; UI/UX &bull; 3D &bull; Motion
                    </p>
                    <div className="pt-2 flex flex-wrap gap-1.5">
                      {["Figma", "Blender", "Three.js", "After Effects"].map((tool) => (
                        <span key={tool} className="px-2 py-0.5 rounded-md bg-[#0e2c1e] text-[10px] text-emerald-200 border border-emerald-500/20 font-medium">
                          {tool}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Floating Stat Badge */}
              <div className="absolute bottom-6 left-6 right-6 p-4 rounded-xl bg-[#091711]/90 backdrop-blur-md border border-[#1e4632] shadow-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-300">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-wider text-emerald-300/70 font-semibold">Pengalaman</p>
                    <p className="text-base font-bold text-white">
                      {about.experienceYears || 4}+ Tahun Berkarya
                    </p>
                  </div>
                </div>
                <div className="h-8 w-px bg-[#1e4632]" />
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-emerald-300/70 font-semibold">Karya Sukses</p>
                  <p className="text-base font-bold text-emerald-300">
                    {about.completedProjects || 48}+ Proyek
                  </p>
                </div>
              </div>
            </div>

            {/* Motto / Philosophy Card */}
            <div className="mt-6 p-5 rounded-2xl bg-[#0b1c14] border border-[#1d4633] shadow-lg">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs mb-2">
                <HeartHandshake className="w-4 h-4" />
                <span>Filosofi Berkarya</span>
              </div>
              <p className="text-xs sm:text-sm text-emerald-100/80 italic leading-relaxed">
                &ldquo;Desain bukan sekadar apa yang terlihat, melainkan bagaimana sebuah karya dapat memecahkan masalah dan memberi kesan emosional yang mendalam bagi penggunanya.&rdquo;
              </p>
            </div>
          </div>

          {/* Right Column: Bio, Highlights & Journey Timeline */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            <div>
              <h3 className="text-2xl sm:text-3xl font-bold text-white leading-snug">
                Menghubungkan Gagasan Kreatif Menjadi Kenyataan Digital yang Hidup
              </h3>
              <AnimatedTextNarrative
                text={about.bio}
                className="mt-4"
              />
            </div>

            {/* Feature Checklist */}
            <div className="space-y-3 pt-2">
              {(about.highlightPoints || []).map((point, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <div className="mt-1 w-5 h-5 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center flex-shrink-0 text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-sm sm:text-base text-emerald-100/90 font-medium">
                    {point}
                  </span>
                </div>
              ))}
            </div>

            {/* Quick Feature Pillars */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-[#0e2218] border border-[#1d4734]">
                <div className="flex items-center gap-2 text-emerald-300 font-semibold text-sm mb-1.5">
                  <Layers className="w-4 h-4 text-emerald-400" />
                  <span>Multidisiplin Komprehensif</span>
                </div>
                <p className="text-xs text-emerald-200/60 leading-relaxed">
                  Eksekusi menyeluruh dari identitas grafis 2D, antarmuka interaktif, motion reels, hingga aset 3D WebGL.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#0e2218] border border-[#1d4734]">
                <div className="flex items-center gap-2 text-emerald-300 font-semibold text-sm mb-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span>Nuansa Dark Mint Elegan</span>
                </div>
                <p className="text-xs text-emerald-200/60 leading-relaxed">
                  Visual berkelas dengan hierarki tipografi presisi dan kenyamanan pandangan berjam-jam.
                </p>
              </div>
            </div>

            {/* Experience Journey Timeline */}
            <div className="pt-4 border-t border-[#163627]">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm mb-4">
                <Compass className="w-4 h-4" />
                <span>Jejak Langkah &amp; Pengalaman</span>
              </div>
              <div className="space-y-4">
                {milestones.map((m, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-xl bg-[#0a1b12] border border-[#183928] hover:border-emerald-500/40 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                      <h4 className="text-sm font-bold text-white">
                        {m.role}
                      </h4>
                      <span className="text-[11px] font-semibold text-emerald-400 px-2 py-0.5 rounded bg-[#112b1d] w-fit">
                        {m.year}
                      </span>
                    </div>
                    <p className="text-xs text-emerald-200/65 leading-relaxed">
                      {m.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
