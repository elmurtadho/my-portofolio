"use client";

import React from "react";
import { ArrowRight, Sparkles, Mail, Eye, Box, Palette, Video, FileText } from "lucide-react";
import { ProfileData } from "@/lib/mock-data";
import { Typewriter } from "@/components/ui/Typewriter";

interface HeroSectionProps {
  profile: ProfileData;
}

export function HeroSection({ profile }: HeroSectionProps) {
  // Ensure we have a list of roles to rotate in typewriter
  const roleList =
    profile.roles && profile.roles.length > 0
      ? profile.roles
      : [profile.role || "Multidisciplinary Designer"];

  const greetingList = Array.from(
    new Set([
      profile.greeting || "Halo, selamat datang di portofolio kreatif saya!",
      "Desainer multidisiplin dengan keahlian UI/UX & 3D WebGL.",
      "Siap mewujudkan ide visual bernilai tinggi untuk brand Anda.",
    ])
  );

  return (
    <section
      id="hero"
      className="relative pt-32 pb-20 md:pt-44 md:pb-28 overflow-hidden"
    >
      {/* Background Decorative Tech Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#10281c15_1px,transparent_1px),linear-gradient(to_bottom,#10281c15_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_100%)] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Text & Hero CTA */}
          <div className="lg:col-span-7 flex flex-col items-start gap-6">
            {/* Status Pill */}
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#0c2419]/90 border border-[#1e4a35] shadow-lg shadow-black/20">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400"></span>
              </span>
              <span className="text-xs font-semibold text-emerald-300">
                Tersedia untuk proyek freelance &amp; full-time
              </span>
            </div>

            {/* Greeting with animated typewriter */}
            <div className="text-emerald-400 font-medium tracking-wide text-base md:text-lg flex items-center gap-2 min-h-[32px]">
              <Sparkles className="w-4 h-4 text-emerald-300 flex-shrink-0" />
              <Typewriter
                words={greetingList}
                speed={55}
                deleteSpeed={30}
                pauseTime={2400}
                className="text-emerald-300 font-semibold"
                cursorClassName="bg-emerald-400"
              />
            </div>

            {/* Name Heading */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-[1.15]">
              Saya{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-teal-200 to-emerald-400 drop-shadow-sm">
                {profile.displayName}
              </span>
            </h1>

            {/* Typewriter Role Line */}
            <div className="text-xl sm:text-2xl md:text-3xl font-semibold text-emerald-100/90 min-h-[44px] flex items-center gap-2.5 flex-wrap">
              <span className="text-emerald-400/60 font-normal">Sebagai</span>
              <Typewriter
                words={roleList}
                speed={75}
                deleteSpeed={35}
                pauseTime={2200}
                className="text-emerald-300 font-bold border-b-2 border-emerald-400/80 pb-0.5"
                cursorClassName="bg-emerald-400 h-6 sm:h-8"
              />
            </div>

            {/* Tagline */}
            <p className="text-base sm:text-lg text-emerald-100/75 max-w-xl leading-relaxed">
              {profile.tagline}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-4">
              <a
                href="#projects"
                className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl font-bold text-sm text-emerald-950 bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-400 hover:from-emerald-300 hover:to-teal-300 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:-translate-y-0.5 transition-all duration-200"
              >
                <span>Jelajahi Hasil Karya</span>
                <ArrowRight className="w-4 h-4" />
              </a>
              <a
                href="#contact"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-sm text-emerald-200 bg-[#0e241b]/90 hover:bg-[#143024] border border-[#1f4b36] hover:border-emerald-500/50 hover:text-white transition-all duration-200"
              >
                <Mail className="w-4 h-4 text-emerald-400" />
                <span>Hubungi Saya</span>
              </a>
              <a
                href="#about"
                className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl font-medium text-sm text-emerald-300 hover:text-white bg-[#0a1811] hover:bg-[#122c20] border border-[#1b3f2d] hover:border-emerald-400/60 transition-all duration-200"
              >
                <FileText className="w-4 h-4 text-emerald-400" />
                <span>Profil &amp; Bio</span>
              </a>
            </div>

            {/* Micro Badges / Highlights */}
            <div className="grid grid-cols-3 gap-4 pt-6 w-full max-w-lg border-t border-[#163627]">
              <div>
                <div className="text-2xl sm:text-3xl font-black text-white">4+</div>
                <div className="text-xs text-emerald-300/70 font-medium mt-0.5">Tahun Pengalaman</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-black text-emerald-300">48+</div>
                <div className="text-xs text-emerald-300/70 font-medium mt-0.5">Karya Selesai</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-black text-white">100%</div>
                <div className="text-xs text-emerald-300/70 font-medium mt-0.5">Klien Puas</div>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Visual Showcase */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end relative">
            <div className="relative w-full max-w-sm sm:max-w-md">
              {/* Floating Pill Top Left */}
              <div className="absolute -top-4 -left-4 z-20 px-3.5 py-1.5 rounded-xl bg-[#08150f]/90 backdrop-blur-md border border-[#1e4b36] shadow-xl flex items-center gap-2">
                <Box className="w-4 h-4 text-cyan-300" />
                <span className="text-xs font-semibold text-emerald-100">3D WebGL Support</span>
              </div>

              {/* Floating Pill Bottom Right */}
              <div className="absolute -bottom-4 -right-4 z-20 px-3.5 py-1.5 rounded-xl bg-[#08150f]/90 backdrop-blur-md border border-[#1e4b36] shadow-xl flex items-center gap-2">
                <Palette className="w-4 h-4 text-emerald-300" />
                <span className="text-xs font-semibold text-emerald-100">Dark Mint System</span>
              </div>

              {/* Outer decorative glow frame */}
              <div className="absolute -inset-1 bg-gradient-to-tr from-emerald-500/30 to-teal-500/20 rounded-3xl blur-xl opacity-70" />

              <div className="relative rounded-2xl bg-[#0b1c14] border border-[#1f4c37] p-6 shadow-2xl backdrop-blur-sm">
                {/* Profile Image with mask & border */}
                <div className="relative w-full aspect-square rounded-xl overflow-hidden mb-5 border border-[#1a402e] group">
                  <img
                    src={profile.photoUrl}
                    alt={profile.displayName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0b1c14] via-transparent to-transparent opacity-50" />
                </div>

                {/* Quick Info Box */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-bold text-white">{profile.displayName}</h2>
                      <p className="text-xs text-emerald-300/70">Multidisciplinary Creator</p>
                    </div>
                    <span className="px-2.5 py-1 text-[11px] font-bold bg-[#143324] text-emerald-300 rounded-lg border border-[#22553c]">
                      Verified Pro
                    </span>
                  </div>

                  <div className="pt-2.5 border-t border-[#163928] flex items-center justify-between text-xs text-emerald-200/70">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                      UI/UX • 3D • Motion
                    </span>
                    <a
                      href="#projects"
                      className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-semibold"
                    >
                      Portofolio <ArrowRight className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
