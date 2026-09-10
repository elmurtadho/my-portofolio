"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Sparkles,
  Plus,
  Edit2,
  Trash2,
  Save,
  X,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Layers,
  Sliders,
  Search,
  Copy,
  Upload,
  Image as ImageIcon,
  Link as LinkIcon,
  Trash,
  Palette,
  Box,
  Video,
  Code2,
  Cpu,
} from "lucide-react";
import AdminFeedback, { AdminFeedbackState } from "@/components/admin/AdminFeedback";
import { uploadMediaFile } from "@/lib/client/upload";
import { initialSkills } from "@/lib/mock-data";
import {
  adminFetch,
  getLocalCache,
  setLocalCache,
  syncSectionToServer,
  CACHE_KEYS,
} from "@/lib/client/admin-api";

interface SkillItem {
  id: number;
  name: string;
  level: number;
  category: string;
  icon?: string;
  order?: number;
}

export const DEFAULT_CATEGORIES = [
  "Semua",
  "UI/UX",
  "Design",
  "3D",
  "Video",
  "Tech",
];

const QUICK_LOGO_PRESETS = [
  { name: "Figma", url: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/figma/figma-original.svg" },
  { name: "Blender", url: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/blender/blender-original.svg" },
  { name: "Three.js", url: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/threejs/threejs-original.svg" },
  { name: "React", url: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg" },
  { name: "Next.js", url: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nextjs/nextjs-original.svg" },
  { name: "Tailwind", url: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/tailwindcss/tailwindcss-original.svg" },
  { name: "Photoshop", url: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/photoshop/photoshop-plain.svg" },
  { name: "After Effects", url: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/aftereffects/aftereffects-plain.svg" },
  { name: "Premiere", url: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/premierepro/premierepro-plain.svg" },
  { name: "Illustrator", url: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/illustrator/illustrator-plain.svg" },
];

function renderAdminSkillIcon(icon?: string, fallbackCategory?: string) {
  if (icon && (icon.startsWith("/") || icon.startsWith("http") || icon.startsWith("data:image/"))) {
    return (
      <img
        src={icon}
        alt="Skill Logo"
        className="w-full h-full object-contain rounded-md"
        onError={(e) => {
          (e.currentTarget as HTMLElement).style.display = "none";
        }}
      />
    );
  }

  switch (fallbackCategory?.toLowerCase()) {
    case "ui/ux":
    case "design & ui/ux":
      return <Layers className="w-5 h-5 text-emerald-400" />;
    case "3d":
    case "3d & creative":
      return <Box className="w-5 h-5 text-cyan-400" />;
    case "video":
    case "video & motion":
      return <Video className="w-5 h-5 text-amber-400" />;
    case "design":
      return <Palette className="w-5 h-5 text-rose-400" />;
    case "tech":
    case "development":
      return <Code2 className="w-5 h-5 text-teal-400" />;
    default:
      return <Sparkles className="w-5 h-5 text-emerald-400" />;
  }
}

export default function AdminSkillsPage() {
  const [skills, setSkills] = useState<SkillItem[]>(() =>
    getLocalCache<SkillItem[]>(CACHE_KEYS.SKILLS, initialSkills)
  );
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [searchQuery, setSearchQuery] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState<SkillItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingIcon, setUploadingIcon] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [feedback, setFeedback] = useState<AdminFeedbackState | null>(null);
  const [invalidFields, setInvalidFields] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    name: "",
    level: 85,
    category: "UI/UX",
    icon: "",
  });

  const handleLoadMockData = () => {
    setSkills(initialSkills);
    setLocalCache(CACHE_KEYS.SKILLS, initialSkills);
    syncSectionToServer("skills", initialSkills);
    setFeedback({
      type: "success",
      message: "Data keahlian standar portofolio berhasil dimuat!",
    });
    setTimeout(() => setFeedback(null), 3500);
  };

  const fetchSkills = async () => {
    setLoading(true);
    try {
      const res = await adminFetch("/api/admin/skills");
      if (res.ok && res.data?.success && Array.isArray(res.data.data)) {
        setSkills(res.data.data);
        setLocalCache(CACHE_KEYS.SKILLS, res.data.data);
      } else {
        const cached = getLocalCache<SkillItem[]>(CACHE_KEYS.SKILLS, []);
        if (cached.length > 0) {
          setSkills(cached);
          syncSectionToServer("skills", cached);
        }
      }
    } catch {
      const cached = getLocalCache<SkillItem[]>(CACHE_KEYS.SKILLS, initialSkills);
      setSkills(cached);
      setFeedback({
        type: "warning",
        message: "Memuat data keahlian dari penyimpanan lokal.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSkills();
  }, []);

  const openAddModal = () => {
    setEditingSkill(null);
    setInvalidFields([]);
    setFeedback(null);
    setFormData({
      name: "",
      level: 85,
      category: "Design & UI/UX",
      icon: "",
    });
    setModalOpen(true);
  };

  const openEditModal = (skill: SkillItem) => {
    setEditingSkill(skill);
    setInvalidFields([]);
    setFeedback(null);
    setFormData({
      name: skill.name,
      level: skill.level,
      category: skill.category,
      icon: skill.icon || "",
    });
    setModalOpen(true);
  };

  const handleIconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingIcon(true);
    setFeedback(null);

    const result = await uploadMediaFile(file, {
      maxSizeMB: 10,
      allowedExtensions: [".png", ".jpg", ".jpeg", ".webp", ".svg", ".ico"],
    });

    if (result.success && result.url) {
      setFormData((prev) => ({
        ...prev,
        icon: result.url!,
      }));
      setInvalidFields((prev) => prev.filter((f) => f !== "icon"));
      setFeedback({
        type: "success",
        message: `Logo "${file.name}" berhasil diunggah!`,
      });
      setTimeout(() => setFeedback(null), 3000);
    } else {
      setFeedback({
        type: "error",
        message: result.error || "Gagal mengunggah logo.",
      });
    }

    setUploadingIcon(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    // Validation for "Belum Lengkap"
    const missing: { key: string; label: string }[] = [];
    if (!formData.name.trim()) missing.push({ key: "name", label: "Nama Keahlian / Tool" });
    if (!formData.category.trim()) missing.push({ key: "category", label: "Kategori Keahlian" });
    if (formData.level === undefined || formData.level === null || formData.level <= 0 || formData.level > 100) {
      missing.push({ key: "level", label: "Tingkat Penguasaan (1-100%)" });
    }

    if (missing.length > 0) {
      setInvalidFields(missing.map((m) => m.key));
      setFeedback({
        type: "warning",
        message: "Data keahlian belum lengkap. Harap lengkapi bidang wajib:",
        details: missing.map((m) => `${m.label} wajib diisi.`),
      });
      return;
    }

    setInvalidFields([]);
    setSaving(true);

    try {
      if (editingSkill) {
        // Update
        const res = await adminFetch(`/api/admin/skills/${editingSkill.id}`, {
          method: "PUT",
          body: JSON.stringify(formData),
        });
        if (res.ok && res.data?.success) {
          const updatedItem = res.data.data || { ...editingSkill, ...formData };
          const newSkills = skills.map((s) =>
            s.id === editingSkill.id ? updatedItem : s
          );
          setSkills(newSkills);
          setLocalCache(CACHE_KEYS.SKILLS, newSkills);
          syncSectionToServer("skills", newSkills);

          setFeedback({
            type: "success",
            message: `Keahlian "${formData.name}" berhasil diperbarui.`,
          });
          setModalOpen(false);
        } else {
          setFeedback({
            type: "error",
            message: res.error || res.data?.error || "Gagal memperbarui keahlian.",
          });
        }
      } else {
        // Create
        const res = await adminFetch("/api/admin/skills", {
          method: "POST",
          body: JSON.stringify(formData),
        });
        if (res.ok && res.data?.success) {
          const createdItem: SkillItem = res.data.data || {
            ...formData,
            id: Date.now(),
          };
          const newSkills = [...skills, createdItem];
          setSkills(newSkills);
          setLocalCache(CACHE_KEYS.SKILLS, newSkills);
          syncSectionToServer("skills", newSkills);

          setFeedback({
            type: "success",
            message: `Keahlian "${formData.name}" berhasil ditambahkan.`,
          });
          setModalOpen(false);
        } else {
          setFeedback({
            type: "error",
            message: res.error || res.data?.error || "Gagal menambahkan keahlian.",
          });
        }
      }
    } catch {
      setFeedback({
        type: "error",
        message: "Terjadi kesalahan saat menyimpan keahlian.",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus keahlian "${name}"?`)) {
      return;
    }

    setDeletingId(id);
    const newSkills = skills.filter((s) => s.id !== id);
    setSkills(newSkills);
    setLocalCache(CACHE_KEYS.SKILLS, newSkills);
    syncSectionToServer("skills", newSkills);

    try {
      const res = await adminFetch(`/api/admin/skills/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setFeedback({
          type: "success",
          message: `Keahlian "${name}" berhasil dihapus.`,
        });
      } else {
        setFeedback({
          type: "error",
          message: res.error || "Gagal menghapus keahlian dari server.",
        });
      }
    } catch {
      setFeedback({
        type: "error",
        message: "Terjadi kesalahan saat menghapus keahlian.",
      });
    } finally {
      setDeletingId(null);
    }
  };

  const handleDuplicate = async (skill: SkillItem) => {
    const duplicateData = {
      name: `${skill.name} (Copy)`,
      level: skill.level,
      category: skill.category,
      icon: skill.icon,
    };

    const localDuplicate: SkillItem = {
      ...duplicateData,
      id: Date.now(),
    };
    const newSkills = [...skills, localDuplicate];
    setSkills(newSkills);
    setLocalCache(CACHE_KEYS.SKILLS, newSkills);
    syncSectionToServer("skills", newSkills);

    try {
      const res = await adminFetch("/api/admin/skills", {
        method: "POST",
        body: JSON.stringify(duplicateData),
      });
      if (res.ok && res.data?.success) {
        setFeedback({
          type: "success",
          message: `Keahlian "${skill.name}" berhasil diduplikasi.`,
        });
      }
    } catch {
      // already in state
    }
  };

  const filteredSkills = skills.filter((skill) => {

    const matchesCategory =
      selectedCategory === "Semua" || skill.category === selectedCategory;
    const matchesSearch =
      skill.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      skill.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#143423]">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <Sparkles className="w-6 h-6 text-emerald-400" />
            <span>Kelola Keahlian & Tingkat Penguasaan</span>
          </h2>
          <p className="text-xs sm:text-sm text-emerald-400/60 mt-1">
            Atur persentase skill bar, kelompok kategori, dan tools desain/3D
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
          <button
            type="button"
            onClick={handleLoadMockData}
            className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30 transition"
            title="Muat data keahlian tiruan default"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Muat Data Tiruan</span>
          </button>

          <button
            onClick={fetchSkills}
            disabled={loading}
            className="p-2.5 rounded-xl bg-[#0e271b] hover:bg-[#153827] text-emerald-300 border border-emerald-500/20 transition"
            aria-label="Segarkan"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>

          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-emerald-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Skill Baru</span>
          </button>
        </div>
      </div>

      {/* Feedback Alerts */}
      <AdminFeedback feedback={feedback} onClose={() => setFeedback(null)} />

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 sm:pb-0 scrollbar-none">
          {DEFAULT_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? "bg-emerald-500 text-black shadow-md shadow-emerald-500/20 font-bold"
                  : "bg-[#091b12] text-emerald-300/70 hover:text-white hover:bg-[#0e271b] border border-emerald-500/20"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-emerald-500/60 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari keahlian..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#081810] border border-[#163826] text-xs text-white placeholder-emerald-800 focus:outline-none focus:border-emerald-400 transition"
          />
        </div>
      </div>

      {/* Skills Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          <div className="col-span-full py-16 text-center text-emerald-400/60 text-xs">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-400" />
            <span>Memuat data keahlian...</span>
          </div>
        ) : filteredSkills.length === 0 ? (
          <div className="col-span-full py-16 text-center rounded-2xl bg-[#081810] border border-[#143423] p-8">
            <Sparkles className="w-10 h-10 text-emerald-500/30 mx-auto mb-3" />
            <h4 className="text-sm font-bold text-white">Tidak ada keahlian ditemukan</h4>
            <p className="text-xs text-emerald-400/60 mt-1">
              Coba ganti kategori filter atau tambahkan skill baru.
            </p>
          </div>
        ) : (
          filteredSkills.map((skill) => (
            <div
              key={skill.id}
              className="p-5 rounded-2xl bg-[#091b12]/90 border border-[#163826] hover:border-emerald-500/30 transition-all flex flex-col justify-between group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-[#06140d] border border-[#173d2a] flex items-center justify-center flex-shrink-0 p-2 shadow-inner group-hover:border-emerald-400/50 transition-colors overflow-hidden">
                      {renderAdminSkillIcon(skill.icon, skill.category)}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">
                        {skill.name}
                      </h3>
                      <span className="text-[11px] text-emerald-400/60">
                        {skill.category}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleDuplicate(skill)}
                      className="p-1.5 rounded-lg bg-[#0e271b] hover:bg-[#153827] text-emerald-300 hover:text-white transition"
                      title="Duplikasi Keahlian"
                      aria-label="Duplikasi"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => openEditModal(skill)}
                      className="p-1.5 rounded-lg bg-[#0e271b] hover:bg-[#153827] text-emerald-300 hover:text-white transition"
                      title="Edit Keahlian"
                      aria-label="Edit"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(skill.id, skill.name)}
                      disabled={deletingId === skill.id}
                      className="p-1.5 rounded-lg bg-rose-950/30 hover:bg-rose-950/70 text-rose-400 hover:text-rose-300 transition disabled:opacity-50"
                      title="Hapus Keahlian"
                      aria-label="Hapus"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                </div>

                {/* Progress bar preview */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-emerald-400/70 text-[11px]">
                      Tingkat Keahlian
                    </span>
                    <span className="text-emerald-300 font-mono">
                      {skill.level}%
                    </span>
                  </div>
                  <div className="h-2.5 w-full bg-[#050e08] rounded-full overflow-hidden p-0.5 border border-[#143423]">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                      style={{ width: `${skill.level}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Add / Edit */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="w-full max-w-lg bg-[#081810] border border-[#18422d] rounded-3xl p-6 sm:p-7 shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-[#153826]">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-400" />
                <span>{editingSkill ? "Edit Keahlian" : "Tambah Keahlian Baru"}</span>
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-lg text-emerald-400 hover:text-white hover:bg-[#123021]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <AdminFeedback feedback={feedback} onClose={() => setFeedback(null)} />

            <form onSubmit={handleSave} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-emerald-200">
                  Nama Keahlian / Tool
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value });
                    if (invalidFields.includes("name")) {
                      setInvalidFields((prev) => prev.filter((f) => f !== "name"));
                    }
                  }}
                  placeholder="Misal: Figma, Three.js, Blender..."
                  className={`w-full px-4 py-2.5 rounded-xl bg-[#050e08] border text-white text-sm focus:outline-none transition ${
                    invalidFields.includes("name")
                      ? "border-amber-500/80 ring-1 ring-amber-500/50"
                      : "border-[#173a27] focus:border-emerald-400"
                  }`}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-emerald-200">
                  Kategori
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => {
                    setFormData({ ...formData, category: e.target.value });
                    if (invalidFields.includes("category")) {
                      setInvalidFields((prev) => prev.filter((f) => f !== "category"));
                    }
                  }}
                  className={`w-full px-4 py-2.5 rounded-xl bg-[#050e08] border text-white text-sm focus:outline-none transition ${
                    invalidFields.includes("category")
                      ? "border-amber-500/80 ring-1 ring-amber-500/50"
                      : "border-[#173a27] focus:border-emerald-400"
                  }`}
                >
                  <option value="UI/UX">UI/UX (Antarmuka Pengguna & Prototipe)</option>
                  <option value="Design">Desain Grafis (Visual Branding & Ilustrasi)</option>
                  <option value="3D">3D Visual (Modeling, Animasi & WebGL)</option>
                  <option value="Video">Video Motion (Motion Graphic & Editing)</option>
                  <option value="Tech">Teknologi Web (Frontend & Creative Code)</option>
                </select>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-emerald-200">
                    Tingkat Penguasaan (0 - 100%)
                  </label>
                  <span className="text-sm font-bold text-emerald-400 font-mono">
                    {formData.level}%
                  </span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={100}
                  step={5}
                  value={formData.level}
                  onChange={(e) =>
                    setFormData({ ...formData, level: Number(e.target.value) })
                  }
                  className="w-full accent-emerald-400 h-2 bg-[#050e08] rounded-lg cursor-pointer"
                />
                {/* Level Presets */}
                <div className="flex gap-1.5 pt-1">
                  {[60, 75, 80, 85, 90, 95].map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setFormData({ ...formData, level: lvl })}
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold transition ${
                        formData.level === lvl
                          ? "bg-emerald-500 text-black"
                          : "bg-[#0a1e14] text-emerald-400/80 hover:text-white"
                      }`}
                    >
                      {lvl}%
                    </button>
                  ))}
                </div>
              </div>

              {/* Logo / Foto Custom Skill */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-emerald-200 flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Logo / Foto Custom Keahlian</span>
                  </label>
                  <span className="text-[10px] text-emerald-400/60 font-normal">
                    (PNG, SVG, JPG, WebP)
                  </span>
                </div>

                {/* Upload and Preview Card */}
                <div className="p-3.5 rounded-2xl bg-[#050e08] border border-[#173a27] space-y-3">
                  <div className="flex items-center gap-3">
                    {/* Live Preview Box */}
                    <div className="w-14 h-14 rounded-xl bg-[#091b12] border border-[#1c4530] flex items-center justify-center p-2 flex-shrink-0 shadow-inner overflow-hidden relative group">
                      {formData.icon ? (
                        <img
                          src={formData.icon}
                          alt="Preview logo"
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            (e.currentTarget as HTMLElement).style.display = "none";
                          }}
                        />
                      ) : (
                        <Sparkles className="w-6 h-6 text-emerald-500/30" />
                      )}
                    </div>

                    {/* Upload Button & Status */}
                    <div className="flex-1 space-y-1.5">
                      <div className="flex items-center gap-2">
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleIconUpload}
                          accept="image/*,.svg,.png,.jpg,.jpeg,.webp"
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={uploadingIcon}
                          className="px-3 py-1.5 rounded-xl bg-[#112d20] hover:bg-[#18402d] text-emerald-300 hover:text-white border border-[#1f4e37] text-xs font-semibold flex items-center gap-1.5 transition disabled:opacity-50 cursor-pointer shadow-sm"
                        >
                          <Upload className="w-3.5 h-3.5 text-emerald-400" />
                          <span>{uploadingIcon ? "Mengunggah..." : "Unggah Logo dari Perangkat"}</span>
                        </button>

                        {formData.icon && (
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, icon: "" })}
                            className="p-1.5 rounded-xl bg-rose-950/40 hover:bg-rose-950 text-rose-400 border border-rose-900/50 text-xs transition cursor-pointer"
                            title="Hapus logo"
                          >
                            <Trash className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                      <p className="text-[11px] text-emerald-400/50">
                        Pilih berkas dari komputer Anda atau tempel URL logo di bawah.
                      </p>
                    </div>
                  </div>

                  {/* Direct URL input */}
                  <div className="relative">
                    <LinkIcon className="w-3.5 h-3.5 text-emerald-400/50 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={formData.icon}
                      onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                      placeholder="Atau tempel URL gambar/logo: https://... atau /uploads/..."
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#08150e] border border-[#173a27] text-white text-xs placeholder-emerald-400/30 focus:outline-none focus:border-emerald-400 font-mono transition"
                    />
                  </div>

                  {/* Quick Preset Badges */}
                  <div className="space-y-1 pt-1">
                    <span className="text-[10px] text-emerald-400/60 font-semibold block">
                      Pilihan Cepat Logo Populer:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {QUICK_LOGO_PRESETS.map((preset) => (
                        <button
                          key={preset.name}
                          type="button"
                          onClick={() => setFormData({ ...formData, icon: preset.url })}
                          className={`px-2 py-1 rounded-lg text-[10px] font-medium border flex items-center gap-1.5 transition cursor-pointer ${
                            formData.icon === preset.url
                              ? "bg-emerald-500/20 text-emerald-300 border-emerald-400"
                              : "bg-[#0b1d14] text-emerald-400/70 border-[#183928] hover:text-white hover:border-[#22553b]"
                          }`}
                        >
                          <img src={preset.url} alt={preset.name} className="w-3.5 h-3.5 object-contain" />
                          <span>{preset.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>


              <div className="flex justify-end gap-3 pt-4 border-t border-[#153826]">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-emerald-300 hover:text-white bg-[#0e271b] hover:bg-[#153827] transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-emerald-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition hover:scale-[1.02] disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{saving ? "Menyimpan..." : "Simpan"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
