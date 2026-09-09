"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import {
  ProfileData,
  AboutData,
  SkillItem,
  CategoryItem,
  ProjectItem,
  ContactData,
  initialProfile,
  initialAbout,
  initialSkills,
  initialCategories,
  initialProjects,
  initialContact,
} from "@/lib/mock-data";

interface PortfolioContextType {
  profile: ProfileData;
  about: AboutData;
  skills: SkillItem[];
  categories: CategoryItem[];
  projects: ProjectItem[];
  contact: ContactData;
  updateProfile: (data: Partial<ProfileData>) => void;
  updateAbout: (data: Partial<AboutData>) => void;
  updateContact: (data: Partial<ContactData>) => void;
  setSkills: React.Dispatch<React.SetStateAction<SkillItem[]>>;
  setProjects: React.Dispatch<React.SetStateAction<ProjectItem[]>>;
  setCategories: React.Dispatch<React.SetStateAction<CategoryItem[]>>;
  refreshContent: () => Promise<void>;
}

const PortfolioContext = createContext<PortfolioContextType | undefined>(undefined);

export function PortfolioProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<ProfileData>(initialProfile);
  const [about, setAbout] = useState<AboutData>(initialAbout);
  const [skills, setSkills] = useState<SkillItem[]>(initialSkills);
  const [categories, setCategories] = useState<CategoryItem[]>(initialCategories);
  const [projects, setProjects] = useState<ProjectItem[]>(initialProjects);
  const [contact, setContact] = useState<ContactData>(initialContact);

  const refreshContent = async () => {
    try {
      const res = await fetch("/api/content", { cache: "no-store" });
      const json = await res.json();
      if (res.ok && json.success && json.data) {
        const { profile: p, about: a, skills: s, categories: c, projects: pr, contact: ct } = json.data;
        if (p) setProfile((prev) => ({ ...prev, ...p }));
        if (a) setAbout((prev) => ({ ...prev, ...a }));
        if (Array.isArray(s) && s.length > 0) setSkills(s);
        if (Array.isArray(c) && c.length > 0) setCategories(c);
        if (Array.isArray(pr) && pr.length > 0) setProjects(pr);
        if (ct) setContact((prev) => ({ ...prev, ...ct }));
      }
    } catch (err) {
      console.warn("Could not fetch latest content from API, using fallback data.", err);
    }
  };

  useEffect(() => {
    refreshContent();
  }, []);

  const updateProfile = (data: Partial<ProfileData>) => {
    setProfile((prev) => ({ ...prev, ...data }));
  };

  const updateAbout = (data: Partial<AboutData>) => {
    setAbout((prev) => ({ ...prev, ...data }));
  };

  const updateContact = (data: Partial<ContactData>) => {
    setContact((prev) => ({ ...prev, ...data }));
  };

  return (
    <PortfolioContext.Provider
      value={{
        profile,
        about,
        skills,
        categories,
        projects,
        contact,
        updateProfile,
        updateAbout,
        updateContact,
        setSkills,
        setProjects,
        setCategories,
        refreshContent,
      }}
    >
      {children}
    </PortfolioContext.Provider>
  );
}

export function usePortfolio() {
  const context = useContext(PortfolioContext);
  if (!context) {
    throw new Error("usePortfolio must be used within a PortfolioProvider");
  }
  return context;
}
