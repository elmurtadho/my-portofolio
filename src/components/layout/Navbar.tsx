"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Sparkles, Shield } from "lucide-react";

import { motion } from "framer-motion";

export function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("hero");

  if (pathname?.startsWith("/admin") || pathname?.startsWith("/selfcrudcontent")) {
    return null;
  }

  useEffect(() => {
    const sections = ["hero", "about", "skills", "projects", "contact"];

    const handleScroll = () => {
      setScrolled(window.scrollY > 20);

      // Check if near bottom of page (activate contact)
      if (
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 80
      ) {
        setActiveSection("contact");
        return;
      }

      // Check which section is in view
      let current = "hero";
      for (const section of sections) {
        const el = document.getElementById(section);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 280) {
            current = section;
          }
        }
      }
      setActiveSection(current);
    };

    const handleHash = () => {
      if (typeof window !== "undefined" && window.location.hash) {
        const hash = window.location.hash.replace("#", "");
        if (sections.includes(hash)) {
          setActiveSection(hash);
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("hashchange", handleHash);

    // Initial check
    handleScroll();
    handleHash();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("hashchange", handleHash);
    };
  }, []);

  const navLinks = [
    { label: "Beranda", href: "#hero" },
    { label: "Tentang", href: "#about" },
    { label: "Keahlian", href: "#skills" },
    { label: "Karya", href: "#projects" },
    { label: "Kontak", href: "#contact" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#070f0b]/85 backdrop-blur-lg border-b border-[#183427] shadow-lg shadow-black/40 py-3"
          : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5 group relative select-none">
            {/* Ambient Logo Glow */}
            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/20 via-teal-400/20 to-emerald-500/20 rounded-2xl blur-md opacity-40 group-hover:opacity-90 transition-opacity duration-500 pointer-events-none" />

            {/* Emblem Icon */}
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 via-teal-400 to-emerald-500 p-[1.5px] shadow-lg shadow-emerald-500/25 group-hover:shadow-emerald-500/50 group-hover:scale-105 transition-all duration-300 flex items-center justify-center overflow-hidden">
              <div className="w-full h-full bg-[#081710] rounded-[10.5px] flex items-center justify-center relative overflow-hidden">
                {/* Diagonal light sweep inside emblem */}
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/35 to-transparent -skew-x-25 animate-shimmer-sweep pointer-events-none" />
                <span className="font-designer font-black text-xl bg-gradient-to-br from-emerald-300 to-teal-400 bg-clip-text text-transparent group-hover:scale-110 transition-transform">
                  E
                </span>
                <Sparkles className="w-2.5 h-2.5 text-emerald-300 absolute top-1 right-1 opacity-80 animate-pulse" />
              </div>
            </div>

            {/* Typography Brand with Moving Light Shimmer */}
            <div className="flex flex-col relative overflow-hidden py-0.5 pr-2">
              {/* Moving light shimmer beam sweeping across text */}
              <div
                className="absolute inset-0 w-24 bg-gradient-to-r from-transparent via-white/40 to-transparent -skew-x-25 pointer-events-none animate-shimmer-sweep z-20"
                aria-hidden="true"
              />

              <div className="flex items-center font-designer font-extrabold text-lg sm:text-xl tracking-tight leading-none">
                <span className="text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)] transition-colors group-hover:text-emerald-50">
                  Elmurtadho<span className="text-emerald-300">s</span>
                </span>
                <span className="relative bg-gradient-to-r from-emerald-400 via-teal-200 to-emerald-400 bg-clip-text text-transparent animate-text-luster ml-0.5 drop-shadow-[0_0_15px_rgba(52,211,153,0.4)]">
                  Portfolio
                </span>
                <span className="relative flex h-2 w-2 ml-1.5 self-center">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400 shadow-[0_0_8px_#34d399]"></span>
                </span>
              </div>

              <span className="text-[9px] tracking-[0.22em] text-emerald-300/75 uppercase font-medium mt-1 font-mono">
                Visual &amp; Interactive Studio
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 bg-[#0e1d16]/70 border border-[#1d3d2e]/80 p-1 rounded-full backdrop-blur-md shadow-inner">
            {navLinks.map((link) => {
              const isActive = activeSection === link.href.substring(1);
              return (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => {
                    setActiveSection(link.href.substring(1));
                  }}
                  className={`relative px-4 py-1.5 text-sm font-medium rounded-full transition-colors duration-200 select-none ${
                    isActive
                      ? "text-emerald-950 font-bold"
                      : "text-emerald-100/75 hover:text-emerald-300 hover:bg-[#163024]/40"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeNavPill"
                      className="absolute inset-0 bg-emerald-400 rounded-full shadow-[0_0_15px_rgba(52,211,153,0.5)] z-0"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10">{link.label}</span>
                </a>
              );
            })}
          </nav>

          {/* Right Action buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/selfcrudcontent"
              className="p-2.5 text-emerald-300/35 hover:text-emerald-300 hover:bg-[#142d20] rounded-xl border border-transparent hover:border-[#1e4431] hover:scale-105 active:scale-95 transition-all duration-200"
              title="Portal"
            >
              <Shield className="w-4 h-4" />
            </Link>
            <a
              href="#contact"
              className="relative inline-flex items-center justify-center px-5 py-2 text-sm font-semibold text-emerald-950 bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-400 hover:from-emerald-300 hover:to-teal-300 rounded-xl shadow-md shadow-emerald-500/20 hover:shadow-emerald-500/50 hover:scale-[1.03] active:scale-[0.98] transition-all duration-200 cursor-pointer"
            >
              Hubungi Saya
            </a>
          </div>

          {/* Mobile Hamburger */}
          <div className="flex items-center gap-2 md:hidden">
            <Link
              href="/selfcrudcontent"
              className="p-2 text-emerald-300/35 hover:text-emerald-300"
              title="Portal"
            >
              <Shield className="w-5 h-5" />
            </Link>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-emerald-200 hover:text-white rounded-lg bg-[#11241c] border border-[#1b3a2c] active:scale-95 transition"
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="md:hidden bg-[#0a1610]/95 backdrop-blur-2xl border-b border-[#1d3d2e] px-4 pt-3 pb-6 mt-2 animate-in slide-in-from-top duration-200">
          <div className="flex flex-col gap-2">
            {navLinks.map((link) => {
              const isActive = activeSection === link.href.substring(1);
              return (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => {
                    setActiveSection(link.href.substring(1));
                    setIsOpen(false);
                  }}
                  className={`px-4 py-3 text-base font-medium rounded-xl transition flex items-center justify-between ${
                    isActive
                      ? "bg-[#143324] text-emerald-300 font-bold border-l-4 border-emerald-400"
                      : "text-emerald-100 hover:text-emerald-400 hover:bg-[#12281e]"
                  }`}
                >
                  <span>{link.label}</span>
                  {isActive && <span className="w-2 h-2 rounded-full bg-emerald-400" />}
                </a>
              );
            })}
            <div className="pt-3 border-t border-[#183628] flex flex-col gap-2">
              <a
                href="#contact"
                onClick={() => setIsOpen(false)}
                className="w-full text-center py-3 font-semibold text-emerald-950 bg-emerald-400 hover:bg-emerald-300 active:scale-[0.99] rounded-xl shadow-md transition"
              >
                Hubungi Saya
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

