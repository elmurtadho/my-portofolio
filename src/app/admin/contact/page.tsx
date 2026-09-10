"use client";

import React, { useState, useEffect } from "react";
import {
  PhoneCall,
  Mail,
  MapPin,
  Save,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  ExternalLink,
  Globe,
  Share2,
  Eye,
  ArrowUp,
  ArrowDown,
  Sparkles,
} from "lucide-react";
import AdminFeedback, { AdminFeedbackState } from "@/components/admin/AdminFeedback";
import {
  adminFetch,
  getLocalCache,
  setLocalCache,
  syncSectionToServer,
  mergeOrSyncData,
  CACHE_KEYS,
} from "@/lib/client/admin-api";

interface SocialLink {
  platform: string;
  url: string;
}

const POPULAR_PLATFORMS = [
  "GitHub",
  "LinkedIn",
  "Dribbble",
  "Behance",
  "Instagram",
  "Twitter / X",
  "ArtStation",
  "YouTube",
];

const MOCK_CONTACT_DATA = {
  email: "ahmad@elmurtadho.design",
  phone: "+62 812-3456-7890",
  location: "Jakarta, Indonesia (WIB / GMT+7)",
  socials: [
    { platform: "GitHub", url: "https://github.com/elmurtadho" },
    { platform: "LinkedIn", url: "https://linkedin.com/in/elmurtadho" },
    { platform: "Dribbble", url: "https://dribbble.com/elmurtadho" },
    { platform: "Behance", url: "https://behance.net/elmurtadho" },
    { platform: "Instagram", url: "https://instagram.com/elmurtadho" },
    { platform: "ArtStation", url: "https://artstation.com/elmurtadho" },
  ],
};

export default function AdminContactPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<AdminFeedbackState | null>(null);
  const [invalidFields, setInvalidFields] = useState<string[]>([]);

  const [formData, setFormData] = useState(() =>
    getLocalCache(CACHE_KEYS.CONTACT, MOCK_CONTACT_DATA)
  );

  const [newPlatform, setNewPlatform] = useState("GitHub");
  const [newUrl, setNewUrl] = useState("");

  const handleLoadMockContact = () => {
    setFormData(MOCK_CONTACT_DATA);
    setLocalCache(CACHE_KEYS.CONTACT, MOCK_CONTACT_DATA, false);
    syncSectionToServer("contact", MOCK_CONTACT_DATA);
    setFeedback({
      type: "success",
      message: "Data kontak & 6 tautan media sosial tiruan berhasil dimuat!",
    });
    setTimeout(() => setFeedback(null), 3500);
  };

  const fetchContact = async () => {
    setLoading(true);
    try {
      const res = await adminFetch("/api/admin/contact");
      const serverData =
        res.ok && res.data?.success && res.data?.data ? res.data.data : null;

      const { data: finalContact, needsServerSync } = mergeOrSyncData<typeof MOCK_CONTACT_DATA>(
        CACHE_KEYS.CONTACT,
        serverData,
        MOCK_CONTACT_DATA
      );

      setFormData(finalContact);
      if (needsServerSync) {
        syncSectionToServer("contact", finalContact);
      }
    } catch {
      const cached = getLocalCache(CACHE_KEYS.CONTACT, MOCK_CONTACT_DATA);
      setFormData(cached);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContact();
  }, []);

  const handleAddSocial = () => {
    const trimmedUrl = newUrl.trim();
    if (!trimmedUrl) return;

    setFormData((prev) => ({
      ...prev,
      socials: [...prev.socials, { platform: newPlatform, url: trimmedUrl }],
    }));
    setNewUrl("");
  };

  const handleRemoveSocial = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      socials: prev.socials.filter((_, i) => i !== index),
    }));
  };

  const handleUpdateSocial = (index: number, field: "platform" | "url", val: string) => {
    setFormData((prev) => {
      const copy = [...prev.socials];
      copy[index] = { ...copy[index], [field]: val };
      return { ...prev, socials: copy };
    });
  };

  const handleMoveSocial = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= formData.socials.length) return;
    setFormData((prev) => {
      const copy = [...prev.socials];
      const temp = copy[index];
      copy[index] = copy[targetIndex];
      copy[targetIndex] = temp;
      return { ...prev, socials: copy };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    // Validation for "Belum Lengkap"
    const missing: { key: string; label: string }[] = [];
    if (!formData.email.trim()) missing.push({ key: "email", label: "Alamat Email Kontak" });
    if (!formData.phone.trim()) missing.push({ key: "phone", label: "Nomor WhatsApp / Telepon" });
    if (!formData.location.trim()) missing.push({ key: "location", label: "Lokasi / Domisili" });

    if (missing.length > 0) {
      setInvalidFields(missing.map((m) => m.key));
      setFeedback({
        type: "warning",
        message: "Data kontak belum lengkap. Harap lengkapi bidang wajib:",
        details: missing.map((m) => `${m.label} wajib diisi.`),
      });
      return;
    }

    setInvalidFields([]);
    setSaving(true);

    // Save to local cache immediately
    setLocalCache(CACHE_KEYS.CONTACT, formData);
    syncSectionToServer("contact", formData);

    try {
      const res = await adminFetch("/api/admin/contact", {
        method: "PUT",
        body: JSON.stringify(formData),
      });

      if (res.ok && res.data?.success) {
        setFeedback({
          type: "success",
          message: "Data kontak & media sosial berhasil diperbarui!",
        });
        setTimeout(() => setFeedback(null), 4000);
      } else {
        setFeedback({
          type: "warning",
          message: "Data tersimpan di penyimpanan lokal, sedang mencoba sinkronisasi server.",
        });
      }
    } catch {
      setFeedback({
        type: "warning",
        message: "Data kontak berhasil disimpan di browser Anda.",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#143423]">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <PhoneCall className="w-6 h-6 text-emerald-400" />
            <span>Pengaturan Kontak & Media Sosial</span>
          </h2>
          <p className="text-xs sm:text-sm text-emerald-400/60 mt-1">
            Ubah email penerima pesan, WhatsApp, lokasi domisili, dan tautan sosial media
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            type="button"
            onClick={handleLoadMockContact}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30 transition"
            title="Muat data kontak tiruan default"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Muat Data Tiruan</span>
          </button>

          <button
            onClick={fetchContact}
            disabled={loading}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#0e271b] hover:bg-[#153827] text-emerald-300 text-xs font-semibold border border-emerald-500/20 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Segarkan</span>
          </button>
        </div>
      </div>

      {/* Feedback Alerts */}
      <AdminFeedback feedback={feedback} onClose={() => setFeedback(null)} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Container */}
        <div className="lg:col-span-2">
          <form
            onSubmit={handleSubmit}
            className="p-6 sm:p-8 rounded-2xl bg-[#091b12]/90 border border-[#163826] shadow-xl shadow-black/30 space-y-6"
          >
            {/* Direct Contact Fields */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 pb-2 border-b border-[#143423]">
                <Mail className="w-4 h-4 text-emerald-400" />
                <span>Saluran Komunikasi Utama</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-emerald-200">
                    Alamat Email Kontak
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-emerald-500/60 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => {
                        setFormData({ ...formData, email: e.target.value });
                        if (invalidFields.includes("email")) {
                          setInvalidFields((prev) => prev.filter((f) => f !== "email"));
                        }
                      }}
                      placeholder="hello@domain.com"
                      className={`w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#06120b] border text-white text-sm focus:outline-none transition ${
                        invalidFields.includes("email")
                          ? "border-amber-500/80 ring-1 ring-amber-500/50"
                          : "border-[#173a27] focus:border-emerald-400"
                      }`}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-emerald-200">
                    Nomor WhatsApp / Telepon
                  </label>
                  <div className="relative">
                    <PhoneCall className="w-4 h-4 text-emerald-500/60 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) => {
                        setFormData({ ...formData, phone: e.target.value });
                        if (invalidFields.includes("phone")) {
                          setInvalidFields((prev) => prev.filter((f) => f !== "phone"));
                        }
                      }}
                      placeholder="+62 812-3456-7890"
                      className={`w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#06120b] border text-white text-sm focus:outline-none transition ${
                        invalidFields.includes("phone")
                          ? "border-amber-500/80 ring-1 ring-amber-500/50"
                          : "border-[#173a27] focus:border-emerald-400"
                      }`}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-emerald-200">
                  Lokasi / Domisili
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-emerald-500/60 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => {
                      setFormData({ ...formData, location: e.target.value });
                      if (invalidFields.includes("location")) {
                        setInvalidFields((prev) => prev.filter((f) => f !== "location"));
                      }
                    }}
                    placeholder="Jakarta, Indonesia (GMT+7)"
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#06120b] border text-white text-sm focus:outline-none transition ${
                      invalidFields.includes("location")
                        ? "border-amber-500/80 ring-1 ring-amber-500/50"
                        : "border-[#173a27] focus:border-emerald-400"
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* Social Links Manager */}
            <div className="space-y-4 pt-4 border-t border-[#143423]">
              <div className="flex items-center justify-between pb-2 border-b border-[#143423]">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Share2 className="w-4 h-4 text-emerald-400" />
                  <span>Daftar Tautan Sosial Media</span>
                </h3>
                <span className="text-[11px] text-emerald-400/60">
                  {formData.socials.length} akun terhubung
                </span>
              </div>

              {/* Existing Social Items */}
              <div className="space-y-3">
                {formData.socials.length === 0 && (
                  <p className="text-xs text-emerald-600/70 italic py-2">
                    Belum ada tautan sosial media ditambahkan.
                  </p>
                )}
                {formData.socials.map((s, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-[#06120b] border border-[#173a27] flex flex-col sm:flex-row items-stretch sm:items-center gap-3"
                  >
                    <div className="w-full sm:w-40">
                      <input
                        type="text"
                        value={s.platform}
                        onChange={(e) =>
                          handleUpdateSocial(idx, "platform", e.target.value)
                        }
                        placeholder="Platform"
                        className="w-full px-3 py-1.5 rounded-lg bg-[#0a1e14] border border-[#173a27] text-xs font-semibold text-white focus:outline-none focus:border-emerald-400"
                      />
                    </div>

                    <div className="flex-1">
                      <input
                        type="url"
                        value={s.url}
                        onChange={(e) =>
                          handleUpdateSocial(idx, "url", e.target.value)
                        }
                        placeholder="https://..."
                        className="w-full px-3 py-1.5 rounded-lg bg-[#0a1e14] border border-[#173a27] text-xs font-mono text-emerald-300 focus:outline-none focus:border-emerald-400"
                      />
                    </div>

                    <div className="flex items-center gap-1.5 self-end sm:self-auto">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => handleMoveSocial(idx, "up")}
                        className="p-1.5 rounded-lg text-emerald-400/70 hover:text-emerald-300 hover:bg-[#0e271b] transition disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Geser ke Atas"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={idx === formData.socials.length - 1}
                        onClick={() => handleMoveSocial(idx, "down")}
                        className="p-1.5 rounded-lg text-emerald-400/70 hover:text-emerald-300 hover:bg-[#0e271b] transition disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Geser ke Bawah"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      {s.url && (
                        <a
                          href={s.url}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded-lg text-emerald-400/70 hover:text-emerald-300 hover:bg-[#0e271b] transition"
                          title="Buka Tautan"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemoveSocial(idx)}
                        className="p-1.5 rounded-lg text-rose-400/70 hover:text-rose-300 hover:bg-rose-950/40 transition"
                        title="Hapus"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                ))}
              </div>

              {/* Add New Social Form */}
              <div className="p-4 rounded-xl bg-[#06120b] border border-[#173a27] space-y-3">
                <span className="text-xs font-semibold text-emerald-200 block">
                  Tambah Media Sosial Baru:
                </span>
                <div className="flex flex-col sm:flex-row gap-2.5">
                  <select
                    value={newPlatform}
                    onChange={(e) => setNewPlatform(e.target.value)}
                    className="sm:w-44 px-3 py-2 rounded-xl bg-[#091b12] border border-[#173a27] text-xs text-white focus:outline-none focus:border-emerald-400"
                  >
                    {POPULAR_PLATFORMS.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>

                  <input
                    type="url"
                    value={newUrl}
                    onChange={(e) => setNewUrl(e.target.value)}
                    placeholder="https://github.com/username..."
                    className="flex-1 px-4 py-2 rounded-xl bg-[#091b12] border border-[#173a27] text-xs text-white focus:outline-none focus:border-emerald-400"
                  />

                  <button
                    type="button"
                    onClick={handleAddSocial}
                    className="px-4 py-2 rounded-xl bg-[#0e271b] hover:bg-[#153827] text-emerald-300 text-xs font-semibold border border-emerald-500/30 transition flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambah</span>
                  </button>
                </div>
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
                <span>{saving ? "Menyimpan..." : "Simpan Kontak"}</span>
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
                <span>Pratinjau Live Kontak</span>
              </span>
              <span className="text-[10px] uppercase font-semibold text-emerald-400/50">
                Preview
              </span>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3.5 rounded-xl bg-[#06120b] border border-[#163826] flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/15 flex items-center justify-center text-emerald-400">
                  <Mail className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] text-emerald-500/60 block">Email</span>
                  <span className="text-white font-medium truncate block">
                    {formData.email || "hello@mintfolio.design"}
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#06120b] border border-[#163826] flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/15 flex items-center justify-center text-emerald-400">
                  <PhoneCall className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] text-emerald-500/60 block">WhatsApp / Telp</span>
                  <span className="text-white font-medium truncate block">
                    {formData.phone || "+62 812-3456-7890"}
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#06120b] border border-[#163826] flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/15 flex items-center justify-center text-emerald-400">
                  <MapPin className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] text-emerald-500/60 block">Lokasi</span>
                  <span className="text-white font-medium truncate block">
                    {formData.location || "Jakarta, Indonesia"}
                  </span>
                </div>
              </div>
            </div>

            {/* Social Chips Preview */}
            <div className="space-y-2 pt-3 border-t border-[#143423]">
              <span className="text-[11px] text-emerald-500/60 block">
                Sosial Media ({formData.socials.length}):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {formData.socials.map((s, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg bg-[#0e271b] border border-emerald-500/20 text-[11px] text-emerald-300 font-medium"
                  >
                    {s.platform}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
