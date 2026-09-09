"use client";

import React from "react";
import { usePortfolio } from "@/context/PortfolioContext";
import { HeroSection } from "@/components/home/HeroSection";
import { AboutSection } from "@/components/home/AboutSection";
import { SkillsSection } from "@/components/home/SkillsSection";
import { ProjectsSection } from "@/components/home/ProjectsSection";
import { ContactSection } from "@/components/home/ContactSection";
import { ScrollReveal, ScrollProgressBar } from "@/components/ui/ScrollReveal";
import { LoadingScreen } from "@/components/ui/LoadingScreen";

export default function HomePage() {
  const { profile, about, skills, categories, projects, contact } = usePortfolio();

  return (
    <div className="flex flex-col w-full">
      {/* Interactive Opening Loading Screen */}
      <LoadingScreen />

      {/* Top Scroll Indicator */}
      <ScrollProgressBar />

      {/* Hero Section with Scroll Reveal */}
      <ScrollReveal direction="up" distance={20} duration={0.8}>
        <HeroSection profile={profile} />
      </ScrollReveal>

      {/* About Section with Scroll Reveal */}
      <ScrollReveal direction="up" distance={35}>
        <AboutSection about={about} />
      </ScrollReveal>

      {/* Skills Section with Scroll Reveal */}
      <ScrollReveal direction="up" distance={35}>
        <SkillsSection skills={skills} />
      </ScrollReveal>

      {/* Projects Gallery Section with Scroll Reveal */}
      <ScrollReveal direction="up" distance={35}>
        <ProjectsSection
          projects={projects}
          categories={categories}
        />
      </ScrollReveal>

      {/* Contact Section with Scroll Reveal */}
      <ScrollReveal direction="up" distance={35}>
        <ContactSection contact={contact} />
      </ScrollReveal>
    </div>
  );
}
