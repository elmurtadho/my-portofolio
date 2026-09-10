"use client";

import React, { useState, useEffect } from "react";
import {
  Mail,
  Trash2,
  CheckCircle2,
  RefreshCw,
  Search,
  Clock,
  User,
  Inbox,
  Check,
  AlertCircle,
} from "lucide-react";

import { adminFetch, getLocalCache, setLocalCache, CACHE_KEYS } from "@/lib/client/admin-api";

interface InquiryItem {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export default function AdminInquiriesPage() {
  const [inquiries, setInquiries] = useState<InquiryItem[]>(() =>
    getLocalCache<InquiryItem[]>(CACHE_KEYS.INQUIRIES, [])
  );
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRead, setFilterRead] = useState<"all" | "unread" | "read">("all");
  const [selectedInquiry, setSelectedInquiry] = useState<InquiryItem | null>(null);

  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const fetchInquiries = async () => {
    setLoading(true);
    try {
      const res = await adminFetch("/api/admin/inquiries");
      if (res.ok && res.data?.success && Array.isArray(res.data.data)) {
        setInquiries(res.data.data);
        setLocalCache(CACHE_KEYS.INQUIRIES, res.data.data);
      } else {
        const cached = getLocalCache<InquiryItem[]>(CACHE_KEYS.INQUIRIES, []);
        if (cached.length > 0) setInquiries(cached);
      }
    } catch {
      const cached = getLocalCache<InquiryItem[]>(CACHE_KEYS.INQUIRIES, []);
      if (cached.length > 0) setInquiries(cached);
      setFeedback({
        type: "error",
        message: "Gagal memuat pesan masuk dari server.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, []);

  const handleToggleRead = async (id: string, currentRead: boolean) => {
    // Immediate UI update
    const updated = inquiries.map((inq) =>
      inq.id === id ? { ...inq, read: !currentRead } : inq
    );
    setInquiries(updated);
    setLocalCache(CACHE_KEYS.INQUIRIES, updated);
    if (selectedInquiry?.id === id) {
      setSelectedInquiry((prev) => (prev ? { ...prev, read: !currentRead } : null));
    }

    try {
      await adminFetch("/api/admin/inquiries", {
        method: "PATCH",
        body: JSON.stringify({ id, read: !currentRead }),
      });
    } catch {
      // already updated locally
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus pesan ini secara permanen?")) return;

    const filtered = inquiries.filter((i) => i.id !== id);
    setInquiries(filtered);
    setLocalCache(CACHE_KEYS.INQUIRIES, filtered);
    if (selectedInquiry?.id === id) {
      setSelectedInquiry(null);
    }

    try {
      const res = await adminFetch(`/api/admin/inquiries?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setFeedback({
          type: "success",
          message: "Pesan berhasil dihapus.",
        });
        setTimeout(() => setFeedback(null), 3000);
      }
    } catch {
      setFeedback({
        type: "error",
        message: "Gagal menghapus pesan dari server.",
      });
    }
  };

  const filteredInquiries = inquiries.filter((item) => {
    const matchesFilter =
      filterRead === "all"
        ? true
        : filterRead === "unread"
        ? !item.read
        : item.read;

    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.message.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const unreadCount = inquiries.filter((i) => !i.read).length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#143423]">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <Mail className="w-6 h-6 text-emerald-400" />
            <span>Pesan Masuk & Tawaran Proyek</span>
          </h2>
          <p className="text-xs sm:text-sm text-emerald-400/60 mt-1">
            Kelola pesan dari pengunjung website, klien potensial, dan tawaran kerja sama
          </p>
        </div>

        <button
          onClick={fetchInquiries}
          disabled={loading}
          className="self-start sm:self-auto inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#0e271b] hover:bg-[#153827] text-emerald-300 text-xs font-semibold border border-emerald-500/20 transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Segarkan</span>
        </button>
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

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Read Status Filter */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setFilterRead("all")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
              filterRead === "all"
                ? "bg-emerald-500 text-black font-bold"
                : "bg-[#091b12] text-emerald-300/70 hover:text-white border border-emerald-500/20"
            }`}
          >
            Semua ({inquiries.length})
          </button>
          <button
            onClick={() => setFilterRead("unread")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
              filterRead === "unread"
                ? "bg-emerald-500 text-black font-bold"
                : "bg-[#091b12] text-emerald-300/70 hover:text-white border border-emerald-500/20"
            }`}
          >
            Belum Dibaca ({unreadCount})
          </button>
          <button
            onClick={() => setFilterRead("read")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
              filterRead === "read"
                ? "bg-emerald-500 text-black font-bold"
                : "bg-[#091b12] text-emerald-300/70 hover:text-white border border-emerald-500/20"
            }`}
          >
            Sudah Dibaca ({inquiries.length - unreadCount})
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-emerald-500/60 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari pengirim / isi pesan..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#081810] border border-[#163826] text-xs text-white placeholder-emerald-800 focus:outline-none focus:border-emerald-400 transition"
          />
        </div>
      </div>

      {/* Inquiries Layout: Master List & Detail Viewer */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* List of Messages */}
        <div className="lg:col-span-2 space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
          {loading ? (
            <div className="py-16 text-center text-emerald-400/60 text-xs">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-400" />
              <span>Memuat pesan masuk...</span>
            </div>
          ) : filteredInquiries.length === 0 ? (
            <div className="py-16 text-center rounded-2xl bg-[#081810] border border-[#143423] p-8">
              <Inbox className="w-10 h-10 text-emerald-500/30 mx-auto mb-3" />
              <h4 className="text-sm font-bold text-white">Tidak ada pesan</h4>
              <p className="text-xs text-emerald-400/60 mt-1">
                Pesan dari formulir kontak web akan muncul di sini.
              </p>
            </div>
          ) : (
            filteredInquiries.map((inq) => {
              const active = selectedInquiry?.id === inq.id;

              return (
                <div
                  key={inq.id}
                  onClick={() => {
                    setSelectedInquiry(inq);
                    if (!inq.read) {
                      handleToggleRead(inq.id, false);
                    }
                  }}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    active
                      ? "bg-[#0f2a1d] border-emerald-500/50 shadow-md shadow-emerald-950"
                      : inq.read
                      ? "bg-[#081810]/70 border-[#143423] hover:border-emerald-500/30 text-emerald-300/80"
                      : "bg-[#0c2419] border-emerald-500/30 hover:border-emerald-500/50"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-white truncate max-w-[150px]">
                      {inq.name}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {!inq.read && (
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      )}
                      <span className="text-[10px] text-emerald-500/60 font-mono">
                        {new Date(inq.createdAt).toLocaleDateString("id-ID")}
                      </span>
                    </div>
                  </div>

                  <h4 className="text-xs font-semibold text-emerald-300 truncate mb-1">
                    {inq.subject || "Pesan Baru Portofolio"}
                  </h4>

                  <p className="text-[11px] text-emerald-400/60 line-clamp-2 leading-relaxed">
                    {inq.message}
                  </p>
                </div>
              );
            })
          )}
        </div>

        {/* Message Details Pane */}
        <div className="lg:col-span-3">
          {selectedInquiry ? (
            <div className="p-6 sm:p-7 rounded-2xl bg-[#081810]/95 border border-[#163826] space-y-6 sticky top-24 shadow-xl shadow-black/30">
              <div className="flex items-start justify-between gap-4 pb-4 border-b border-[#143423]">
                <div>
                  <h3 className="text-lg font-bold text-white">
                    {selectedInquiry.subject || "Pesan Portofolio"}
                  </h3>
                  <div className="flex flex-wrap items-center gap-2.5 mt-1 text-xs text-emerald-400/70">
                    <span className="font-semibold text-emerald-300">
                      {selectedInquiry.name}
                    </span>
                    <span>&bull;</span>
                    <a
                      href={`mailto:${selectedInquiry.email}`}
                      className="text-emerald-400 hover:underline font-mono"
                    >
                      {selectedInquiry.email}
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      handleToggleRead(selectedInquiry.id, selectedInquiry.read)
                    }
                    className="p-2 rounded-xl bg-[#0e271b] hover:bg-[#153827] text-emerald-300 border border-emerald-500/20 text-xs font-semibold transition flex items-center gap-1.5"
                    title={
                      selectedInquiry.read
                        ? "Tandai Belum Dibaca"
                        : "Tandai Sudah Dibaca"
                    }
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{selectedInquiry.read ? "Dibaca" : "Tandai Baca"}</span>
                  </button>

                  <button
                    onClick={() => handleDelete(selectedInquiry.id)}
                    className="p-2 rounded-xl bg-rose-950/40 hover:bg-rose-950/80 text-rose-400 hover:text-rose-300 border border-rose-900/40 transition"
                    title="Hapus Pesan"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Timestamp info */}
              <div className="flex items-center gap-2 text-xs text-emerald-500/60 font-mono">
                <Clock className="w-3.5 h-3.5" />
                <span>
                  Dikirim pada:{" "}
                  {new Date(selectedInquiry.createdAt).toLocaleString("id-ID", {
                    dateStyle: "full",
                    timeStyle: "short",
                  })}
                </span>
              </div>

              {/* Message Content */}
              <div className="p-4 rounded-xl bg-[#050e08] border border-[#143423] text-sm text-emerald-100/90 whitespace-pre-wrap leading-relaxed">
                {selectedInquiry.message}
              </div>

              {/* Reply Action */}
              <div className="flex justify-end pt-2">
                <a
                  href={`mailto:${selectedInquiry.email}?subject=Re: ${encodeURIComponent(
                    selectedInquiry.subject || "Pesan Portofolio"
                  )}`}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-emerald-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition hover:scale-[1.02]"
                >
                  <Mail className="w-4 h-4" />
                  <span>Balas Lewat Email Klien</span>
                </a>
              </div>
            </div>
          ) : (
            <div className="h-full min-h-[300px] flex flex-col items-center justify-center p-8 rounded-2xl bg-[#081810]/50 border border-dashed border-[#143423] text-center">
              <Inbox className="w-12 h-12 text-emerald-500/20 mb-3" />
              <h4 className="text-sm font-semibold text-emerald-300">
                Pilih pesan untuk melihat detail
              </h4>
              <p className="text-xs text-emerald-500/50 mt-1 max-w-xs">
                Klik salah satu pesan dari daftar di sebelah kiri untuk membaca pesan secara lengkap.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
