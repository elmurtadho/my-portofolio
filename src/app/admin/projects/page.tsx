"use client";

import React, { useState, useEffect } from "react";
import {
  Briefcase,
  Plus,
  Edit2,
  Trash2,
  Save,
  X,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Upload,
  Image as ImageIcon,
  Video,
  Box,
  Star,
  Search,
  ExternalLink,
  Tag,
  LayoutGrid,
  List,
  ArrowUpDown,
  Filter,
  Eye,
  Sparkles,
  Crop,
} from "lucide-react";
import { AdminFeedback, AdminFeedbackState } from "@/components/admin/AdminFeedback";
import { uploadMediaFile } from "@/lib/client/upload";
import ImageCropModal from "@/components/admin/ImageCropModal";
import {
  adminFetch,
  getLocalCache,
  setLocalCache,
  syncSectionToServer,
  mergeOrSyncData,
  CACHE_KEYS,
} from "@/lib/client/admin-api";

interface ProjectItem {
  id: number;
  title: string;
  description: string;
  categorySlug: string;
  mediaType: "image" | "video" | "model3d";
  mediaUrl: string;
  thumbnailUrl: string;
  featured?: boolean;
  tags: string[];
  order?: number;
}

interface CategoryItem {
  id: number;
  name: string;
  slug: string;
}
import { initialProjects, initialCategories } from "@/lib/mock-data";

const MOCK_PROJECTS_DATA: ProjectItem[] = initialProjects;
const MOCK_CATEGORIES_FALLBACK: CategoryItem[] = initialCategories;

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<ProjectItem[]>(() =>
    getLocalCache<ProjectItem[]>(CACHE_KEYS.PROJECTS, initialProjects)
  );
  const [categories, setCategories] = useState<CategoryItem[]>(() =>
    getLocalCache<CategoryItem[]>(CACHE_KEYS.CATEGORIES, initialCategories)
  );
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [sortOption, setSortOption] = useState<"newest" | "oldest" | "alpha" | "featured">("newest");
  const [mediaTypeFilter, setMediaTypeFilter] = useState<string>("all");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<ProjectItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [imageToCrop, setImageToCrop] = useState("");

  const [tagInput, setTagInput] = useState("");
  const [feedback, setFeedback] = useState<AdminFeedbackState | null>(null);
  const [invalidFields, setInvalidFields] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    categorySlug: "ui-ux",
    mediaType: "image" as "image" | "video" | "model3d",
    mediaUrl: "",
    thumbnailUrl: "",
    featured: false,
    tags: [] as string[],
  });

  const handleLoadMockProjects = () => {
    setProjects(MOCK_PROJECTS_DATA);
    setLocalCache(CACHE_KEYS.PROJECTS, MOCK_PROJECTS_DATA, false);
    syncSectionToServer("projects", MOCK_PROJECTS_DATA);
    if (categories.length === 0) {
      setCategories(MOCK_CATEGORIES_FALLBACK);
      setLocalCache(CACHE_KEYS.CATEGORIES, MOCK_CATEGORIES_FALLBACK, false);
      syncSectionToServer("categories", MOCK_CATEGORIES_FALLBACK);
    }
    setFeedback({
      type: "success",
      message: "Data karya tiruan (4 kategori: Gambar, Video, Model 3D WebGL) berhasil dimuat!",
    });
    setTimeout(() => setFeedback(null), 3500);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [projRes, catRes] = await Promise.all([
        adminFetch("/api/admin/projects"),
        adminFetch("/api/admin/categories"),
      ]);

      if (projRes.ok && projRes.data?.success && Array.isArray(projRes.data.data)) {
        setProjects(projRes.data.data);
        setLocalCache(CACHE_KEYS.PROJECTS, projRes.data.data, false);
      } else {
        const cached = getLocalCache<ProjectItem[]>(CACHE_KEYS.PROJECTS, MOCK_PROJECTS_DATA);
        setProjects(cached);
      }

      if (catRes.ok && catRes.data?.success && Array.isArray(catRes.data.data)) {
        setCategories(catRes.data.data);
        setLocalCache(CACHE_KEYS.CATEGORIES, catRes.data.data, false);
      } else {
        const cached = getLocalCache<CategoryItem[]>(CACHE_KEYS.CATEGORIES, MOCK_CATEGORIES_FALLBACK);
        setCategories(cached);
      }
    } catch {
      const cached = getLocalCache<ProjectItem[]>(CACHE_KEYS.PROJECTS, MOCK_PROJECTS_DATA);
      setProjects(cached);
      setCategories(MOCK_CATEGORIES_FALLBACK);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAddModal = () => {
    setEditingProject(null);
    setInvalidFields([]);
    setFeedback(null);
    const defaultCat = categories[0]?.slug || "ui-ux";
    setFormData({
      title: "",
      description: "",
      categorySlug: defaultCat,
      mediaType: "image",
      mediaUrl: "",
      thumbnailUrl: "",
      featured: false,
      tags: [],
    });
    setTagInput("");
    setModalOpen(true);
  };

  const openEditModal = (proj: ProjectItem) => {
    setEditingProject(proj);
    setInvalidFields([]);
    setFeedback(null);
    setFormData({
      title: proj.title,
      description: proj.description || "",
      categorySlug: proj.categorySlug,
      mediaType: proj.mediaType,
      mediaUrl: proj.mediaUrl,
      thumbnailUrl: proj.thumbnailUrl,
      featured: Boolean(proj.featured),
      tags: Array.isArray(proj.tags) ? proj.tags : [],
    });
    setTagInput("");
    setModalOpen(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setFeedback(null);

    const result = await uploadMediaFile(file, { maxSizeMB: 60 });
    if (result.success && result.url) {
      const isImg = result.mediaType === "image";
      setFormData((prev) => ({
        ...prev,
        mediaUrl: result.url!,
        mediaType: result.mediaType || prev.mediaType,
        thumbnailUrl: isImg ? result.url! : prev.thumbnailUrl,
      }));
      setInvalidFields((prev) => prev.filter((f) => f !== "mediaUrl"));

      if (isImg) {
        setImageToCrop(result.url!);
        setCropModalOpen(true);
      }

      setFeedback({
        type: "success",
        message: `Berkas "${file.name}" berhasil diunggah!${isImg ? " Anda dapat menyesuaikan skala dan framing foto." : ""}`,
      });
      setTimeout(() => setFeedback(null), 3500);
    } else {
      setFeedback({
        type: "error",
        message: result.error || "Gagal mengunggah berkas.",
      });
    }
    setUploading(false);
    e.target.value = "";
  };

  const handleAddTag = () => {
    const trimmed = tagInput.trim();
    if (!trimmed) return;
    if (formData.tags.includes(trimmed)) return;
    setFormData((prev) => ({ ...prev, tags: [...prev.tags, trimmed] }));
    setTagInput("");
  };

  const handleRemoveTag = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index),
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    // Validation for "Belum Lengkap"
    const missing: { key: string; label: string }[] = [];
    if (!formData.title.trim()) missing.push({ key: "title", label: "Judul Karya / Proyek" });
    if (!formData.categorySlug) missing.push({ key: "categorySlug", label: "Kategori Bidang Desain" });
    if (!formData.mediaUrl.trim()) missing.push({ key: "mediaUrl", label: "URL Media Utama / Unggah Berkas" });
    if (!formData.description.trim()) missing.push({ key: "description", label: "Deskripsi Karya" });

    if (missing.length > 0) {
      setInvalidFields(missing.map((m) => m.key));
      setFeedback({
        type: "warning",
        message: "Data karya belum lengkap. Harap lengkapi bidang wajib:",
        details: missing.map((m) => `${m.label} wajib diisi.`),
      });
      return;
    }

    setInvalidFields([]);
    setSaving(true);

    const payload = {
      ...formData,
      thumbnailUrl: formData.thumbnailUrl || formData.mediaUrl,
    };

    try {
      if (editingProject) {
        const res = await adminFetch(`/api/admin/projects/${editingProject.id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        if (res.ok && res.data?.success) {
          setFeedback({
            type: "success",
            message: `Karya "${payload.title}" berhasil diperbarui di database Turso!`,
          });
          setModalOpen(false);
          await fetchData();
        } else {
          setFeedback({
            type: "error",
            message: res.error || res.data?.error || "Gagal memperbarui karya.",
          });
        }
      } else {
        const res = await adminFetch("/api/admin/projects", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        if (res.ok && res.data?.success) {
          setFeedback({
            type: "success",
            message: `Karya "${payload.title}" berhasil ditambahkan ke database Turso!`,
          });
          setModalOpen(false);
          await fetchData();
        } else {
          setFeedback({
            type: "error",
            message: res.error || res.data?.error || "Gagal menambahkan karya.",
          });
        }
      }
    } catch {
      setFeedback({
        type: "error",
        message: "Terjadi kesalahan jaringan saat menyimpan karya.",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number, title: string) => {
    if (!confirm(`Hapus karya "${title}" dari portofolio?`)) return;

    setDeletingId(id);
    try {
      const res = await adminFetch(`/api/admin/projects/${id}`, {
        method: "DELETE",
      });
      if (res.ok && res.data?.success) {
        setFeedback({
          type: "success",
          message: `Karya "${title}" berhasil dihapus dari database Turso.`,
        });
        await fetchData();
      } else {
        setFeedback({
          type: "error",
          message: res.error || res.data?.error || "Gagal menghapus karya dari server.",
        });
      }
    } catch {
      setFeedback({
        type: "error",
        message: "Terjadi kesalahan saat menghapus karya.",
      });
    } finally {
      setDeletingId(null);
    }
  };

  const toggleFeatured = async (proj: ProjectItem) => {
    const newFeatured = !proj.featured;
    try {
      const res = await adminFetch(`/api/admin/projects/${proj.id}`, {
        method: "PUT",
        body: JSON.stringify({ featured: newFeatured }),
      });
      if (res.ok && res.data?.success) {
        await fetchData();
      }
    } catch {
      // ignore
    }
  };

  const filteredProjects = projects
    .filter((proj) => {
      const matchesCategory =
        selectedCategory === "all" || proj.categorySlug === selectedCategory;
      const matchesMedia =
        mediaTypeFilter === "all" || proj.mediaType === mediaTypeFilter;
      const matchesSearch =
        proj.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        proj.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        proj.tags?.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesMedia && matchesSearch;
    })
    .sort((a, b) => {
      if (sortOption === "featured") {
        return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
      }
      if (sortOption === "oldest") {
        return a.id - b.id;
      }
      if (sortOption === "alpha") {
        return a.title.localeCompare(b.title);
      }
      return b.id - a.id; // newest first
    });


  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#143423]">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <Briefcase className="w-6 h-6 text-emerald-400" />
            <span>Kelola Data Hasil Karya & Galeri</span>
          </h2>
          <p className="text-xs sm:text-sm text-emerald-400/60 mt-1">
            Tambah, edit, hapus karya desain grafis, UI/UX, video editor, dan model 3D interaktif
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
          <button
            type="button"
            onClick={handleLoadMockProjects}
            className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30 transition"
            title="Muat data karya tiruan lengkap dengan gambar, video, dan model 3D"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Muat Karya & Media Tiruan</span>
          </button>

          <button
            onClick={fetchData}
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
            <span>Tambah Karya Baru</span>
          </button>
        </div>
      </div>

      {/* Feedback Alerts */}
      <AdminFeedback feedback={feedback} onClose={() => setFeedback(null)} />

      {/* Category Tabs and Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 sm:pb-0 scrollbar-none">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === "all"
                ? "bg-emerald-500 text-black shadow-md shadow-emerald-500/20 font-bold"
                : "bg-[#091b12] text-emerald-300/70 hover:text-white hover:bg-[#0e271b] border border-emerald-500/20"
            }`}
          >
            Semua ({projects.length})
          </button>
          {categories.map((cat) => {
            const count = projects.filter((p) => p.categorySlug === cat.slug).length;
            return (
              <button
                key={cat.slug}
                onClick={() => setSelectedCategory(cat.slug)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat.slug
                    ? "bg-emerald-500 text-black shadow-md shadow-emerald-500/20 font-bold"
                    : "bg-[#091b12] text-emerald-300/70 hover:text-white hover:bg-[#0e271b] border border-emerald-500/20"
                }`}
              >
                {cat.name} ({count})
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-emerald-500/60 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari karya / tag..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#081810] border border-[#163826] text-xs text-white placeholder-emerald-800 focus:outline-none focus:border-emerald-400 transition"
          />
        </div>
      </div>

      {/* Secondary Filter & View Controls */}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        {/* Media type pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <span className="text-[11px] font-semibold text-emerald-400/60 mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3" />
            <span>Format:</span>
          </span>
          {[
            { key: "all", label: "Semua Format" },
            { key: "image", label: "Gambar" },
            { key: "video", label: "Video" },
            { key: "model3d", label: "3D Model" },
          ].map((m) => (
            <button
              key={m.key}
              onClick={() => setMediaTypeFilter(m.key)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition ${
                mediaTypeFilter === m.key
                  ? "bg-emerald-500/25 border border-emerald-500/50 text-emerald-300 font-semibold"
                  : "bg-[#081810] text-emerald-400/60 hover:text-white border border-[#143423]"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        {/* Sort & View Mode Switcher */}
        <div className="flex items-center gap-2.5 self-end sm:self-auto">
          <div className="flex items-center gap-1.5">
            <ArrowUpDown className="w-3.5 h-3.5 text-emerald-500/60" />
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value as any)}
              className="px-2.5 py-1 rounded-lg bg-[#081810] border border-[#143423] text-xs text-emerald-300 focus:outline-none focus:border-emerald-400"
            >
              <option value="newest">Terkini</option>
              <option value="oldest">Terlama</option>
              <option value="alpha">Nama (A-Z)</option>
              <option value="featured">Unggulan Pertama</option>
            </select>
          </div>

          <div className="flex items-center bg-[#081810] border border-[#143423] rounded-lg p-0.5">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-md transition ${
                viewMode === "grid"
                  ? "bg-emerald-500 text-black shadow"
                  : "text-emerald-400/60 hover:text-white"
              }`}
              title="Tampilan Grid"
              aria-label="Tampilan Grid"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded-md transition ${
                viewMode === "table"
                  ? "bg-emerald-500 text-black shadow"
                  : "text-emerald-400/60 hover:text-white"
              }`}
              title="Tampilan Tabel"
              aria-label="Tampilan Tabel"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Projects Display: Table or Grid */}
      {viewMode === "table" && !loading && filteredProjects.length > 0 ? (
        <div className="rounded-2xl bg-[#081810] border border-[#163826] overflow-hidden shadow-xl shadow-black/20">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-emerald-200/80">
              <thead className="bg-[#0b2116] border-b border-[#143423] text-[11px] font-semibold text-emerald-400 uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Karya</th>
                  <th className="px-4 py-3">Kategori</th>
                  <th className="px-4 py-3">Media</th>
                  <th className="px-4 py-3">Tags</th>
                  <th className="px-4 py-3 text-center">Unggulan</th>
                  <th className="px-4 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#143423]">
                {filteredProjects.map((proj) => (
                  <tr
                    key={proj.id}
                    className="hover:bg-[#0d281a]/50 transition-colors group"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[#050e08] overflow-hidden shrink-0 border border-[#143423] flex items-center justify-center">
                          {proj.mediaType === "video" ? (
                            <Video className="w-4 h-4 text-emerald-400" />
                          ) : proj.mediaType === "model3d" ? (
                            <Box className="w-4 h-4 text-teal-400" />
                          ) : (
                            <img
                              src={proj.thumbnailUrl || proj.mediaUrl || "/placeholder.jpg"}
                              alt={proj.title}
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-white group-hover:text-emerald-300 transition-colors">
                            {proj.title}
                          </p>
                          <p className="text-[10px] text-emerald-500/60 line-clamp-1 max-w-xs">
                            {proj.description || "Tidak ada deskripsi"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-semibold uppercase">
                        {proj.categorySlug}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-[10px] uppercase text-emerald-300">
                      {proj.mediaType}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {proj.tags?.slice(0, 2).map((t, i) => (
                          <span
                            key={i}
                            className="px-1.5 py-0.5 rounded bg-[#06120b] text-[10px] text-emerald-400/80"
                          >
                            #{t}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => toggleFeatured(proj)}
                        className={`p-1 rounded ${
                          proj.featured ? "text-amber-400" : "text-emerald-500/30 hover:text-amber-400"
                        }`}
                      >
                        <Star className={`w-4 h-4 ${proj.featured ? "fill-amber-400" : ""}`} />
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditModal(proj)}
                          className="p-1.5 rounded-lg bg-[#0e271b] hover:bg-[#153827] text-emerald-300 hover:text-white"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(proj.id, proj.title)}
                          disabled={deletingId === proj.id}
                          className="p-1.5 rounded-lg bg-rose-950/30 hover:bg-rose-950/70 text-rose-400 hover:text-rose-300"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Projects Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

        {loading ? (
          <div className="col-span-full py-16 text-center text-emerald-400/60 text-xs">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-400" />
            <span>Memuat data karya...</span>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="col-span-full py-16 text-center rounded-2xl bg-[#081810] border border-[#143423] p-8">
            <Briefcase className="w-10 h-10 text-emerald-500/30 mx-auto mb-3" />
            <h4 className="text-sm font-bold text-white">Tidak ada karya ditemukan</h4>
            <p className="text-xs text-emerald-400/60 mt-1">
              Tambahkan karya baru untuk kategori ini.
            </p>
          </div>
        ) : (
          filteredProjects.map((proj) => (
            <div
              key={proj.id}
              className="rounded-2xl bg-[#091b12]/90 border border-[#163826] hover:border-emerald-500/30 transition-all overflow-hidden flex flex-col group shadow-lg shadow-black/20"
            >
              {/* Media Preview Box */}
              <div className="relative aspect-video bg-[#050e08] overflow-hidden border-b border-[#143423]">
                {proj.mediaType === "video" ? (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-[#07130b] text-emerald-400/80">
                    <Video className="w-8 h-8 mb-1 text-emerald-400" />
                    <span className="text-[11px] font-semibold">Video Showcase</span>
                  </div>
                ) : proj.mediaType === "model3d" ? (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-[#07130b] text-teal-300">
                    <Box className="w-8 h-8 mb-1 text-teal-400 animate-pulse" />
                    <span className="text-[11px] font-semibold">3D WebGL Model</span>
                  </div>
                ) : (
                  <img
                    src={proj.thumbnailUrl || proj.mediaUrl || "/placeholder.jpg"}
                    alt={proj.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = "none";
                    }}
                  />
                )}

                {/* Media Type Badge */}
                <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md border border-white/10 text-[10px] font-semibold text-emerald-300">
                  {proj.mediaType === "video" ? (
                    <Video className="w-3 h-3 text-emerald-400" />
                  ) : proj.mediaType === "model3d" ? (
                    <Box className="w-3 h-3 text-teal-400" />
                  ) : (
                    <ImageIcon className="w-3 h-3 text-emerald-400" />
                  )}
                  <span className="uppercase">{proj.mediaType}</span>
                </div>

                {/* Featured star toggle */}
                <button
                  type="button"
                  onClick={() => toggleFeatured(proj)}
                  className={`absolute top-3 right-3 p-1.5 rounded-lg backdrop-blur-md transition ${
                    proj.featured
                      ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                      : "bg-black/50 text-white/40 hover:text-amber-300 hover:bg-black/80"
                  }`}
                  aria-label="Tandai Unggulan"
                >
                  <Star
                    className={`w-3.5 h-3.5 ${proj.featured ? "fill-amber-400" : ""}`}
                  />
                </button>
              </div>

              {/* Body Content */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase">
                      {proj.categorySlug}
                    </span>
                    <span className="text-[10px] text-emerald-500/60 font-mono">
                      #{proj.id}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors line-clamp-1">
                    {proj.title}
                  </h3>

                  <p className="text-xs text-emerald-200/70 leading-relaxed line-clamp-2">
                    {proj.description || "Belum ada deskripsi."}
                  </p>

                  {/* Tags */}
                  {proj.tags && proj.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {proj.tags.slice(0, 3).map((tag, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded bg-[#06120b] border border-[#143423] text-[10px] text-emerald-300/80"
                        >
                          #{tag}
                        </span>
                      ))}
                      {proj.tags.length > 3 && (
                        <span className="text-[10px] text-emerald-500/60 self-center">
                          +{proj.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Card Actions */}
                <div className="pt-3 border-t border-[#143423] flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => openEditModal(proj)}
                      className="p-1.5 rounded-lg bg-[#0e271b] hover:bg-[#153827] text-emerald-300 hover:text-white transition"
                      aria-label="Edit"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(proj.id, proj.title)}
                      disabled={deletingId === proj.id}
                      className="p-1.5 rounded-lg bg-rose-950/30 hover:bg-rose-950/70 text-rose-400 hover:text-rose-300 transition disabled:opacity-50"
                      aria-label="Hapus"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {proj.mediaUrl && (
                    <a
                      href={proj.mediaUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 inline-flex items-center gap-1"
                    >
                      <span>Lihat File</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      )}

      {/* Modal Add / Edit */}

      {modalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="w-full max-w-xl bg-[#081810] border border-[#18422d] rounded-3xl p-6 sm:p-8 shadow-2xl my-8 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-[#153826]">
              <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-emerald-400" />
                <span>{editingProject ? "Edit Karya" : "Tambah Karya Baru"}</span>
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
              {/* Title */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-emerald-200">
                  Judul Karya / Proyek
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => {
                    setFormData({ ...formData, title: e.target.value });
                    if (invalidFields.includes("title")) {
                      setInvalidFields((prev) => prev.filter((f) => f !== "title"));
                    }
                  }}
                  placeholder="Misal: Lumina Financial App UI"
                  className={`w-full px-4 py-2.5 rounded-xl bg-[#050e08] border text-white text-sm focus:outline-none transition ${
                    invalidFields.includes("title")
                      ? "border-amber-500/80 ring-1 ring-amber-500/50"
                      : "border-[#173a27] focus:border-emerald-400"
                  }`}
                />
              </div>

              {/* Category & Media Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-emerald-200">
                    Kategori Karya
                  </label>
                  <select
                    value={formData.categorySlug}
                    onChange={(e) => {
                      setFormData({ ...formData, categorySlug: e.target.value });
                      if (invalidFields.includes("categorySlug")) {
                        setInvalidFields((prev) => prev.filter((f) => f !== "categorySlug"));
                      }
                    }}
                    className={`w-full px-4 py-2.5 rounded-xl bg-[#050e08] border text-white text-sm focus:outline-none transition ${
                      invalidFields.includes("categorySlug")
                        ? "border-amber-500/80 ring-1 ring-amber-500/50"
                        : "border-[#173a27] focus:border-emerald-400"
                    }`}
                  >
                    {categories.map((cat) => (
                      <option key={cat.slug} value={cat.slug}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-emerald-200">
                    Tipe Media
                  </label>
                  <select
                    value={formData.mediaType}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        mediaType: e.target.value as any,
                      })
                    }
                    className="w-full px-4 py-2.5 rounded-xl bg-[#050e08] border border-[#173a27] text-white text-sm focus:outline-none focus:border-emerald-400 transition"
                  >
                    <option value="image">Gambar Visual (Image)</option>
                    <option value="video">Video Editor (Video)</option>
                    <option value="model3d">3D Modeling (WebGL/GLB)</option>
                  </select>
                </div>
              </div>

              {/* Upload Direct Button */}
              <div className="p-4 rounded-xl bg-[#050e08] border border-[#173a27] space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-emerald-200 flex items-center gap-1.5">
                    <Upload className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Unggah File Media / Model 3D Langsung</span>
                  </label>
                  {uploading && (
                    <span className="text-[11px] text-emerald-400 font-semibold animate-pulse">
                      Mengunggah file...
                    </span>
                  )}
                </div>
                <input
                  type="file"
                  onChange={handleFileUpload}
                  accept=".png,.jpg,.jpeg,.webp,.svg,.mp4,.webm,.glb,.gltf,.obj"
                  disabled={uploading}
                  className="w-full text-xs text-emerald-300 file:mr-3 file:py-1.5 file:px-3.5 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-emerald-500 file:text-black hover:file:bg-emerald-400 cursor-pointer disabled:opacity-50"
                />
                <p className="text-[10px] text-emerald-500/60">
                  Mendukung gambar (.png, .jpg, .webp), video (.mp4, .webm), dan model 3D WebGL (.glb, .gltf)
                </p>
              </div>

              {/* Media URL & Thumbnail URL */}
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-emerald-200">
                    URL Media Utama (File atau Link Eksternal)
                  </label>
                  <input
                    type="text"
                    value={formData.mediaUrl}
                    onChange={(e) => {
                      setFormData({ ...formData, mediaUrl: e.target.value });
                      if (invalidFields.includes("mediaUrl")) {
                        setInvalidFields((prev) => prev.filter((f) => f !== "mediaUrl"));
                      }
                    }}
                    placeholder="https://... atau /uploads/..."
                    className={`w-full px-4 py-2.5 rounded-xl bg-[#050e08] border text-white text-xs font-mono focus:outline-none transition ${
                      invalidFields.includes("mediaUrl")
                        ? "border-amber-500/80 ring-1 ring-amber-500/50"
                        : "border-[#173a27] focus:border-emerald-400"
                    }`}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-emerald-200">
                    URL Thumbnail Poster (Opsional untuk video/3D)
                  </label>
                  <input
                    type="text"
                    value={formData.thumbnailUrl}
                    onChange={(e) =>
                      setFormData({ ...formData, thumbnailUrl: e.target.value })
                    }
                    placeholder="Kosongkan jika sama dengan URL Media"
                    className="w-full px-4 py-2.5 rounded-xl bg-[#050e08] border border-[#173a27] text-white text-xs font-mono focus:outline-none focus:border-emerald-400 transition"
                  />
                </div>

                {/* Live Media Preview inside Modal */}
                {formData.mediaUrl && (
                  <div className="p-3 rounded-xl bg-[#06120b] border border-[#163826] space-y-2">
                    <span className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5" />
                      <span>Pratinjau Media Terpilih</span>
                    </span>
                    <div className="relative aspect-video max-h-44 rounded-lg overflow-hidden bg-black/40 flex items-center justify-center border border-[#143423]">
                      {formData.mediaType === "image" ? (
                        <img
                          src={formData.mediaUrl}
                          alt="Preview"
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = "none";
                          }}
                        />
                      ) : formData.mediaType === "video" ? (
                        <video
                          src={formData.mediaUrl}
                          controls
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center text-teal-300 p-4">
                          <Box className="w-10 h-10 text-teal-400 mb-1 animate-pulse" />
                          <span className="text-xs font-semibold">Model 3D Siap Dirender WebGL</span>
                          <span className="text-[10px] text-emerald-400/60 font-mono truncate max-w-xs">{formData.mediaUrl}</span>
                        </div>
                      )}
                    </div>
                    {formData.mediaType === "image" && (
                      <div className="pt-2 flex justify-end">
                        <button
                          type="button"
                          onClick={() => {
                            setImageToCrop(formData.mediaUrl);
                            setCropModalOpen(true);
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 text-xs font-semibold border border-emerald-500/30 transition"
                        >
                          <Crop className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Sesuaikan Skala & Framing Foto</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-emerald-200">
                  Deskripsi Karya
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => {
                    setFormData({ ...formData, description: e.target.value });
                    if (invalidFields.includes("description")) {
                      setInvalidFields((prev) => prev.filter((f) => f !== "description"));
                    }
                  }}
                  placeholder="Ceritakan proses pembuatan, konsep, dan tools yang dipakai..."
                  className={`w-full px-4 py-2.5 rounded-xl bg-[#050e08] border text-white text-sm focus:outline-none transition leading-relaxed ${
                    invalidFields.includes("description")
                      ? "border-amber-500/80 ring-1 ring-amber-500/50"
                      : "border-[#173a27] focus:border-emerald-400"
                  }`}
                />
              </div>

              {/* Tags */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-emerald-200">
                  Tags / Kata Kunci
                </label>
                <div className="flex flex-wrap gap-1.5 min-h-[36px] p-2.5 rounded-xl bg-[#050e08] border border-[#173a27]">
                  {formData.tags.map((t, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-medium"
                    >
                      <span>#{t}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(idx)}
                        className="text-emerald-400/60 hover:text-rose-400"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                    placeholder="Ketik tag lalu Enter..."
                    className="flex-1 px-3.5 py-1.5 rounded-xl bg-[#050e08] border border-[#173a27] text-xs text-white focus:outline-none focus:border-emerald-400"
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="px-3.5 py-1.5 rounded-xl bg-[#0e271b] hover:bg-[#153827] text-emerald-300 text-xs font-semibold border border-emerald-500/30"
                  >
                    Tambah Tag
                  </button>
                </div>
              </div>

              {/* Featured Checkbox */}
              <div className="flex items-center gap-2.5 pt-2">
                <input
                  type="checkbox"
                  id="featured"
                  checked={formData.featured}
                  onChange={(e) =>
                    setFormData({ ...formData, featured: e.target.checked })
                  }
                  className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                />
                <label
                  htmlFor="featured"
                  className="text-xs font-semibold text-emerald-200 cursor-pointer flex items-center gap-1.5"
                >
                  <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  <span>Jadikan Karya Unggulan (Featured Project)</span>
                </label>
              </div>

              {/* Submit / Cancel buttons */}
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
                  disabled={saving || uploading}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-emerald-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition hover:scale-[1.02] disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{saving ? "Menyimpan..." : "Simpan Karya"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Interactive Scale & Crop Modal for Project Image */}
      <ImageCropModal
        isOpen={cropModalOpen}
        imageSrc={imageToCrop}
        onClose={() => setCropModalOpen(false)}
        onSave={(croppedDataUrl) => {
          setFormData((prev) => ({
            ...prev,
            mediaUrl: croppedDataUrl,
            thumbnailUrl: croppedDataUrl,
          }));
          setCropModalOpen(false);
          setFeedback({
            type: "success",
            message: "Skala dan framing foto karya berhasil disesuaikan! Klik 'Simpan Karya' untuk menerapkan.",
          });
          setTimeout(() => setFeedback(null), 4000);
        }}
        aspectRatio="square"
        title="Sesuaikan Skala & Framing Foto Karya"
      />
    </div>
  );
}
