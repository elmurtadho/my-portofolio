"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Sparkles, Shield } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
        document.documentElement.scrollHeight - 70
      ) {
        setActiveSection("contact");
        return;
      }

      // Check which section is in view
      for (const section of sections) {
        const el = document.getElementById(section);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 220 && rect.bottom > 220) {
            setActiveSection(section);
            break;
          }
        }
      }
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

  const scrollToSection = (
    e: React.MouseEvent<HTMLAnchorElement>,
    sectionId: string
  ) => {
    e.preventDefault();
    setActiveSection(sectionId);
    setIsOpen(false);
    const el = document.getElementById(sectionId);
    if (el) {
      const yOffset = -75; // navbar height offset
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
      window.history.pushState(null, "", `#${sectionId}`);
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#070f0b]/90 backdrop-blur-xl border-b border-[#183427] shadow-lg shadow-black/40 py-2.5 sm:py-3"
          : "bg-transparent py-3.5 sm:py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Brand Logo - Compact & Designer Styled */}
          <Link
            href="/"
            className="flex items-center gap-2 sm:gap-2.5 group relative select-none shrink-0"
          >
            {/* Ambient Logo Glow */}
            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/20 via-teal-400/15 to-emerald-500/20 rounded-2xl blur-md opacity-30 group-hover:opacity-80 transition-opacity duration-500 pointer-events-none" />

            {/* Emblem Icon */}
            <div className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-emerald-400 via-teal-400 to-emerald-500 p-[1.5px] shadow-md shadow-emerald-500/20 group-hover:shadow-emerald-500/40 group-hover:scale-105 transition-all duration-300 flex items-center justify-center overflow-hidden shrink-0">
              <div className="w-full h-full bg-[#081710] rounded-[9.5px] flex items-center justify-center relative overflow-hidden">
                {/* Diagonal light sweep inside emblem */}
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/35 to-transparent -skew-x-25 animate-shimmer-sweep pointer-events-none" />
                <span className="font-designer font-black text-base sm:text-lg bg-gradient-to-br from-emerald-300 to-teal-400 bg-clip-text text-transparent group-hover:scale-110 transition-transform">
                  E
                </span>
                <Sparkles className="w-2 h-2 text-emerald-300 absolute top-1 right-1 opacity-80 animate-pulse" />
              </div>
            </div>

            {/* Compact Brand Typography (Stacked to eliminate wide stretching) */}
            <div className="flex flex-col justify-center leading-none">
              <span className="font-designer font-extrabold text-[15px] sm:text-[17px] text-white tracking-tight group-hover:text-emerald-50 transition-colors drop-shadow-[0_2px_8px_rgba(0,0,0,0.4)]">
                Elmurtadho
              </span>

              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="font-designer text-[10px] sm:text-[11px] font-bold tracking-[0.14em] uppercase bg-gradient-to-r from-emerald-400 via-teal-200 to-emerald-400 bg-clip-text text-transparent animate-text-luster">
                  Portfolio
                </span>
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400 shadow-[0_0_6px_#34d399]"></span>
                </span>
              </div>
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
                  onClick={(e) => scrollToSection(e, link.href.substring(1))}
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

          {/* Desktop Right Action buttons */}
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
              onClick={(e) => scrollToSection(e, "contact")}
              className="relative inline-flex items-center justify-center px-5 py-2 text-sm font-semibold text-emerald-950 bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-400 hover:from-emerald-300 hover:to-teal-300 rounded-xl shadow-md shadow-emerald-500/20 hover:shadow-emerald-500/50 hover:scale-[1.03] active:scale-[0.98] transition-all duration-200 cursor-pointer"
            >
              Hubungi Saya
            </a>
          </div>

          {/* Mobile Hamburger Toggle Button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="w-10 h-10 flex items-center justify-center text-emerald-200 hover:text-white rounded-xl bg-[#0f241a] border border-[#1b3e2c] active:scale-95 transition shadow-sm"
              aria-label="Buka Menu"
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="md:hidden bg-[#07130d]/95 backdrop-blur-2xl border-b border-[#183a29] px-4 pt-3 pb-6 mt-2 shadow-2xl shadow-black/80 max-h-[calc(100vh-5rem)] overflow-y-auto"
          >
            <div className="flex flex-col gap-1.5">
              {navLinks.map((link) => {
                const isActive = activeSection === link.href.substring(1);
                return (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={(e) => scrollToSection(e, link.href.substring(1))}
                    className={`px-4 py-3 text-sm font-medium rounded-xl transition-all flex items-center justify-between ${
                      isActive
                        ? "bg-[#133524] text-emerald-300 font-bold border-l-4 border-emerald-400 shadow-sm"
                        : "text-emerald-100/80 hover:text-emerald-300 hover:bg-[#10291d]"
                    }`}
                  >
                    <span>{link.label}</span>
                    {isActive && (
                      <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
                    )}
                  </a>
                );
              })}

              <div className="pt-3 mt-1 border-t border-[#163324] flex flex-col gap-2.5">
                <a
                  href="#contact"
                  onClick={(e) => scrollToSection(e, "contact")}
                  className="w-full text-center py-3 font-semibold text-sm text-emerald-950 bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400 hover:from-emerald-300 hover:to-teal-200 active:scale-[0.99] rounded-xl shadow-md shadow-emerald-500/20 transition cursor-pointer"
                >
                  Hubungi Saya
                </a>

                {/* Secret admin access in drawer */}
                <div className="flex items-center justify-center pt-1">
                  <Link
                    href="/selfcrudcontent"
                    onClick={() => setIsOpen(false)}
                    className="inline-flex items-center gap-1.5 text-xs text-emerald-400/40 hover:text-emerald-300 py-1 transition"
                  >
                    <Shield className="w-3.5 h-3.5" />
                    <span>Portal Admin</span>
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

