"use client";

import React from "react";

export function HomeSkeleton() {
  return (
    <div className="w-full min-h-screen bg-[#070f0b] p-6 space-y-16 animate-pulse">
      {/* Hero Skeleton */}
      <div className="max-w-7xl mx-auto pt-32 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        <div className="lg:col-span-7 space-y-4">
          <div className="w-48 h-6 rounded-full bg-[#10291e]" />
          <div className="w-72 h-4 rounded bg-[#10291e]" />
          <div className="w-full max-w-md h-12 rounded-xl bg-[#10291e]" />
          <div className="w-64 h-8 rounded bg-[#10291e]" />
          <div className="w-full max-w-lg h-16 rounded bg-[#10291e]" />
          <div className="flex gap-4 pt-4">
            <div className="w-40 h-12 rounded-xl bg-[#143324]" />
            <div className="w-36 h-12 rounded-xl bg-[#0f241a]" />
          </div>
        </div>
        <div className="lg:col-span-5 flex justify-center">
          <div className="w-full max-w-sm aspect-square rounded-2xl bg-[#0f241a] border border-[#1b3d2d]" />
        </div>
      </div>

      {/* About Skeleton */}
      <div className="max-w-7xl mx-auto space-y-6 pt-12">
        <div className="w-32 h-6 mx-auto rounded-full bg-[#10291e]" />
        <div className="w-80 h-10 mx-auto rounded bg-[#10291e]" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-6">
          <div className="lg:col-span-5 h-80 rounded-2xl bg-[#0f241a]" />
          <div className="lg:col-span-7 space-y-4">
            <div className="w-full h-8 rounded bg-[#10291e]" />
            <div className="w-full h-24 rounded bg-[#0f241a]" />
            <div className="w-3/4 h-6 rounded bg-[#10291e]" />
            <div className="w-2/3 h-6 rounded bg-[#10291e]" />
          </div>
        </div>
      </div>

      {/* Skills Skeleton */}
      <div className="max-w-7xl mx-auto space-y-6 pt-12">
        <div className="w-32 h-6 mx-auto rounded-full bg-[#10291e]" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-32 rounded-2xl bg-[#0b1c14] border border-[#183928] p-5 space-y-3">
              <div className="w-32 h-5 rounded bg-[#132f22]" />
              <div className="w-full h-2 rounded-full bg-[#132f22]" />
              <div className="w-20 h-4 rounded bg-[#132f22]" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
