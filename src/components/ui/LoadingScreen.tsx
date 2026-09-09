"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Box, ArrowRight, Cpu, Activity, ShieldCheck, Zap } from "lucide-react";

export function LoadingScreen() {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("Menghubungkan ke inti visual MintFolio...");
  const [stage, setStage] = useState(0);

  useEffect(() => {
    try {
      // Check query param for explicit replay testing
      const params = new URLSearchParams(window.location.search);
      const forceReplay = params.get("splash") === "replay" || params.get("intro") === "1";

      // Check session storage so splash appears strictly ONCE per browsing session/visit
      const hasVisited = sessionStorage.getItem("mintfolio_visited");
      if (hasVisited && !forceReplay) {
        setLoading(false);
        return;
      }

      // First time in this visit: activate loading screen
      setLoading(true);

      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setTimeout(() => {
              setLoading(false);
              try {
                sessionStorage.setItem("mintfolio_visited", "true");
              } catch {}
            }, 500);
            return 100;
          }

          const step = Math.floor(Math.random() * 8) + 4;
          const next = Math.min(prev + step, 100);

          if (next < 25) {
            setStatusText("Memuat palet warna Dark Mint Green & tipografi...");
            setStage(1);
          } else if (next < 55) {
            setStatusText("Mengompilasi shader Three.js & Three-dimensional WebGL...");
            setStage(2);
          } else if (next < 80) {
            setStatusText("Menyiapkan micro-interaksi, typewriter & audio-visual...");
            setStage(3);
          } else if (next < 99) {
            setStatusText("Mengoptimalkan kanvas rendering 60 FPS...");
            setStage(4);
          } else {
            setStatusText("Sistem siap. Selamat datang di MintFolio.");
            setStage(5);
          }

          return next;
        });
      }, 50);

      return () => clearInterval(interval);
    } catch {
      setLoading(false);
    }
  }, []);

  const handleSkip = () => {
    setLoading(false);
    try {
      sessionStorage.setItem("mintfolio_visited", "true");
    } catch {}
  };

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          key="loader-container"
          initial={{ opacity: 1 }}
          exit={{
            opacity: 0,
            scale: 1.05,
            filter: "blur(8px)",
            transition: { duration: 0.7, ease: [0.76, 0, 0.24, 1] },
          }}
          className="fixed inset-0 z-[100] bg-[#050c09] flex flex-col items-center justify-center p-6 select-none overflow-hidden"
        >
          {/* Subtle Ambient Mint Glows */}
          <div className="absolute w-[600px] h-[600px] bg-emerald-500/15 rounded-full blur-[160px] pointer-events-none animate-pulse" style={{ animationDuration: "4s" }} />
          <div className="absolute w-[400px] h-[400px] bg-teal-400/10 rounded-full blur-[120px] pointer-events-none" />

          {/* High-tech matrix background grid */}
          <div
            className="absolute inset-0 opacity-[0.04] pointer-events-none"
            style={{
              backgroundImage: "radial-gradient(#10b981 1.5px, transparent 1.5px)",
              backgroundSize: "28px 28px",
            }}
          />

          {/* Scanner beam animation */}
          <div className="absolute inset-x-0 h-40 bg-gradient-to-b from-transparent via-emerald-500/10 to-transparent pointer-events-none animate-pulse" />

          {/* Skip Button in top right corner */}
          <button
            onClick={handleSkip}
            className="absolute top-6 right-6 text-xs text-emerald-300/60 hover:text-emerald-300 hover:bg-[#0f241a] px-3.5 py-1.5 rounded-full border border-[#1a3d2c] transition-all flex items-center gap-1.5 backdrop-blur-md cursor-pointer group"
          >
            <span>Lewati Intro</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>

          {/* Top telemetry indicator */}
          <div className="absolute top-6 left-6 hidden sm:flex items-center gap-3 text-[11px] text-emerald-400/60 font-mono">
            <span className="flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span>SYSTEM: ONLINE</span>
            </span>
            <span className="text-emerald-800">•</span>
            <span>THREE.JS WEBGL2</span>
          </div>

          {/* Central Animated Content */}
          <div className="relative z-10 flex flex-col items-center max-w-sm w-full text-center">
            {/* Holographic Glowing 3D Emblem with Concentric Energy Rings */}
            <div className="relative mb-8">
              {/* Outer Energy Rings */}
              <motion.div
                animate={{ rotate: 360, scale: [1, 1.08, 1] }}
                transition={{
                  rotate: { duration: 10, repeat: Infinity, ease: "linear" },
                  scale: { duration: 3.5, repeat: Infinity, ease: "easeInOut" },
                }}
                className="absolute -inset-5 rounded-3xl border border-emerald-500/25 border-dashed pointer-events-none"
              />
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                className="absolute -inset-9 rounded-full border border-teal-500/15 pointer-events-none"
              />

              <motion.div
                animate={{
                  rotate: [0, 90, 180, 270, 360],
                  scale: [1, 1.06, 1],
                }}
                transition={{
                  rotate: { duration: 12, repeat: Infinity, ease: "easeInOut" },
                  scale: { duration: 3, repeat: Infinity, ease: "easeInOut" },
                }}
                className="w-22 h-22 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-emerald-300 p-[2px] shadow-[0_0_55px_rgba(52,211,153,0.45)]"
              >
                <div className="w-full h-full bg-[#07130d] rounded-2xl flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/20 to-transparent pointer-events-none" />
                  <Box className="w-10 h-10 text-emerald-300 animate-pulse relative z-10" />
                </div>
              </motion.div>

              {/* Sparkle badge */}
              <div className="absolute -bottom-2 -right-2 w-7 h-7 rounded-full bg-emerald-400 flex items-center justify-center text-emerald-950 shadow-md shadow-emerald-500/40">
                <Sparkles className="w-4 h-4" />
              </div>
            </div>

            {/* Brand Title */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-2"
            >
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center justify-center gap-1.5">
                <span>Mint</span>
                <span className="text-emerald-400">Folio</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
              </h1>
              <p className="text-[11px] tracking-widest text-emerald-300/70 uppercase font-semibold mt-0.5">
                Interactive Design &amp; 3D Living Experience
              </p>
            </motion.div>

            {/* Status Text with typing vibe */}
            <div className="h-6 mb-5 flex items-center justify-center">
              <motion.p
                key={statusText}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs text-emerald-200/90 font-medium tracking-wide flex items-center gap-1.5"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>{statusText}</span>
              </motion.p>
            </div>

            {/* Progress Bar Container */}
            <div className="w-full bg-[#0c1f16] h-2.5 rounded-full overflow-hidden p-0.5 border border-[#1b4330] shadow-inner mb-3">
              <motion.div
                className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-300 rounded-full shadow-[0_0_15px_rgba(52,211,153,0.8)]"
                style={{ width: `${progress}%` }}
                transition={{ ease: "easeOut" }}
              />
            </div>

            {/* Percentage Number and Diagnostics */}
            <div className="flex items-center justify-between w-full text-[11px] font-mono text-emerald-400 font-semibold px-1">
              <span className="flex items-center gap-1 text-emerald-400/80">
                <Zap className="w-3 h-3 text-emerald-400" />
                <span>BOOSTRAP {stage}/5</span>
              </span>
              <span className="text-emerald-300 text-xs font-bold">{progress}%</span>
            </div>
          </div>

          {/* Bottom telemetry footer */}
          <div className="absolute bottom-6 flex items-center gap-4 text-[10px] font-mono text-emerald-500/50">
            <span>DARK MINT GREEN V2</span>
            <span>•</span>
            <span>TURBOPACK READY</span>
            <span>•</span>
            <span>WebGL HIGH-DPI</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

