"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  Sparkles,
  ShieldAlert,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Terminal,
  KeyRound,
} from "lucide-react";

export default function SelfCrudContentPortalPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("almurtadha221103@gmail.com");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // If already authenticated, redirect straight to management
  useEffect(() => {
    fetch("/api/admin/auth")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.authenticated) {
          router.replace("/admin");
        }
      })
      .catch(() => {});
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: identifier.trim(),
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data?.error || "Email/Username atau kata sandi tidak valid.");
        setLoading(false);
        return;
      }

      setSuccess(true);
      if (typeof window !== "undefined") {
        if (data.token) {
          try {
            const { setAdminToken } = await import("@/lib/client/admin-api");
            setAdminToken(data.token);
          } catch {
            localStorage.setItem("mintfolio_admin_token", data.token);
          }
        }
        localStorage.setItem("mintfolio_admin_logged_in", "true");
      }
      setTimeout(() => {
        router.push("/admin");
      }, 600);
    } catch {
      setError("Gagal terhubung ke server autentikasi.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#060d09] flex items-center justify-center p-4 sm:p-6 relative overflow-hidden selection:bg-emerald-500/30 selection:text-emerald-300">
      {/* Ambient glowing atmosphere */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute -bottom-20 right-10 w-96 h-96 bg-teal-500/10 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#10281c15_1px,transparent_1px),linear-gradient(to_bottom,#10281c15_1px,transparent_1px)] bg-[size:3rem_3rem] pointer-events-none opacity-40" />

      <div className="w-full max-w-lg relative z-10">
        {/* Terminal Header Card */}
        <div className="bg-[#091b13]/90 border border-[#1b432f] rounded-3xl p-7 sm:p-10 backdrop-blur-2xl shadow-2xl shadow-black/80 relative overflow-hidden">
          {/* Moving beam glint across the card */}
          <div
            className="absolute inset-0 w-32 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-25 pointer-events-none animate-shimmer-sweep"
            aria-hidden="true"
          />

          {/* Header Branding */}
          <div className="text-center mb-8 space-y-3">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 via-teal-400 to-emerald-500 p-[1.5px] shadow-lg shadow-emerald-500/25 mb-1">
              <div className="w-full h-full bg-[#081710] rounded-[14.5px] flex items-center justify-center">
                <Terminal className="w-7 h-7 text-emerald-400" />
              </div>
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>/selfcrudcontent • Private Gateway</span>
            </div>

            <h1 className="font-designer font-extrabold text-2xl sm:text-3xl text-white tracking-tight">
              Portal Pengelola{" "}
              <span className="bg-gradient-to-r from-emerald-300 to-teal-300 bg-clip-text text-transparent">
                Konten
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-emerald-200/60 max-w-sm mx-auto">
              Akses khusus pemilik portofolio untuk mengelola karya, keahlian, narasi profil, dan pesan masuk.
            </p>
          </div>

          {/* Feedback Alerts */}
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-950/40 border border-red-500/30 text-red-200 text-xs sm:text-sm flex items-start gap-3 animate-in fade-in duration-200">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1 leading-relaxed">{error}</div>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-200 text-xs sm:text-sm flex items-center gap-3 animate-in fade-in duration-200">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              <span>Kredensial terverifikasi. Mengarahkan ke panel kendali...</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-emerald-300/80 mb-2 uppercase tracking-wider font-mono">
                Email / Username Admin
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-emerald-400/50 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="almurtadha221103@gmail.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#07140e] border border-[#1b3d2c] text-white text-sm focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/50 transition shadow-inner font-mono"
                />
              </div>
              <p className="text-[11px] text-emerald-300/50 mt-1.5 font-mono">
                Mendukung: <span className="text-emerald-300">almurtadha221103@gmail.com</span>, <span className="text-emerald-300">elmurtadho</span>, atau <span className="text-emerald-300">admin</span>
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-emerald-300/80 uppercase tracking-wider font-mono">
                  Kata Sandi
                </label>
                <span className="text-[11px] text-emerald-400/70 font-mono">
                  Default: mintfolio2026
                </span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-emerald-400/50 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan kata sandi..."
                  className="w-full pl-10 pr-11 py-3 rounded-xl bg-[#07140e] border border-[#1b3d2c] text-white text-sm focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/50 transition shadow-inner"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-emerald-400/50 hover:text-emerald-300 transition"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || success}
              className="w-full mt-2 py-3.5 px-6 rounded-xl font-bold text-sm text-emerald-950 bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-400 hover:from-emerald-300 hover:to-teal-300 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer font-designer tracking-wide"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-emerald-950 border-t-transparent rounded-full animate-spin" />
                  <span>Memverifikasi Akses...</span>
                </>
              ) : success ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Akses Diterima!</span>
                </>
              ) : (
                <>
                  <span>Buka Panel Kendali</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Footer Card */}
          <div className="mt-8 pt-5 border-t border-[#153424] flex items-center justify-between text-xs text-emerald-300/50">
            <Link href="/" className="hover:text-emerald-300 transition flex items-center gap-1">
              ← Kembali ke Beranda
            </Link>
            <span className="font-mono text-[10px]">AUTH_MODE: STRICT_SESSION</span>
          </div>
        </div>
      </div>
    </div>
  );
}
