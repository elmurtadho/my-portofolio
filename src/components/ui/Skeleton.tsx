"use client";

import React from "react";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

/**
 * Base Dark Mint Skeleton primitive with shimmer & pulse effects
 */
export function Skeleton({ className = "", ...props }: SkeletonProps) {
  return (
    <div
      className={`relative overflow-hidden bg-[#0c2419] rounded-xl animate-pulse before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmerSweep_2.5s_infinite] before:bg-gradient-to-r before:from-transparent before:via-emerald-400/10 before:to-transparent ${className}`}
      {...props}
    />
  );
}

/**
 * Public Project Card Skeleton
 */
export function ProjectCardSkeleton() {
  return (
    <div className="rounded-2xl bg-[#0b1c14] border border-[#1b4330] overflow-hidden shadow-xl flex flex-col justify-between">
      {/* Thumbnail */}
      <div className="relative aspect-[16/10] overflow-hidden bg-[#060e0a]">
        <Skeleton className="w-full h-full rounded-none" />
        {/* Top Badges Placeholder */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          <Skeleton className="w-24 h-6 rounded-full bg-[#113122]" />
          <Skeleton className="w-16 h-5 rounded-full bg-[#113122]" />
        </div>
      </div>

      {/* Card Content Body */}
      <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
        <div>
          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            <Skeleton className="w-14 h-5 rounded-md bg-[#132e21]" />
            <Skeleton className="w-16 h-5 rounded-md bg-[#132e21]" />
            <Skeleton className="w-12 h-5 rounded-md bg-[#132e21]" />
          </div>

          {/* Project Title */}
          <Skeleton className="w-4/5 h-6 rounded-lg bg-[#143525] mb-2" />

          {/* Description Lines */}
          <div className="space-y-1.5 mt-2">
            <Skeleton className="w-full h-4 rounded bg-[#102a1e]" />
            <Skeleton className="w-2/3 h-4 rounded bg-[#102a1e]" />
          </div>
        </div>

        {/* Bottom Details Footer */}
        <div className="pt-4 mt-4 border-t border-[#183929] flex items-center justify-between">
          <Skeleton className="w-20 h-4 rounded bg-[#112d20]" />
          <Skeleton className="w-24 h-6 rounded-lg bg-[#153828]" />
        </div>
      </div>
    </div>
  );
}

/**
 * Public Skill Item Skeleton
 */
export function SkillItemSkeleton() {
  return (
    <div className="p-5 rounded-2xl bg-[#091b12]/90 border border-[#183a28] shadow-lg flex flex-col justify-between space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="w-11 h-11 rounded-xl bg-[#0e2c1e]" />
          <div className="space-y-1.5">
            <Skeleton className="w-28 h-5 rounded-md bg-[#133624]" />
            <Skeleton className="w-16 h-3 rounded bg-[#0e271a]" />
          </div>
        </div>
        <Skeleton className="w-10 h-6 rounded-md bg-[#113121]" />
      </div>

      <div className="space-y-1.5">
        <div className="flex justify-between items-center text-xs">
          <Skeleton className="w-16 h-3 rounded bg-[#0e271a]" />
          <Skeleton className="w-8 h-3 rounded bg-[#0e271a]" />
        </div>
        <Skeleton className="w-full h-2 rounded-full bg-[#0e271a]" />
      </div>
    </div>
  );
}

/**
 * Admin Project Card Skeleton (Grid mode)
 */
export function AdminProjectCardSkeleton() {
  return (
    <div className="rounded-2xl bg-[#091b12]/90 border border-[#163826] overflow-hidden flex flex-col shadow-lg shadow-black/20">
      <div className="relative aspect-video bg-[#050e08] overflow-hidden border-b border-[#143423]">
        <Skeleton className="w-full h-full rounded-none" />
        <div className="absolute top-3 left-3">
          <Skeleton className="w-20 h-6 rounded-lg bg-[#0e291b]" />
        </div>
        <div className="absolute top-3 right-3">
          <Skeleton className="w-7 h-7 rounded-lg bg-[#0e291b]" />
        </div>
      </div>

      <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <div className="flex items-center justify-between mb-2">
            <Skeleton className="w-20 h-4 rounded bg-[#102d1e]" />
            <Skeleton className="w-12 h-3 rounded bg-[#0d2418]" />
          </div>
          <Skeleton className="w-3/4 h-5 rounded-lg bg-[#143826] mb-2" />
          <Skeleton className="w-full h-3.5 rounded bg-[#0f281b] mb-1" />
          <Skeleton className="w-2/3 h-3.5 rounded bg-[#0f281b]" />
        </div>

        <div className="pt-3 border-t border-[#143423] flex items-center justify-between">
          <div className="flex gap-1">
            <Skeleton className="w-12 h-4 rounded bg-[#0e271b]" />
            <Skeleton className="w-14 h-4 rounded bg-[#0e271b]" />
          </div>
          <div className="flex gap-1.5">
            <Skeleton className="w-7 h-7 rounded-lg bg-[#102c1d]" />
            <Skeleton className="w-7 h-7 rounded-lg bg-[#102c1d]" />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Admin Table Row Skeleton (Table mode)
 */
export function AdminTableRowSkeleton() {
  return (
    <tr className="border-b border-[#143423]/60 animate-pulse">
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-3">
          <Skeleton className="w-10 h-10 rounded-lg bg-[#0e281b] shrink-0" />
          <div className="space-y-1.5">
            <Skeleton className="w-32 h-4 rounded bg-[#133423]" />
            <Skeleton className="w-48 h-3 rounded bg-[#0e271a]" />
          </div>
        </div>
      </td>
      <td className="px-4 py-3.5">
        <Skeleton className="w-20 h-5 rounded-md bg-[#102e1f]" />
      </td>
      <td className="px-4 py-3.5">
        <Skeleton className="w-14 h-4 rounded bg-[#0e271a]" />
      </td>
      <td className="px-4 py-3.5">
        <div className="flex gap-1">
          <Skeleton className="w-12 h-4 rounded bg-[#0e271a]" />
          <Skeleton className="w-12 h-4 rounded bg-[#0e271a]" />
        </div>
      </td>
      <td className="px-4 py-3.5 text-center">
        <Skeleton className="w-5 h-5 rounded mx-auto bg-[#0e271a]" />
      </td>
      <td className="px-4 py-3.5 text-right">
        <div className="flex items-center justify-end gap-1.5">
          <Skeleton className="w-7 h-7 rounded-lg bg-[#102e1f]" />
          <Skeleton className="w-7 h-7 rounded-lg bg-[#102e1f]" />
        </div>
      </td>
    </tr>
  );
}

/**
 * Admin Skill Card Skeleton
 */
export function AdminSkillCardSkeleton() {
  return (
    <div className="p-5 rounded-2xl bg-[#091b12]/90 border border-[#163826] flex flex-col justify-between space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="w-11 h-11 rounded-xl bg-[#0e2c1e]" />
          <div className="space-y-1.5">
            <Skeleton className="w-28 h-4 rounded bg-[#133624]" />
            <Skeleton className="w-16 h-3 rounded bg-[#0e271a]" />
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <Skeleton className="w-7 h-7 rounded-lg bg-[#102e1f]" />
          <Skeleton className="w-7 h-7 rounded-lg bg-[#102e1f]" />
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="flex justify-between items-center text-xs">
          <Skeleton className="w-14 h-3 rounded bg-[#0e271a]" />
          <Skeleton className="w-8 h-3 rounded bg-[#0e271a]" />
        </div>
        <Skeleton className="w-full h-2 rounded-full bg-[#0e271a]" />
      </div>
    </div>
  );
}

/**
 * Admin Category Card Skeleton
 */
export function AdminCategoryCardSkeleton() {
  return (
    <div className="p-6 rounded-2xl bg-[#091b12]/90 border border-[#163826] flex flex-col justify-between space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="w-10 h-10 rounded-xl bg-[#0e2c1e]" />
        <div className="flex gap-1.5">
          <Skeleton className="w-7 h-7 rounded-lg bg-[#102e1f]" />
          <Skeleton className="w-7 h-7 rounded-lg bg-[#102e1f]" />
        </div>
      </div>

      <div className="space-y-2">
        <Skeleton className="w-36 h-5 rounded-lg bg-[#133624]" />
        <Skeleton className="w-24 h-3 rounded bg-[#0e271a]" />
        <Skeleton className="w-full h-4 rounded bg-[#0e271a]" />
      </div>

      <div className="pt-3 border-t border-[#143423] flex items-center justify-between">
        <Skeleton className="w-20 h-5 rounded-full bg-[#102e1f]" />
        <Skeleton className="w-16 h-3 rounded bg-[#0e271a]" />
      </div>
    </div>
  );
}

/**
 * Admin Inquiry Item Skeleton
 */
export function AdminInquirySkeleton() {
  return (
    <div className="p-4 rounded-2xl border border-[#163826] bg-[#091b12]/90 space-y-2.5">
      <div className="flex items-center justify-between">
        <Skeleton className="w-28 h-4 rounded bg-[#133624]" />
        <Skeleton className="w-14 h-3 rounded bg-[#0e271a]" />
      </div>
      <Skeleton className="w-40 h-3 rounded bg-[#0e271a]" />
      <Skeleton className="w-full h-3 rounded bg-[#0e271a]" />
    </div>
  );
}

/**
 * Admin Metric Card Skeleton
 */
export function AdminMetricCardSkeleton() {
  return (
    <div className="p-5 rounded-2xl bg-[#091b12]/80 border border-[#143423] flex flex-col justify-between space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="w-28 h-3.5 rounded bg-[#0e271a]" />
        <Skeleton className="w-9 h-9 rounded-xl bg-[#102e1f]" />
      </div>
      <div>
        <Skeleton className="w-16 h-8 rounded-lg bg-[#143826] mb-1.5" />
        <Skeleton className="w-32 h-3 rounded bg-[#0e271a]" />
      </div>
    </div>
  );
}
