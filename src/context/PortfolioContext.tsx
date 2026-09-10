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

    // 2. Fetch from server, but do not clobber user-edited sections
    try {
      const res = await fetch("/api/content", { cache: "no-store" });
      const json = await res.json();
      if (res.ok && json.success && json.data) {
        const { profile: p, about: a, skills: s, categories: c, projects: pr, contact: ct } = json.data;
        const pInfo = getLocalCacheInfo(CACHE_KEYS.PROFILE);
        const aInfo = getLocalCacheInfo(CACHE_KEYS.ABOUT);
        const sInfo = getLocalCacheInfo(CACHE_KEYS.SKILLS);
        const cInfo = getLocalCacheInfo(CACHE_KEYS.CATEGORIES);
        const prInfo = getLocalCacheInfo(CACHE_KEYS.PROJECTS);
        const ctInfo = getLocalCacheInfo(CACHE_KEYS.CONTACT);

        if (p && !pInfo.userEdited) setProfile((prev) => ({ ...prev, ...p }));
        if (a && !aInfo.userEdited) setAbout((prev) => ({ ...prev, ...a }));
        if (Array.isArray(s) && s.length > 0 && !sInfo.userEdited) setSkills(s);
        if (Array.isArray(c) && c.length > 0 && !cInfo.userEdited) setCategories(c);
        if (Array.isArray(pr) && pr.length > 0 && !prInfo.userEdited) setProjects(pr);
        if (ct && !ctInfo.userEdited) setContact((prev) => ({ ...prev, ...ct }));
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
