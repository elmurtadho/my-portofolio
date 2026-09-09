"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  FolderOpen,
  Plus,
  Edit2,
  Trash2,
  Save,
  X,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  Layers,
  ArrowRight,
  Sparkles,
} from "lucide-react";

interface CategoryItem {
  id: number;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  order?: number;
}

const MOCK_CATEGORIES_DATA: CategoryItem[] = [
  {
    id: 1,
    name: "Graphic Design",
    slug: "graphic-design",
    description: "Desain visual branding, identitas korporat, poster digital, dan ilustrasi modern.",
    icon: "Layers",
  },
  {
    id: 2,
    name: "UI/UX Design",
    slug: "ui-ux",
    description: "Perancangan user experience aplikasi web dan mobile dengan design system interaktif.",
    icon: "LayoutGrid",
  },
  {
    id: 3,
    name: "Video Editor",
    slug: "video-editor",
    description: "Penyuntingan video sinematik, motion graphics, animasi visual, dan reel promosi.",
    icon: "Video",
  },
  {
    id: 4,
    name: "3D Modeling",
    slug: "3d-modeling",
    description: "Pemodelan objek 3D interaktif berbasis Three.js, visualisasi arsitektur, dan aset WebGL.",
    icon: "Box",
  },
];

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [projectsCount, setProjectsCount] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
  });

  const handleLoadMockCategories = () => {
    setCategories(MOCK_CATEGORIES_DATA);
    setFeedback({
      type: "success",
      message: "Data 4 kategori karya tiruan (Graphic Design, UI/UX, Video, 3D) berhasil dimuat!",
    });
    setTimeout(() => setFeedback(null), 3500);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [catRes, projRes] = await Promise.all([
        fetch("/api/admin/categories"),
        fetch("/api/admin/projects"),
      ]);

      const catData = await catRes.json();
      const projData = await projRes.json();

      if (catRes.ok && catData.success && Array.isArray(catData.data) && catData.data.length > 0) {
        setCategories(catData.data);
      } else {
        setCategories(MOCK_CATEGORIES_DATA);
      }

      if (projRes.ok && projData.success && Array.isArray(projData.data)) {
        const counts: Record<string, number> = {};
        projData.data.forEach((p: any) => {
          counts[p.categorySlug] = (counts[p.categorySlug] || 0) + 1;
        });
        setProjectsCount(counts);
      }
    } catch {
      setCategories(MOCK_CATEGORIES_DATA);
      setFeedback({
        type: "error",
        message: "Gagal memuat kategori dari server, memuat kategori tiruan.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const autoGenerateSlug = (name: string) => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const openAddModal = () => {
    setEditingCategory(null);
    setFormData({
      name: "",
      slug: "",
      description: "",
    });
    setModalOpen(true);
  };

  const openEditModal = (cat: CategoryItem) => {
    setEditingCategory(cat);
    setFormData({
      name: cat.name,
      slug: cat.slug,
      description: cat.description || "",
    });
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);

    const payload = {
      name: formData.name.trim(),
      slug: formData.slug.trim().toLowerCase(),
      description: formData.description.trim(),
    };

    try {
      if (editingCategory) {
        const res = await fetch(`/api/admin/categories/${editingCategory.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setFeedback({
            type: "success",
            message: `Kategori "${payload.name}" berhasil diperbarui.`,
          });
          setModalOpen(false);
          fetchData();
        } else {
          setFeedback({
            type: "error",
            message: data.error || "Gagal memperbarui kategori.",
          });
        }
      } else {
        const res = await fetch("/api/admin/categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setFeedback({
            type: "success",
            message: `Kategori "${payload.name}" berhasil ditambahkan.`,
          });
          setModalOpen(false);
          fetchData();
        } else {
          setFeedback({
            type: "error",
            message: data.error || "Gagal menambahkan kategori.",
          });
        }
      }
    } catch {
      setFeedback({
        type: "error",
        message: "Terjadi kesalahan saat menyimpan kategori.",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number, name: string, slug: string) => {
    const assignedCount = projectsCount[slug] || 0;
    const warning =
      assignedCount > 0
        ? `\nPerhatian: Ada ${assignedCount} karya yang menggunakan kategori ini.`
        : "";

    if (
      !confirm(
        `Apakah Anda yakin ingin menghapus kategori "${name}"?${warning}`
      )
    ) {
      return;
    }

    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/categories/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setFeedback({
          type: "success",
          message: `Kategori "${name}" berhasil dihapus.`,
        });
        setCategories((prev) => prev.filter((c) => c.id !== id));
      } else {
        setFeedback({
          type: "error",
          message: data.error || "Gagal menghapus kategori.",
        });
      }
    } catch {
      setFeedback({
        type: "error",
        message: "Terjadi kesalahan saat menghapus kategori.",
      });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#143423]">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <FolderOpen className="w-6 h-6 text-emerald-400" />
            <span>Kelola Kategori Hasil Karya</span>
          </h2>
          <p className="text-xs sm:text-sm text-emerald-400/60 mt-1">
            Atur tab navigasi filter galeri portofolio (Graphic Design, UI/UX, Video Editor, 3D Modeling)
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
          <button
            type="button"
            onClick={handleLoadMockCategories}
            className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30 transition"
            title="Muat data kategori tiruan default"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Muat Kategori Tiruan</span>
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
            <span>Tambah Kategori</span>
          </button>
        </div>
      </div>

      {/* Feedback Alerts */}
      {feedback && (
        <div
          className={`p-4 rounded-2xl text-xs sm:text-sm flex items-center gap-3 animate-in fade-in ${
            feedback.type === "success"
              ? "bg-emerald-950/70 border border-emerald-500/60 text-emerald-300"
              : "bg-rose-950/70 border border-rose-600/60 text-rose-300"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-full py-16 text-center text-emerald-400/60 text-xs">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-400" />
            <span>Memuat data kategori...</span>
          </div>
        ) : categories.length === 0 ? (
          <div className="col-span-full py-16 text-center rounded-2xl bg-[#081810] border border-[#143423] p-8">
            <FolderOpen className="w-10 h-10 text-emerald-500/30 mx-auto mb-3" />
            <h4 className="text-sm font-bold text-white">Belum ada kategori karya</h4>
            <p className="text-xs text-emerald-400/60 mt-1">
              Tambahkan kategori baru untuk mengelompokkan portofolio.
            </p>
          </div>
        ) : (
          categories.map((cat) => {
            const count = projectsCount[cat.slug] || 0;

            return (
              <div
                key={cat.id}
                className="p-6 rounded-2xl bg-[#091b12]/90 border border-[#163826] hover:border-emerald-500/30 transition-all flex flex-col justify-between group shadow-lg shadow-black/20"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-300">
                      <FolderOpen className="w-5 h-5" />
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => openEditModal(cat)}
                        className="p-1.5 rounded-lg bg-[#0e271b] hover:bg-[#153827] text-emerald-300 hover:text-white transition"
                        aria-label="Edit"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(cat.id, cat.name, cat.slug)}
                        disabled={deletingId === cat.id}
                        className="p-1.5 rounded-lg bg-rose-950/30 hover:bg-rose-950/70 text-rose-400 hover:text-rose-300 transition disabled:opacity-50"
                        aria-label="Hapus"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors">
                      {cat.name}
                    </h3>
                    <p className="text-xs font-mono text-emerald-400/60 mt-0.5">
                      slug: {cat.slug}
                    </p>
                  </div>

                  <p className="text-xs text-emerald-200/70 leading-relaxed line-clamp-2">
                    {cat.description || "Tidak ada deskripsi kategori."}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-[#143423] flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 text-xs text-emerald-300 font-medium">
                    <Briefcase className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{count} Karya</span>
                  </span>

                  <Link
                    href={`/admin/projects?category=${cat.slug}`}
                    className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
                  >
                    <span>Lihat Karya</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal Add / Edit */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="w-full max-w-lg bg-[#081810] border border-[#18422d] rounded-3xl p-6 sm:p-7 shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-[#153826]">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FolderOpen className="w-5 h-5 text-emerald-400" />
                <span>
                  {editingCategory ? "Edit Kategori" : "Tambah Kategori Baru"}
                </span>
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-lg text-emerald-400 hover:text-white hover:bg-[#123021]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-emerald-200">
                  Nama Kategori
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    setFormData({
                      ...formData,
                      name,
                      slug: editingCategory ? formData.slug : autoGenerateSlug(name),
                    });
                  }}
                  required
                  placeholder="Misal: Graphic Design, 3D Modeling..."
                  className="w-full px-4 py-2.5 rounded-xl bg-[#050e08] border border-[#173a27] text-white text-sm focus:outline-none focus:border-emerald-400 transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-emerald-200">
                  Slug URL (Identifier Kategori)
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      slug: autoGenerateSlug(e.target.value),
                    })
                  }
                  required
                  placeholder="graphic-design, 3d-modeling..."
                  className="w-full px-4 py-2.5 rounded-xl bg-[#050e08] border border-[#173a27] text-white text-sm font-mono text-xs focus:outline-none focus:border-emerald-400 transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-emerald-200">
                  Deskripsi Singkat
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Deskripsi singkat jenis karya dalam kategori ini..."
                  className="w-full px-4 py-2.5 rounded-xl bg-[#050e08] border border-[#173a27] text-white text-sm focus:outline-none focus:border-emerald-400 transition leading-relaxed"
                />
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
