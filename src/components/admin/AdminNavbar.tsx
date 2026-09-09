"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, ExternalLink, ShieldCheck, Sparkles, LogOut } from "lucide-react";

interface AdminNavbarProps {
  onToggleSidebar: () => void;
}

const PAGE_TITLES: Record<string, { title: string; subtitle: string }> = {
  "/admin": {
    title: "Dashboard Overview",
    subtitle: "Ringkasan statistik dan aktivitas portofolio",
  },
  "/admin/profile": {
    title: "Pengaturan Profil & Hero",
    subtitle: "Ubah nama, peran keahlian, status, dan sapaan utama",
  },
  "/admin/about": {
    title: "Kelola Tentang Saya",
    subtitle: "Edit biografi, tahun pengalaman, dan statistik proyek",
  },
  "/admin/skills": {
    title: "Kelola Keahlian & Tools",
    subtitle: "Tambah, ubah, atau atur persentase skill dan kategori",
  },
  "/admin/projects": {
    title: "Kelola Hasil Karya & Galeri",
    subtitle: "Unggah karya UI/UX, Graphic Design, Video, dan Model 3D",
  },
  "/admin/categories": {
    title: "Kelola Kategori Hasil Karya",
    subtitle: "Atur kelompok navigasi filter karya (Graphic Design, UI/UX, Video, 3D)",
  },
  "/admin/media": {

    title: "Pustaka Media & Model 3D",
    subtitle: "Daftar file asset, gambar, video, dan model WebGL yang terunggah",
  },
  "/admin/inquiries": {
    title: "Pesan Masuk Pengunjung",
    subtitle: "Kelola pesan dan tawaran kerja sama dari formulir kontak",
  },
  "/admin/contact": {
    title: "Pengaturan Kontak & Media Sosial",
    subtitle: "Atur alamat email, nomor telepon, lokasi, dan tautan sosial",
  },
  "/admin/settings": {
    title: "Keamanan Akun Admin",
    subtitle: "Ubah kata sandi dan pengaturan keamanan sesi",
  },
};

export function AdminNavbar({ onToggleSidebar }: AdminNavbarProps) {
  const pathname = usePathname();
  const current = PAGE_TITLES[pathname] || {
    title: "Panel Admin",
    subtitle: "Manajemen Konten Portofolio",
  };

  return (
    <header className="sticky top-0 z-30 h-18 bg-[#07140e]/85 backdrop-blur-md border-b border-[#143222] px-4 sm:px-6 flex items-center justify-between">
      {/* Left side: Hamburger & Title */}
      <div className="flex items-center gap-3 sm:gap-4">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-xl text-emerald-400 hover:text-white bg-[#0a1e14] hover:bg-[#102d1f] border border-emerald-500/20 lg:hidden transition-colors"
          aria-label="Toggle Sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-base sm:text-lg font-bold text-white tracking-tight leading-tight">
            {current.title}
          </h1>
          <p className="text-xs text-emerald-400/60 hidden sm:block">
            {current.subtitle}
          </p>
        </div>
      </div>

      {/* Right side: Status and Live Preview button */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Status Pill */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0b2116] border border-emerald-500/20 text-xs font-medium text-emerald-300">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Sistem Aktif</span>
        </div>

        {/* Live Site Shortcut */}
        <Link
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500/20 to-teal-500/20 hover:from-emerald-500/30 hover:to-teal-500/30 text-emerald-300 hover:text-emerald-200 border border-emerald-500/30 text-xs font-semibold transition-all shadow-sm shadow-emerald-950"
        >
          <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
          <span className="hidden sm:inline">Lihat Web</span>
        </Link>

        {/* Quick Logout Button */}
        <Link
          href="/admin/logout"
          className="p-1.5 sm:px-3 sm:py-1.5 rounded-xl text-rose-300/80 hover:text-rose-200 hover:bg-rose-950/40 border border-rose-900/30 text-xs font-medium transition flex items-center gap-1.5"
          title="Keluar dari Panel Admin"
        >
          <LogOut className="w-4 h-4 text-rose-400" />
          <span className="hidden sm:inline">Keluar</span>
        </Link>
      </div>
    </header>
  );
}
