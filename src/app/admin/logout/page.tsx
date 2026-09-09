"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LogOut, CheckCircle2 } from "lucide-react";

export default function AdminLogoutPage() {
  const router = useRouter();

  useEffect(() => {
    const doLogout = async () => {
      try {
        await fetch("/api/admin/auth", { method: "DELETE" });
      } catch {
        // ignore
      }
      setTimeout(() => {
        router.replace("/selfcrudcontent");
      }, 600);
    };

    doLogout();
  }, [router]);

  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center p-8 text-center space-y-4">
      <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
        <LogOut className="w-8 h-8 animate-pulse" />
      </div>
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">
          Mengakhiri Sesi Admin...
        </h2>
        <p className="text-xs text-emerald-400/60 mt-1">
          Menghapus token autentikasi dan mengalihkan ke halaman login.
        </p>
      </div>
    </div>
  );
}
