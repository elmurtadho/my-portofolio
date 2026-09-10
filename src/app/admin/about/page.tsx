"use client";

import React, { useState, useEffect } from "react";
import {
  FileText,
  Save,
  RefreshCw,
  Plus,
  Trash2,
  Eye,
  Award,
  Clock,
  Layers,
  UploadCloud,
  Sparkles,
  Crop,
  Trash,
} from "lucide-react";
import { AdminFeedback, AdminFeedbackState } from "@/components/admin/AdminFeedback";
import { uploadMediaFile } from "@/lib/client/upload";
import ImageCropModal from "@/components/admin/ImageCropModal";
import {
  adminFetch,
  getLocalCache,
  setLocalCache,
  syncSectionToServer,
  CACHE_KEYS,
} from "@/lib/client/admin-api";

export default function AdminAboutPage() {
  const MOCK_ABOUT_DATA = {
    bio: "Saya adalah seorang desainer dan pengembang kreatif dengan spesialisasi dalam merancang antarmuka digital yang intuitif, visual branding yang kuat, serta pengalaman web 3D yang imersif. Memadukan estetika modern Dark Mint Green dengan performa kode kelas dunia untuk membantu brand dan klien mewujudkan visi digital mereka.",
    experienceYears: 5,
    completedProjects: 42,
    imageUrl: "",
    highlightPoints: [
      "Desain Antarmuka UI/UX Berbasis Data & Design System Komprehensif",
      "Spesialis Visual 3D WebGL & Interaktivitas Real-Time Three.js",
      "Produksi Video Kreatif, Motion Graphic, & Sinematografi Digital",
      "Identitas Brand & Graphic Design Berkualitas Tinggi untuk Startup Global",
    ],
  };

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [imageToCrop, setImageToCrop] = useState("");
  const [feedback, setFeedback] = useState<AdminFeedbackState | null>(null);
  const [invalidFields, setInvalidFields] = useState<string[]>([]);

  const [formData, setFormData] = useState(() =>
    getLocalCache(CACHE_KEYS.ABOUT, MOCK_ABOUT_DATA)
  );

  const [newHighlightInput, setNewHighlightInput] = useState("");

  const handleLoadMockData = () => {
    setFormData(MOCK_ABOUT_DATA);
    setLocalCache(CACHE_KEYS.ABOUT, MOCK_ABOUT_DATA);
    syncSectionToServer("about", MOCK_ABOUT_DATA);
    setInvalidFields([]);
    setFeedback({
      type: "success",
      message: "Data Tentang Saya tiruan default berhasil dimuat ke formulir!",
    });
    setTimeout(() => setFeedback(null), 3500);
  };

  const fetchAbout = async () => {
    setLoading(true);
    setFeedback(null);
    try {
      const res = await adminFetch("/api/admin/about");
      if (res.ok && res.data?.success && res.data?.data) {
        const d = res.data.data;
        const merged = {
          bio: d.bio || MOCK_ABOUT_DATA.bio,
          experienceYears: Number(d.experienceYears) || MOCK_ABOUT_DATA.experienceYears,
          completedProjects: Number(d.completedProjects) || MOCK_ABOUT_DATA.completedProjects,
          imageUrl: d.imageUrl ?? "",
          highlightPoints:
            Array.isArray(d.highlightPoints) && d.highlightPoints.length > 0
              ? d.highlightPoints
              : MOCK_ABOUT_DATA.highlightPoints,
        };
        setFormData(merged);
        setLocalCache(CACHE_KEYS.ABOUT, merged);
      } else {
        const cached = getLocalCache(CACHE_KEYS.ABOUT, MOCK_ABOUT_DATA);
        setFormData(cached);
      }
    } catch {
      const cached = getLocalCache(CACHE_KEYS.ABOUT, MOCK_ABOUT_DATA);
      setFormData(cached);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAbout();
  }, []);

  const handleAddHighlight = () => {
    const trimmed = newHighlightInput.trim();
    if (!trimmed) return;
    if (formData.highlightPoints.includes(trimmed)) return;
    setFormData((prev) => ({
      ...prev,
      highlightPoints: [...prev.highlightPoints, trimmed],
    }));
    setNewHighlightInput("");
    setInvalidFields((prev) => prev.filter((f) => f !== "highlightPoints"));
  };

  const handleRemoveHighlight = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      highlightPoints: prev.highlightPoints.filter((_, i) => i !== index),
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    setFeedback(null);

    const result = await uploadMediaFile(file, { maxSizeMB: 10 });
    if (result.success && result.url) {
      setFormData((prev) => ({
        ...prev,
        imageUrl: result.url!,
      }));
      setInvalidFields((prev) => prev.filter((f) => f !== "imageUrl"));
      setImageToCrop(result.url!);
      setCropModalOpen(true);
      setFeedback({
        type: "success",
        message: `Foto "${file.name}" berhasil diunggah! Anda dapat menyesuaikan skala dan framing sebelum menyimpan.`,
      });
      setTimeout(() => setFeedback(null), 5000);
    } else {
      setFeedback({
        type: "error",
        message: result.error || "Gagal mengunggah gambar.",
      });
    }
    setUploadingImage(false);
    e.target.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    // Validation for "Belum Lengkap"
    const missing: { key: string; label: string }[] = [];
    if (!formData.bio.trim()) missing.push({ key: "bio", label: "Biografi Naratif Lengkap" });
    if (formData.experienceYears === undefined || formData.experienceYears < 0) {
      missing.push({ key: "experienceYears", label: "Tahun Pengalaman (angka >= 0)" });
    }
    if (formData.completedProjects === undefined || formData.completedProjects < 0) {
      missing.push({ key: "completedProjects", label: "Jumlah Karya Selesai (angka >= 0)" });
    }
    if (!formData.highlightPoints || formData.highlightPoints.length === 0) {
      missing.push({ key: "highlightPoints", label: "Poin-poin Sorotan Keahlian (minimal 1)" });
    }

    if (missing.length > 0) {
      setInvalidFields(missing.map((m) => m.key));
      setFeedback({
        type: "warning",
        message: "Formulir Tentang Saya belum lengkap. Harap lengkapi bidang berikut:",
        details: missing.map((m) => `${m.label} wajib diisi.`),
      });
      return;
    }

    setInvalidFields([]);
    setSaving(true);

    const payload = {
      ...formData,
      experienceYears: Number(formData.experienceYears),
      completedProjects: Number(formData.completedProjects),
    };

    // Save to local cache immediately
    setLocalCache(CACHE_KEYS.ABOUT, payload);
    syncSectionToServer("about", payload);

    try {
      const res = await adminFetch("/api/admin/about", {
        method: "PUT",
        body: JSON.stringify(payload),
      });

      if (res.ok && res.data?.success) {
        setFeedback({
          type: "success",
          message: "Informasi Tentang Saya berhasil disimpan dan diperbarui di portofolio!",
        });
        setTimeout(() => setFeedback(null), 4500);
      } else {
        setFeedback({
          type: "warning",
          message: "Data tersimpan di penyimpanan lokal, sedang mencoba sinkronisasi server.",
        });
      }
    } catch {
      setFeedback({
        type: "warning",
        message: "Data berhasil disimpan di browser Anda.",
      });
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
            <FileText className="w-6 h-6 text-emerald-400" />
            <span>Kelola Bagian Tentang Saya (About Me)</span>
          </h2>
          <p className="text-xs sm:text-sm text-emerald-400/60 mt-1">
            Sesuaikan biografi naratif, pengalaman bertahun-tahun, jumlah proyek, dan poin sorotan
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
            onClick={fetchAbout}
            disabled={loading}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#0e271b] hover:bg-[#153827] text-emerald-300 text-xs font-semibold border border-emerald-500/20 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Segarkan</span>
          </button>
        </div>
      </div>

      {/* Unified Feedback Alerts */}
      <AdminFeedback feedback={feedback} onClose={() => setFeedback(null)} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Container */}
        <div className="lg:col-span-2">
          <form
            onSubmit={handleSubmit}
            className="p-6 sm:p-8 rounded-2xl bg-[#091b12]/90 border border-[#163826] shadow-xl shadow-black/30 space-y-6"
          >
            {/* Bio Narrative */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-emerald-200 flex items-center justify-between">
                <span>Biografi Naratif Lengkap</span>
                {invalidFields.includes("bio") && (
                  <span className="text-[10px] text-amber-400 font-normal">Wajib diisi</span>
                )}
              </label>
              <textarea
                rows={6}
                value={formData.bio}
                onChange={(e) => {
                  setFormData({ ...formData, bio: e.target.value });
                  if (e.target.value.trim()) setInvalidFields((prev) => prev.filter((f) => f !== "bio"));
                }}
                required
                placeholder="Tuliskan cerita latar belakang, filosofi desain, dan pendekatan teknis Anda..."
                className={`w-full px-4 py-3 rounded-xl bg-[#06120b] text-white text-sm focus:outline-none transition leading-relaxed placeholder-emerald-900 ${
                  invalidFields.includes("bio")
                    ? "border-2 border-amber-500 ring-1 ring-amber-500/50"
                    : "border border-[#173a27] focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/30"
                }`}
              />
            </div>

            {/* Metrics: Experience & Projects */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-emerald-200 flex items-center justify-between">
                  <span>Tahun Pengalaman (Tahun)</span>
                  {invalidFields.includes("experienceYears") && (
                    <span className="text-[10px] text-amber-400 font-normal">Harus angka &gt;= 0</span>
                  )}
                </label>
                <input
                  type="number"
                  min={0}
                  value={formData.experienceYears}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      experienceYears: Number(e.target.value),
                    });
                    setInvalidFields((prev) => prev.filter((f) => f !== "experienceYears"));
                  }}
                  required
                  className={`w-full px-4 py-2.5 rounded-xl bg-[#06120b] text-white text-sm focus:outline-none transition ${
                    invalidFields.includes("experienceYears")
                      ? "border-2 border-amber-500 ring-1 ring-amber-500/50"
                      : "border border-[#173a27] focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/30"
                  }`}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-emerald-200 flex items-center justify-between">
                  <span>Total Proyek Selesai</span>
                  {invalidFields.includes("completedProjects") && (
                    <span className="text-[10px] text-amber-400 font-normal">Harus angka &gt;= 0</span>
                  )}
                </label>
                <input
                  type="number"
                  min={0}
                  value={formData.completedProjects}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      completedProjects: Number(e.target.value),
                    });
                    setInvalidFields((prev) => prev.filter((f) => f !== "completedProjects"));
                  }}
                  required
                  className={`w-full px-4 py-2.5 rounded-xl bg-[#06120b] text-white text-sm focus:outline-none transition ${
                    invalidFields.includes("completedProjects")
                      ? "border-2 border-amber-500 ring-1 ring-amber-500/50"
                      : "border border-[#173a27] focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/30"
                  }`}
                />
              </div>
            </div>

            {/* Image URL & Direct Upload */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-emerald-200 flex items-center justify-between">
                <span>Gambar / Foto Section Tentang</span>
                {invalidFields.includes("imageUrl") && (
                  <span className="text-[10px] text-amber-400 font-normal">Wajib diisi / diunggah</span>
                )}
              </label>
              <div
                className={`flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-xl bg-[#06120b] transition ${
                  invalidFields.includes("imageUrl")
                    ? "border-2 border-amber-500/80"
                    : "border border-[#173a27]"
                }`}
              >
                <div className="w-16 h-16 rounded-2xl bg-[#0a1e14] border border-emerald-500/30 overflow-hidden flex items-center justify-center shrink-0 relative">
                  {formData.imageUrl ? (
                    <img
                      src={formData.imageUrl}
                      alt="About"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = "none";
                      }}
                    />
                  ) : (
                    <FileText className="w-8 h-8 text-emerald-500/40" />
                  )}
                  {uploadingImage && (
                    <div className="absolute inset-0 bg-black/70 flex items-center justify-center backdrop-blur-xs">
                      <RefreshCw className="w-5 h-5 text-emerald-400 animate-spin" />
                    </div>
                  )}
                </div>

                <div className="flex-1 w-full space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={formData.imageUrl}
                      onChange={(e) => {
                        setFormData({ ...formData, imageUrl: e.target.value });
                        if (e.target.value.trim()) setInvalidFields((prev) => prev.filter((f) => f !== "imageUrl"));
                      }}
                      placeholder="https://... atau data:image/..."
                      className="flex-1 px-4 py-2 rounded-xl bg-[#081810] border border-[#173a27] text-white text-xs font-mono focus:outline-none focus:border-emerald-400 transition"
                    />
                    <label
                      className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition flex items-center gap-1.5 shrink-0 ${
                        uploadingImage
                          ? "bg-emerald-950 text-emerald-400 border-emerald-500/40 cursor-wait opacity-80"
                          : "bg-[#0e271b] hover:bg-[#153827] text-emerald-300 border-emerald-500/30 cursor-pointer"
                      }`}
                    >
                      {uploadingImage ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                          <span>Mengunggah...</span>
                        </>
                      ) : (
                        <>
                          <UploadCloud className="w-3.5 h-3.5" />
                          <span>Unggah Gambar</span>
                        </>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        disabled={uploadingImage}
                        className="hidden"
                        onChange={handleImageUpload}
                      />
                    </label>

                    {formData.imageUrl && (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            setImageToCrop(formData.imageUrl);
                            setCropModalOpen(true);
                          }}
                          className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5 transition shrink-0"
                          title="Sesuaikan zoom, rotasi, dan geser posisi foto"
                        >
                          <Crop className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Atur Skala Foto</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setFormData((prev) => ({ ...prev, imageUrl: "" }));
                            setFeedback({
                              type: "success",
                              message: "Foto berhasil dikosongkan. Tampilan akan menggunakan kartu visual portofolio.",
                            });
                          }}
                          className="p-2 rounded-xl text-xs font-semibold bg-rose-950/40 hover:bg-rose-950 text-rose-400 border border-rose-900/50 transition shrink-0"
                          title="Hapus foto"
                        >
                          <Trash className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                  <p className="text-[10px] text-emerald-500/60">
                    Format gambar: JPG, PNG, WebP, SVG (Maks. 10MB). Tekan &quot;Atur Skala Foto&quot; untuk zoom dan geser posisi foto.
                  </p>
                </div>
              </div>
            </div>


            {/* Highlight Points */}
            <div className="space-y-2.5 pt-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-emerald-200">
                  Poin-poin Sorotan Keahlian
                </label>
                <span className="text-[11px] text-emerald-400/60">
                  {formData.highlightPoints.length} poin aktif
                </span>
              </div>

              {/* Items List */}
              <div
                className={`space-y-2 p-3 rounded-xl bg-[#06120b] transition ${
                  invalidFields.includes("highlightPoints")
                    ? "border-2 border-amber-500 ring-1 ring-amber-500/50"
                    : "border border-[#173a27]"
                }`}
              >
                {formData.highlightPoints.length === 0 && (
                  <span className="text-xs text-emerald-600/70 italic py-1 block">
                    Belum ada poin sorotan. Tambahkan di bawah.
                  </span>
                )}
                {formData.highlightPoints.map((point, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-[#0a1e14] border border-[#173826] text-xs text-emerald-200"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      <span>{point}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveHighlight(idx)}
                      className="text-emerald-400/60 hover:text-rose-400 transition"
                      aria-label="Hapus poin"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add highlight input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newHighlightInput}
                  onChange={(e) => setNewHighlightInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddHighlight();
                    }
                  }}
                  placeholder="Ketik poin sorotan (misal: Spesialis WebGL & Interaktivitas Three.js) lalu Enter..."
                  className="flex-1 px-4 py-2 rounded-xl bg-[#06120b] border border-[#173a27] text-white text-xs focus:outline-none focus:border-emerald-400 transition"
                />
                <button
                  type="button"
                  onClick={handleAddHighlight}
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
          <div className="p-6 rounded-2xl bg-[#081810]/90 border border-[#163826] space-y-5 sticky top-24">
            <div className="flex items-center justify-between pb-3 border-b border-[#143423]">
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-2">
                <Eye className="w-3.5 h-3.5" />
                <span>Pratinjau Live About</span>
              </span>
              <span className="text-[10px] uppercase font-semibold text-emerald-400/50">
                Preview
              </span>
            </div>

            {/* Metric counters */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-[#06120b] border border-[#163826] text-center">
                <span className="text-2xl font-black text-emerald-400">
                  {formData.experienceYears}+
                </span>
                <span className="block text-[11px] text-emerald-300/70 mt-0.5">
                  Tahun Pengalaman
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-[#06120b] border border-[#163826] text-center">
                <span className="text-2xl font-black text-teal-400">
                  {formData.completedProjects}+
                </span>
                <span className="block text-[11px] text-emerald-300/70 mt-0.5">
                  Proyek Selesai
                </span>
              </div>
            </div>

            {/* Bio snippet */}
            <div>
              <span className="text-[11px] text-emerald-500/60 block mb-1">
                Biografi Publik:
              </span>
              <p className="text-xs text-emerald-200/80 leading-relaxed line-clamp-5">
                {formData.bio || "Biografi belum diisi..."}
              </p>
            </div>

            {/* Highlights preview */}
            <div className="space-y-1.5 pt-2 border-t border-[#143423]">
              <span className="text-[11px] text-emerald-500/60 block">
                Poin Sorotan ({formData.highlightPoints.length}):
              </span>
              <div className="space-y-1">
                {formData.highlightPoints.slice(0, 3).map((pt, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 text-[11px] text-emerald-300/80"
                  >
                    <span className="w-1 h-1 rounded-full bg-emerald-400" />
                    <span className="truncate">{pt}</span>
                  </div>
                ))}
                {formData.highlightPoints.length > 3 && (
                  <span className="text-[10px] text-emerald-500 italic block">
                    +{formData.highlightPoints.length - 3} poin lainnya
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Scale & Crop Modal for About Photo */}
      <ImageCropModal
        isOpen={cropModalOpen}
        imageSrc={imageToCrop}
        onClose={() => setCropModalOpen(false)}
        onSave={(croppedDataUrl) => {
          setFormData((prev) => ({ ...prev, imageUrl: croppedDataUrl }));
          setFeedback({
            type: "success",
            message: "Skala dan framing foto Tentang Saya berhasil disesuaikan! Jangan lupa klik 'Simpan Perubahan' di bawah formulir.",
          });
        }}
        aspectRatio="portrait"
        title="Sesuaikan Skala & Framing Foto Tentang Saya"
      />
    </div>
  );
}

