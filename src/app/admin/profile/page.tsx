"use client";

import React, { useState, useEffect } from "react";
import {
  User,
  Sparkles,
  Save,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  UploadCloud,
  Eye,
} from "lucide-react";

export default function AdminProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    displayName: "",
    greeting: "",
    tagline: "",
    status: "",
    photoUrl: "",
    bio: "",
    roles: [] as string[],
  });

  const [newRoleInput, setNewRoleInput] = useState("");

  const MOCK_PROFILE_DATA = {
    displayName: "Ahmad Elmurtadho",
    greeting: "Halo, Saya",
    tagline:
      "Menggabungkan estetika visual modern, presisi desain interaktif, dan visualisasi 3D WebGL imersif dalam satu karya bernilai tinggi.",
    status: "Tersedia untuk Proyek Baru & Kolaborasi",
    photoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=800",
    bio: "Seorang desainer & pengembang digital interaktif dengan dedikasi lebih dari 5 tahun dalam menciptakan produk web berkinerja tinggi, visual 3D realistis, dan sistem antarmuka responsif bernuansa dark mint green yang elegan.",
    roles: [
      "Creative Technologist",
      "UI/UX Designer",
      "Graphic Designer",
      "Video Motion Editor",
      "3D WebGL Artist",
    ],
  };

  const handleLoadMockData = () => {
    setFormData(MOCK_PROFILE_DATA);
    setSuccessMsg("Data tiruan (demo template) berhasil dimuat ke formulir!");
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const fetchProfile = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/admin/profile");
      const data = await res.json();
      if (res.ok && data.success && data.data) {
        setFormData({
          displayName: data.data.displayName || MOCK_PROFILE_DATA.displayName,
          greeting: data.data.greeting || MOCK_PROFILE_DATA.greeting,
          tagline: data.data.tagline || MOCK_PROFILE_DATA.tagline,
          status: data.data.status || MOCK_PROFILE_DATA.status,
          photoUrl: data.data.photoUrl || MOCK_PROFILE_DATA.photoUrl,
          bio: data.data.bio || MOCK_PROFILE_DATA.bio,
          roles: Array.isArray(data.data.roles) && data.data.roles.length > 0 ? data.data.roles : MOCK_PROFILE_DATA.roles,
        });
      } else {
        setFormData(MOCK_PROFILE_DATA);
      }
    } catch {
      setFormData(MOCK_PROFILE_DATA);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleAddRole = () => {
    const trimmed = newRoleInput.trim();
    if (!trimmed) return;
    if (formData.roles.includes(trimmed)) return;
    setFormData((prev) => ({
      ...prev,
      roles: [...prev.roles, trimmed],
    }));
    setNewRoleInput("");
  };

  const handleRemoveRole = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      roles: prev.roles.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/admin/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMsg("Profil berhasil disimpan dan diperbarui!");
        setTimeout(() => setSuccessMsg(null), 4000);
      } else {
        setErrorMsg(data.error || "Gagal menyimpan perubahan profil.");
      }
    } catch {
      setErrorMsg("Terjadi kesalahan saat menghubungi server.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#143423]">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <User className="w-6 h-6 text-emerald-400" />
            <span>Kelola Profil & Sapaan Hero</span>
          </h2>
          <p className="text-xs sm:text-sm text-emerald-400/60 mt-1">
            Ubah nama, sapaan typewriter, status ketersediaan, dan tagline yang muncul pada halaman utama
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            type="button"
            onClick={handleLoadMockData}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30 transition"
            title="Muat data tiruan demo default"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Muat Data Tiruan</span>
          </button>

          <button
            onClick={fetchProfile}
            disabled={loading}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#0e271b] hover:bg-[#153827] text-emerald-300 text-xs font-semibold border border-emerald-500/20 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Segarkan</span>
          </button>
        </div>
      </div>

      {/* Feedback Alerts */}
      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-950/70 border border-emerald-500/60 text-emerald-300 text-xs sm:text-sm flex items-center gap-3 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-950/70 border border-rose-600/60 text-rose-300 text-xs sm:text-sm flex items-center gap-3 animate-in fade-in">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Container */}
        <div className="lg:col-span-2">
          <form
            onSubmit={handleSubmit}
            className="p-6 sm:p-8 rounded-2xl bg-[#091b12]/90 border border-[#163826] shadow-xl shadow-black/30 space-y-6"
          >
            {/* Display Name & Greeting */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-emerald-200">
                  Nama Lengkap / Tampilan
                </label>
                <input
                  type="text"
                  value={formData.displayName}
                  onChange={(e) =>
                    setFormData({ ...formData, displayName: e.target.value })
                  }
                  required
                  placeholder="Misal: Ahmad Elmurtadho"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#06120b] border border-[#173a27] text-white text-sm focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/30 transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-emerald-200">
                  Sapaan Pembuka (Hero Greeting)
                </label>
                <input
                  type="text"
                  value={formData.greeting}
                  onChange={(e) =>
                    setFormData({ ...formData, greeting: e.target.value })
                  }
                  placeholder="Misal: Halo, Saya"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#06120b] border border-[#173a27] text-white text-sm focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/30 transition"
                />
              </div>
            </div>

            {/* Tagline / Subtitle */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-emerald-200">
                Tagline Utama
              </label>
              <input
                type="text"
                value={formData.tagline}
                onChange={(e) =>
                  setFormData({ ...formData, tagline: e.target.value })
                }
                placeholder="Misal: Menggabungkan estetika visual modern, presisi desain, dan interaktivitas 3D..."
                className="w-full px-4 py-2.5 rounded-xl bg-[#06120b] border border-[#173a27] text-white text-sm focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/30 transition"
              />
            </div>

            {/* Status Ketersediaan */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-emerald-200">
                Status Ketersediaan (Badge)
              </label>
              <input
                type="text"
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value })
                }
                placeholder="Misal: Tersedia untuk Proyek Baru"
                className="w-full px-4 py-2.5 rounded-xl bg-[#06120b] border border-[#173a27] text-white text-sm focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/30 transition"
              />
            </div>

            {/* Photo URL & Direct Upload */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-emerald-200">
                Foto Profil & Avatar
              </label>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-xl bg-[#06120b] border border-[#173a27]">
                {/* Avatar Preview */}
                <div className="w-16 h-16 rounded-2xl bg-[#0a1e14] border border-emerald-500/30 overflow-hidden flex items-center justify-center shrink-0">
                  {formData.photoUrl ? (
                    <img
                      src={formData.photoUrl}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = "none";
                      }}
                    />
                  ) : (
                    <User className="w-8 h-8 text-emerald-500/40" />
                  )}
                </div>

                <div className="flex-1 w-full space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={formData.photoUrl}
                      onChange={(e) =>
                        setFormData({ ...formData, photoUrl: e.target.value })
                      }
                      placeholder="https://... atau /uploads/..."
                      className="flex-1 px-4 py-2 rounded-xl bg-[#081810] border border-[#173a27] text-white text-xs font-mono focus:outline-none focus:border-emerald-400 transition"
                    />
                    <label className="px-3.5 py-2 rounded-xl bg-[#0e271b] hover:bg-[#153827] text-emerald-300 text-xs font-semibold border border-emerald-500/30 transition cursor-pointer flex items-center gap-1.5 shrink-0">
                      <UploadCloud className="w-3.5 h-3.5" />
                      <span>Unggah Foto</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const fd = new FormData();
                          fd.append("file", file);
                          try {
                            const res = await fetch("/api/admin/upload", {
                              method: "POST",
                              body: fd,
                            });
                            const result = await res.json();
                            if (res.ok && result.success) {
                              setFormData((prev) => ({
                                ...prev,
                                photoUrl: result.data.url,
                              }));
                            }
                          } catch {
                            // ignore
                          }
                        }}
                      />
                    </label>
                  </div>
                  <p className="text-[10px] text-emerald-500/60">
                    Format gambar yang didukung: JPG, PNG, WebP, SVG. Maks 10MB.
                  </p>
                </div>
              </div>
            </div>

            {/* Bio Singkat */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-emerald-200">
                Ringkasan Bio / Tentang Singkat (Hero & Footer)
              </label>
              <textarea
                rows={3}
                value={formData.bio}
                onChange={(e) =>
                  setFormData({ ...formData, bio: e.target.value })
                }
                placeholder="Deskripsi singkat kepribadian profesional atau spesialisasi Anda..."
                className="w-full px-4 py-2.5 rounded-xl bg-[#06120b] border border-[#173a27] text-white text-sm focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/30 transition leading-relaxed"
              />
            </div>


            {/* Animated Roles (Typewriter Tags) */}
            <div className="space-y-2.5 pt-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-emerald-200">
                  Daftar Peran Typewriter (Animasi Bergantian)
                </label>
                <span className="text-[11px] text-emerald-400/60">
                  {formData.roles.length} peran terdaftar
                </span>
              </div>

              {/* Tag Badges */}
              <div className="flex flex-wrap gap-2 min-h-[44px] p-3 rounded-xl bg-[#06120b] border border-[#173a27]">
                {formData.roles.length === 0 && (
                  <span className="text-xs text-emerald-600/70 italic py-1">
                    Belum ada peran. Tambahkan di bawah.
                  </span>
                )}
                {formData.roles.map((role, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold"
                  >
                    <span>{role}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveRole(idx)}
                      className="text-emerald-400/60 hover:text-rose-400 transition"
                      aria-label="Hapus peran"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>

              {/* Add Role input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newRoleInput}
                  onChange={(e) => setNewRoleInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddRole();
                    }
                  }}
                  placeholder="Ketik peran baru (misal: UI/UX Designer) lalu Enter..."
                  className="flex-1 px-4 py-2 rounded-xl bg-[#06120b] border border-[#173a27] text-white text-xs focus:outline-none focus:border-emerald-400 transition"
                />
                <button
                  type="button"
                  onClick={handleAddRole}
                  className="px-4 py-2 rounded-xl bg-[#0e271b] hover:bg-[#153827] text-emerald-300 text-xs font-semibold border border-emerald-500/30 transition flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah</span>
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4 border-t border-[#143423] flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-emerald-950 font-bold text-sm shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.02] disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? "Menyimpan..." : "Simpan Perubahan"}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Live Preview Card */}
        <div className="space-y-4">
          <div className="p-6 rounded-2xl bg-[#081810]/90 border border-[#163826] space-y-4 sticky top-24">
            <div className="flex items-center justify-between pb-3 border-b border-[#143423]">
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-2">
                <Eye className="w-3.5 h-3.5" />
                <span>Pratinjau Live Hero</span>
              </span>
              <span className="text-[10px] uppercase font-semibold text-emerald-400/50">
                Preview
              </span>
            </div>

            {/* Status Pill */}
            {formData.status && (
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>{formData.status}</span>
              </div>
            )}

            {/* Greeting & Name */}
            <div>
              <p className="text-xs text-emerald-400/80 font-mono">
                {formData.greeting || "Halo, Saya"}
              </p>
              <h3 className="text-xl font-extrabold text-white tracking-tight mt-1">
                {formData.displayName || "Nama Anda"}
              </h3>
            </div>

            {/* Animated Role Sample */}
            <div className="p-3 rounded-xl bg-[#050e08] border border-[#132c1e]">
              <span className="text-[11px] text-emerald-500/60 block">
                Animasi Typewriter:
              </span>
              <span className="text-sm font-bold text-emerald-300 font-mono">
                {formData.roles[0] || "UI/UX Designer & Creative Technologist"}
              </span>
            </div>

            {/* Tagline */}
            <p className="text-xs text-emerald-200/70 leading-relaxed">
              {formData.tagline ||
                "Menggabungkan estetika visual modern, presisi desain, dan interaktivitas 3D..."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
