"use client";

import React, { useState, useEffect } from "react";
import {
  FolderOpen,
  Upload,
  Trash2,
  Copy,
  Check,
  RefreshCw,
  Image as ImageIcon,
  Video,
  Box,
  ExternalLink,
  Search,
  CheckCircle2,
  AlertCircle,
  File,
} from "lucide-react";
import AdminFeedback, { AdminFeedbackState } from "@/components/admin/AdminFeedback";
import { uploadMediaFile } from "@/lib/client/upload";

interface MediaItem {
  filename: string;
  url: string;
  mediaType: "image" | "video" | "model3d";
  size: number;
  originalName: string;
  createdAt: string;
}

export default function AdminMediaPage() {
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [filterType, setFilterType] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  const [feedback, setFeedback] = useState<AdminFeedbackState | null>(null);

  const fetchMedia = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/upload");
      const data = await res.json();
      if (res.ok && data.success) {
        setMediaList(data.data || []);
      }
    } catch {
      setFeedback({
        type: "error",
        message: "Gagal memuat pustaka media.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setFeedback(null);

    let successCount = 0;
    const errors: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const result = await uploadMediaFile(file, { maxSizeMB: 60 });
      if (result.success) {
        successCount++;
      } else {
        errors.push(`${file.name}: ${result.error || "Gagal mengunggah"}`);
      }
    }

    setUploading(false);
    if (successCount === files.length) {
      setFeedback({
        type: "success",
        message: `${successCount} berkas berhasil diunggah ke pustaka media!`,
      });
      fetchMedia();
    } else if (successCount > 0) {
      setFeedback({
        type: "warning",
        message: `${successCount} dari ${files.length} berkas berhasil diunggah. Terdapat kendala:`,
        details: errors,
      });
      fetchMedia();
    } else {
      setFeedback({
        type: "error",
        message: "Gagal mengunggah berkas ke pustaka media:",
        details: errors,
      });
    }

    e.target.value = "";
  };

  const handleDelete = async (filename: string) => {
    if (!confirm(`Hapus file "${filename}"?`)) return;

    try {
      const res = await fetch(`/api/admin/upload?filename=${encodeURIComponent(filename)}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setMediaList((prev) => prev.filter((m) => m.filename !== filename));
        setFeedback({
          type: "success",
          message: "File media berhasil dihapus.",
        });
        setTimeout(() => setFeedback(null), 3000);
      }
    } catch {
      setFeedback({
        type: "error",
        message: "Gagal menghapus file media.",
      });
    }
  };

  const handleCopy = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const filteredMedia = mediaList.filter((item) => {
    const matchesFilter =
      filterType === "all" || item.mediaType === filterType;
    const matchesSearch =
      item.originalName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.filename.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#143423]">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <FolderOpen className="w-6 h-6 text-emerald-400" />
            <span>Pustaka Media & Model 3D</span>
          </h2>
          <p className="text-xs sm:text-sm text-emerald-400/60 mt-1">
            Pusat penyimpanan aset gambar, video, dan model WebGL 3D yang dapat digunakan di karya portofolio
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchMedia}
            disabled={loading}
            className="p-2.5 rounded-xl bg-[#0e271b] hover:bg-[#153827] text-emerald-300 border border-emerald-500/20 transition"
            aria-label="Segarkan"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>

          <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-emerald-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition hover:scale-[1.02] cursor-pointer">
            <Upload className="w-4 h-4" />
            <span>{uploading ? "Mengunggah..." : "Unggah Media"}</span>
            <input
              type="file"
              multiple
              onChange={handleUpload}
              disabled={uploading}
              className="hidden"
              accept=".png,.jpg,.jpeg,.webp,.svg,.mp4,.webm,.glb,.gltf,.obj"
            />
          </label>
        </div>
      </div>

      {/* Feedback Alerts */}
      <AdminFeedback feedback={feedback} onClose={() => setFeedback(null)} />

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Type Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 sm:pb-0 scrollbar-none">
          {[
            { key: "all", label: "Semua File" },
            { key: "image", label: "Gambar" },
            { key: "video", label: "Video" },
            { key: "model3d", label: "Model 3D" },
          ].map((type) => (
            <button
              key={type.key}
              onClick={() => setFilterType(type.key)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                filterType === type.key
                  ? "bg-emerald-500 text-black shadow-md shadow-emerald-500/20 font-bold"
                  : "bg-[#091b12] text-emerald-300/70 hover:text-white hover:bg-[#0e271b] border border-emerald-500/20"
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-emerald-500/60 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama file..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#081810] border border-[#163826] text-xs text-white placeholder-emerald-800 focus:outline-none focus:border-emerald-400 transition"
          />
        </div>
      </div>

      {/* Media Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {loading ? (
          <div className="col-span-full py-16 text-center text-emerald-400/60 text-xs">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-400" />
            <span>Memuat aset pustaka media...</span>
          </div>
        ) : filteredMedia.length === 0 ? (
          <div className="col-span-full py-16 text-center rounded-2xl bg-[#081810] border border-[#143423] p-8">
            <FolderOpen className="w-10 h-10 text-emerald-500/30 mx-auto mb-3" />
            <h4 className="text-sm font-bold text-white">Pustaka media kosong</h4>
            <p className="text-xs text-emerald-400/60 mt-1">
              Klik &quot;Unggah Media&quot; di atas untuk menambahkan gambar, video, atau model 3D WebGL.
            </p>
          </div>
        ) : (
          filteredMedia.map((item) => (
            <div
              key={item.filename}
              className="rounded-2xl bg-[#091b12]/90 border border-[#163826] hover:border-emerald-500/30 transition-all overflow-hidden flex flex-col justify-between group shadow-lg shadow-black/20"
            >
              {/* Preview Container */}
              <div className="relative aspect-video bg-[#050e08] flex items-center justify-center overflow-hidden border-b border-[#143423]">
                {item.mediaType === "image" ? (
                  <img
                    src={item.url}
                    alt={item.originalName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : item.mediaType === "video" ? (
                  <div className="flex flex-col items-center justify-center text-emerald-400">
                    <Video className="w-8 h-8 mb-1" />
                    <span className="text-[10px] font-semibold">Video File</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center text-teal-300">
                    <Box className="w-8 h-8 mb-1 animate-pulse" />
                    <span className="text-[10px] font-semibold">3D Model File</span>
                  </div>
                )}

                {/* Badge Type */}
                <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-[9px] font-bold text-emerald-300 uppercase border border-white/10">
                  {item.mediaType}
                </div>
              </div>

              {/* Details & Actions */}
              <div className="p-4 space-y-3">
                <div>
                  <h4
                    className="text-xs font-semibold text-white truncate"
                    title={item.originalName}
                  >
                    {item.originalName}
                  </h4>
                  <div className="flex items-center justify-between text-[10px] text-emerald-400/60 mt-0.5">
                    <span>{formatFileSize(item.size)}</span>
                    <span className="font-mono">
                      {new Date(item.createdAt).toLocaleDateString("id-ID")}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#143423]">
                  <button
                    onClick={() => handleCopy(item.url)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#0e271b] hover:bg-[#153827] text-[11px] font-medium text-emerald-300 transition"
                    title="Salin URL publik"
                  >
                    {copiedUrl === item.url ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span>Tersalin</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Salin URL</span>
                      </>
                    )}
                  </button>

                  <div className="flex items-center gap-1">
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 rounded-lg text-emerald-400/70 hover:text-emerald-300 hover:bg-[#0e271b] transition"
                      title="Buka File"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                    <button
                      onClick={() => handleDelete(item.filename)}
                      className="p-1.5 rounded-lg text-rose-400/70 hover:text-rose-300 hover:bg-rose-950/40 transition"
                      title="Hapus"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
