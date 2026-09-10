"use client";

import React from "react";
import { CheckCircle2, AlertCircle, AlertTriangle, X } from "lucide-react";

export interface AdminFeedbackState {
  type: "success" | "error" | "warning";
  message: string;
  details?: string[];
}

interface AdminFeedbackProps {
  feedback: AdminFeedbackState | null;
  onClose?: () => void;
  className?: string;
}

export function AdminFeedback({ feedback, onClose, className = "" }: AdminFeedbackProps) {
  if (!feedback) return null;

  const isSuccess = feedback.type === "success";
  const isError = feedback.type === "error";
  const isWarning = feedback.type === "warning";

  return (
    <div
      role="alert"
      className={`relative p-4 rounded-2xl border backdrop-blur-md shadow-lg transition-all animate-in fade-in duration-200 ${
        isSuccess
          ? "bg-emerald-950/80 border-emerald-500/60 text-emerald-200 shadow-emerald-950/40"
          : isError
          ? "bg-rose-950/80 border-rose-500/60 text-rose-200 shadow-rose-950/40"
          : "bg-amber-950/85 border-amber-500/60 text-amber-200 shadow-amber-950/40"
      } ${className}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />}
          {isError && <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />}
          {isWarning && <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />}

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span
                className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                  isSuccess
                    ? "bg-emerald-500/20 text-emerald-300"
                    : isError
                    ? "bg-rose-500/20 text-rose-300"
                    : "bg-amber-500/20 text-amber-300"
                }`}
              >
                {isSuccess ? "Berhasil" : isError ? "Gagal" : "Belum Lengkap"}
              </span>
              <p className="text-sm font-semibold">{feedback.message}</p>
            </div>

            {feedback.details && feedback.details.length > 0 && (
              <ul className="text-xs space-y-1 pl-1 pt-1 opacity-90">
                {feedback.details.map((detail, idx) => (
                  <li key={idx} className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
                    <span>{detail}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup notifikasi"
            className="p-1 rounded-lg hover:bg-black/20 text-current/60 hover:text-current transition"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}

export default AdminFeedback;
