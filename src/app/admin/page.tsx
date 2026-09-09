"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Briefcase,
  Sparkles,
  Mail,
  User,
  ExternalLink,
  ArrowRight,
  TrendingUp,
  FolderOpen,
  CheckCircle2,
  Clock,
  RefreshCw,
  Eye,
} from "lucide-react";

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{
    profile?: any;
    about?: any;
    skills?: any[];
    categories?: any[];
    projects?: any[];
    contact?: any;
    inquiries?: any[];
  }>({});

  const fetchData = async () => {
    setLoading(true);
    try {
      const [contentRes, inquiriesRes] = await Promise.all([
        fetch("/api/content"),
        fetch("/api/admin/inquiries"),
      ]);

      const contentData = contentRes.ok ? await contentRes.json() : null;
      const inquiriesData = inquiriesRes.ok ? await inquiriesRes.json() : null;

      setData({
        ...(contentData?.data || {}),
        inquiries: inquiriesData?.data || [],
      });
    } catch {
      // fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const totalProjects = data.projects?.length || 0;
  const totalSkills = data.skills?.length || 0;
  const totalInquiries = data.inquiries?.length || 0;
  const unreadInquiries = data.inquiries?.filter((i) => !i.read).length || 0;

  const statCards = [
    {
      label: "Total Karya Portofolio",
      value: totalProjects,
      description: "Desain, UI/UX, Video & 3D",
      icon: Briefcase,
      color: "from-emerald-500 to-teal-600",
      href: "/admin/projects",
    },
    {
      label: "Keahlian & Tools",
      value: totalSkills,
      description: "Bahasa, framework & software",
      icon: Sparkles,
      color: "from-teal-500 to-cyan-600",
      href: "/admin/skills",
    },
    {
      label: "Pesan Masuk",
      value: totalInquiries,
      subValue: unreadInquiries > 0 ? `${unreadInquiries} baru` : "Semua dibaca",
      description: "Pesan formulir kontak",
      icon: Mail,
      color: "from-emerald-400 to-green-600",
      href: "/admin/inquiries",
    },
    {
      label: "Kategori Karya",
      value: data.categories?.length || 4,
      description: "Graphic, UI/UX, Video, 3D",
      icon: FolderOpen,
      color: "from-emerald-600 to-teal-800",
      href: "/admin/projects",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0d281a] via-[#091f14] to-[#06140d] border border-emerald-500/20 p-6 sm:p-8 shadow-xl shadow-black/40">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>MintFolio Control Center</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Selamat Datang, {data.profile?.displayName || "Creator"}!
            </h2>
            <p className="text-emerald-300/70 text-sm max-w-xl leading-relaxed">
              Kelola seluruh konten portofolio mulai dari profil, biografi, skill,
              galeri karya multidisiplin (desain, video, 3D), hingga pesan pengunjung tanpa perlu mengubah kode sumber.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={fetchData}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0e271b] hover:bg-[#153827] text-emerald-300 text-xs font-semibold border border-emerald-500/20 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              <span>Segarkan Data</span>
            </button>

            <Link
              href="/"
              target="_blank"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-emerald-950 text-xs font-bold shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.02]"
            >
              <Eye className="w-4 h-4" />
              <span>Buka Live Web</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {statCards.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <Link
              key={idx}
              href={stat.href}
              className="group p-5 rounded-2xl bg-[#091b12]/80 hover:bg-[#0d251a] border border-[#143423] hover:border-emerald-500/30 transition-all duration-200 flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-medium text-emerald-400/80">
                  {stat.label}
                </span>
                <div
                  className={`w-9 h-9 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-emerald-950 font-bold shadow-md shadow-emerald-500/10 group-hover:scale-110 transition-transform`}
                >
                  <Icon className="w-4 h-4" />
                </div>
              </div>

              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-white tracking-tight">
                    {loading ? "..." : stat.value}
                  </span>
                  {stat.subValue && (
                    <span className="text-xs font-semibold text-emerald-400">
                      ({stat.subValue})
                    </span>
                  )}
                </div>
                <p className="text-xs text-emerald-400/50 mt-1">
                  {stat.description}
                </p>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Edit Sections */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-[#081810]/90 border border-[#143423] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#143423]">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Akses Cepat Pengelolaan Bagian</span>
            </h3>
            <span className="text-xs text-emerald-400/60">Pilih bagian untuk diedit</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <Link
              href="/admin/profile"
              className="p-4 rounded-xl bg-[#0c2217] hover:bg-[#123021] border border-emerald-500/10 hover:border-emerald-500/30 transition-all group flex items-start gap-3.5"
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-black transition-colors">
                <User className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-white group-hover:text-emerald-300 transition-colors">
                  Profil & Hero
                </h4>
                <p className="text-xs text-emerald-400/60 truncate">
                  Nama, sapaan typewriter, tagline & status
                </p>
              </div>
              <ArrowRight className="w-4 h-4 text-emerald-500/50 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
            </Link>

            <Link
              href="/admin/projects"
              className="p-4 rounded-xl bg-[#0c2217] hover:bg-[#123021] border border-emerald-500/10 hover:border-emerald-500/30 transition-all group flex items-start gap-3.5"
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-black transition-colors">
                <Briefcase className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-white group-hover:text-emerald-300 transition-colors">
                  Hasil Karya & Galeri
                </h4>
                <p className="text-xs text-emerald-400/60 truncate">
                  Upload visual desain, video, dan file 3D WebGL
                </p>
              </div>
              <ArrowRight className="w-4 h-4 text-emerald-500/50 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
            </Link>

            <Link
              href="/admin/skills"
              className="p-4 rounded-xl bg-[#0c2217] hover:bg-[#123021] border border-emerald-500/10 hover:border-emerald-500/30 transition-all group flex items-start gap-3.5"
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-black transition-colors">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-white group-hover:text-emerald-300 transition-colors">
                  Keahlian (Skills)
                </h4>
                <p className="text-xs text-emerald-400/60 truncate">
                  Tingkat persentase skill dan kategori
                </p>
              </div>
              <ArrowRight className="w-4 h-4 text-emerald-500/50 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
            </Link>

            <Link
              href="/admin/contact"
              className="p-4 rounded-xl bg-[#0c2217] hover:bg-[#123021] border border-emerald-500/10 hover:border-emerald-500/30 transition-all group flex items-start gap-3.5"
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-black transition-colors">
                <Mail className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-white group-hover:text-emerald-300 transition-colors">
                  Kontak & Sosial
                </h4>
                <p className="text-xs text-emerald-400/60 truncate">
                  Email, WhatsApp, LinkedIn, GitHub & lokasi
                </p>
              </div>
              <ArrowRight className="w-4 h-4 text-emerald-500/50 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
            </Link>
          </div>
        </div>

        {/* Live Status & Overview */}
        <div className="p-6 rounded-2xl bg-[#081810]/90 border border-[#143423] space-y-5">
          <h3 className="text-base font-bold text-white flex items-center gap-2 pb-3 border-b border-[#143423]">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Kesehatan Sistem</span>
          </h3>

          <div className="space-y-3.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-emerald-300/70">Database Penyimpanan</span>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
                Tersambung (JSON Atomic)
              </span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-emerald-300/70">Penyimpanan Media</span>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
                /public/uploads (Aktif)
              </span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-emerald-300/70">3D WebGL Viewer</span>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
                Three.js Siap
              </span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-emerald-300/70">Keamanan Sesi</span>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
                HMAC-SHA256 Token
              </span>
            </div>
          </div>

          <div className="pt-2 border-t border-[#143423]">
            <p className="text-xs text-emerald-400/60 leading-relaxed">
              Semua perubahan di panel admin langsung tersinkronisasi ke tampilan
              portofolio publik secara real-time.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
