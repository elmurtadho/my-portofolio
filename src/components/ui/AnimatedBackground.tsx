"use client";

import React, { useEffect, useState } from "react";

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  opacity: number;
}

export function AnimatedBackground() {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 });

  useEffect(() => {
    // Generate gentle ambient floating particles
    const items: Particle[] = Array.from({ length: 24 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 2,
      duration: Math.random() * 18 + 12,
      delay: Math.random() * 5,
      opacity: Math.random() * 0.4 + 0.15,
    }));
    setParticles(items);

    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none">
      {/* Interactive mouse follower mint spotlight */}
      <div
        className="absolute w-[650px] h-[650px] rounded-full blur-[150px] opacity-25 transition-transform duration-500 ease-out pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(16,185,129,0.35) 0%, rgba(13,148,136,0.15) 50%, transparent 75%)",
          transform: `translate(${mousePos.x - 325}px, ${mousePos.y - 325}px)`,
        }}
      />

      {/* Large ambient static blur spots */}
      <div className="absolute -top-[15%] -left-[10%] w-[700px] h-[700px] bg-emerald-500/10 rounded-full blur-[160px] animate-pulse" style={{ animationDuration: "10s" }} />
      <div className="absolute top-[35%] -right-[15%] w-[800px] h-[800px] bg-teal-500/8 rounded-full blur-[180px] animate-pulse" style={{ animationDuration: "14s" }} />
      <div className="absolute -bottom-[10%] left-[15%] w-[650px] h-[650px] bg-emerald-600/10 rounded-full blur-[160px] animate-pulse" style={{ animationDuration: "12s" }} />

      {/* Subtle modern dot-grid matrix */}
      <div
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage: "radial-gradient(#34d399 1px, transparent 1px)",
          backgroundSize: "36px 36px",
        }}
      />

      {/* Floating Mint Dust Particles */}
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full bg-emerald-400/60 blur-[0.5px]"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            opacity: p.opacity,
            boxShadow: "0 0 10px rgba(52, 211, 153, 0.6)",
            animation: `floatParticle ${p.duration}s ease-in-out ${p.delay}s infinite alternate`,
          }}
        />
      ))}

      <style jsx>{`
        @keyframes floatParticle {
          0% {
            transform: translateY(0px) translateX(0px) scale(0.9);
          }
          50% {
            transform: translateY(-40px) translateX(25px) scale(1.15);
          }
          100% {
            transform: translateY(20px) translateX(-20px) scale(0.85);
          }
        }
      `}</style>
    </div>
  );
}
