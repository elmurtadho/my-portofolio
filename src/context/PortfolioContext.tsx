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

import {
  getLocalCache,
  setLocalCache,
  getLocalCacheInfo,
  CACHE_KEYS,
} from "@/lib/client/admin-api";

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
  const [profile, setProfile] = useState<ProfileData>(() =>
    getLocalCache(CACHE_KEYS.PROFILE, initialProfile)
  );
  const [about, setAbout] = useState<AboutData>(() =>
    getLocalCache(CACHE_KEYS.ABOUT, initialAbout)
  );
  const [skills, setSkills] = useState<SkillItem[]>(() =>
    getLocalCache(CACHE_KEYS.SKILLS, initialSkills)
  );
  const [categories, setCategories] = useState<CategoryItem[]>(() =>
    getLocalCache(CACHE_KEYS.CATEGORIES, initialCategories)
  );
  const [projects, setProjects] = useState<ProjectItem[]>(() =>
    getLocalCache(CACHE_KEYS.PROJECTS, initialProjects)
  );
  const [contact, setContact] = useState<ContactData>(() =>
    getLocalCache(CACHE_KEYS.CONTACT, initialContact)
  );

  const refreshContent = async () => {
    // 1. Immediately hydrate from local storage if available
    try {
      if (typeof window !== "undefined") {
        const localP = getLocalCache<Partial<ProfileData> | null>(CACHE_KEYS.PROFILE, null);
        const localA = getLocalCache<Partial<AboutData> | null>(CACHE_KEYS.ABOUT, null);
        const localS = getLocalCache<SkillItem[] | null>(CACHE_KEYS.SKILLS, null);
        const localC = getLocalCache<CategoryItem[] | null>(CACHE_KEYS.CATEGORIES, null);
        const localPr = getLocalCache<ProjectItem[] | null>(CACHE_KEYS.PROJECTS, null);
        const localCt = getLocalCache<Partial<ContactData> | null>(CACHE_KEYS.CONTACT, null);

        if (localP && typeof localP === "object") setProfile((prev) => ({ ...prev, ...localP }));
        if (localA && typeof localA === "object") setAbout((prev) => ({ ...prev, ...localA }));
        if (Array.isArray(localS) && localS.length > 0) setSkills(localS);
        if (Array.isArray(localC) && localC.length > 0) setCategories(localC);
        if (Array.isArray(localPr) && localPr.length > 0) setProjects(localPr);
        if (localCt && typeof localCt === "object") setContact((prev) => ({ ...prev, ...localCt }));
      }
    } catch {
      // ignore
    }

    // 2. Fetch from server (Turso is authoritative)
    try {
      const res = await fetch("/api/content", { cache: "no-store" });
      const json = await res.json();
      if (res.ok && json.success && json.data) {
        const { profile: p, about: a, skills: s, categories: c, projects: pr, contact: ct } = json.data;
        if (p) {
          setProfile((prev) => ({ ...prev, ...p }));
          setLocalCache(CACHE_KEYS.PROFILE, p, false);
        }
        if (a) {
          setAbout((prev) => ({ ...prev, ...a }));
          setLocalCache(CACHE_KEYS.ABOUT, a, false);
        }
        if (Array.isArray(s)) {
          setSkills(s);
          setLocalCache(CACHE_KEYS.SKILLS, s, false);
        }
        if (Array.isArray(c)) {
          setCategories(c);
          setLocalCache(CACHE_KEYS.CATEGORIES, c, false);
        }
        if (Array.isArray(pr)) {
          setProjects(pr);
          setLocalCache(CACHE_KEYS.PROJECTS, pr, false);
        }
        if (ct) {
          setContact((prev) => ({ ...prev, ...ct }));
          setLocalCache(CACHE_KEYS.CONTACT, ct, false);
        }
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
