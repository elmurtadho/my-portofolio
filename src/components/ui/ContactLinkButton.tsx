"use client";

import React from "react";
import { motion } from "framer-motion";
import { ExternalLink, Globe, Mail, Phone, MessageSquare } from "lucide-react";

interface ContactLinkButtonProps {
  platform: string;
  url: string;
  label?: string;
  className?: string;
}

export function ContactLinkButton({
  platform,
  url,
  label,
  className = "",
}: ContactLinkButtonProps) {
  const getIcon = (plat: string) => {
    const p = plat.toLowerCase();
    if (p.includes("github")) {
      return (
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
          <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
        </svg>
      );
    }
    if (p.includes("linkedin")) {
      return (
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
        </svg>
      );
    }
    if (p.includes("instagram")) {
      return (
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
        </svg>
      );
    }
    if (p.includes("dribbble")) {
      return (
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
          <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm9.849 10.74c-.382-.034-2.585-.213-5.048.796-.134-.308-.277-.614-.428-.916a20.08 20.08 0 004.858-2.613c.319.789.522 1.636.618 2.733zM12 2.182c2.611 0 4.975 1.018 6.727 2.673a17.915 17.915 0 01-4.48 2.378 40.548 40.548 0 00-3.693-4.664c.465-.253.94-.387 1.446-.387zm-3.435 1.34c.942 1.312 2.196 2.87 3.535 4.417-2.627.798-5.352.884-6.059.887a9.833 9.833 0 012.524-5.304zm-6.383 8.478c.01-.005 1.258-.016 4.382-.824.238.487.48.974.726 1.455-4.474 1.353-6.069 4.14-6.19 4.358a9.836 9.836 0 011.082-4.989zm3.018 6.444c.484-.792 2.21-3.23 6.353-4.498.922 2.457 1.309 4.792 1.42 5.568a9.814 9.814 0 01-7.773-1.07zm10.024 1.38c-.147-.942-.56-3.08-1.428-5.385 2.232-.977 4.155-.838 4.498-.813a9.82 9.82 0 01-3.07 6.198z" />
        </svg>
      );
    }
    if (p.includes("twitter") || p.includes("x.com")) {
      return (
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      );
    }
    if (p.includes("whatsapp")) {
      return (
        <MessageSquare className="w-5 h-5 text-emerald-400" />
      );
    }
    if (p.includes("email")) {
      return <Mail className="w-5 h-5 text-emerald-400" />;
    }
    return <Globe className="w-5 h-5 text-emerald-400" />;
  };

  return (
    <motion.a
      href={url}
      target="_blank"
      rel="noreferrer"
      whileHover={{ y: -3, scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      className={`group relative flex items-center justify-between p-4 rounded-2xl bg-[#0b1c14] border border-[#1b4330] hover:border-emerald-400/80 hover:bg-[#10291e] shadow-lg hover:shadow-[0_0_20px_rgba(52,211,153,0.25)] transition-all duration-300 ${className}`}
    >
      <div className="flex items-center gap-3.5">
        <div className="w-10 h-10 rounded-xl bg-[#133023] border border-[#1f4e37] flex items-center justify-center text-emerald-300 group-hover:text-white group-hover:bg-emerald-500/20 group-hover:border-emerald-400/60 transition-colors">
          {getIcon(platform)}
        </div>
        <div>
          <h4 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">
            {platform}
          </h4>
          <p className="text-xs text-emerald-300/60">
            {label || `Kunjungi profil ${platform}`}
          </p>
        </div>
      </div>

      <div className="w-8 h-8 rounded-lg bg-[#0e241a] border border-[#183a29] flex items-center justify-center text-emerald-400 group-hover:text-white group-hover:border-emerald-400/50 group-hover:bg-[#163c2a] transition-all">
        <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
      </div>
    </motion.a>
  );
}
