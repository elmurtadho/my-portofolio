"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  User,
  FileText,
  Sparkles,
  Briefcase,
  FolderOpen,
  Mail,
  PhoneCall,
  Settings,
  ExternalLink,
  LogOut,
  X,
  Layers,
  ShieldCheck,
} from "lucide-react";

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  unreadInquiriesCount?: number;
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  exact?: boolean;
  badge?: number;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

export function AdminSidebar({
  isOpen,
  onClose,
  unreadInquiriesCount = 0,
}: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/auth", { method: "DELETE" });
    } catch {
      // ignore
    }
    if (typeof window !== "undefined") {
      localStorage.removeItem("mintfolio_admin_logged_in");
    }
    router.push("/admin/logout");
  };

  const navGroups: NavGroup[] = [

    {
      title: "KONTEN PORTOFOLIO",
      items: [
        {
          label: "Dashboard",
          href: "/admin",
          icon: LayoutDashboard,
          exact: true,
        },
        {
          label: "Profil & Hero",
          href: "/admin/profile",
          icon: User,
        },
        {
          label: "Tentang Saya",
          href: "/admin/about",
          icon: FileText,
        },
        {
          label: "Keahlian (Skills)",
          href: "/admin/skills",
          icon: Sparkles,
        },
        {
          label: "Hasil Karya & Galeri",
          href: "/admin/projects",
          icon: Briefcase,
        },
        {
          label: "Kategori Karya",
          href: "/admin/categories",
          icon: Layers,
        },
      ],
    },
    {
      title: "MEDIA & INTERAKSI",
      items: [
        {
          label: "Media & Model 3D",
          href: "/admin/media",
          icon: FolderOpen,
        },
        {
          label: "Pesan Masuk",
          href: "/admin/inquiries",
          icon: Mail,
          badge: unreadInquiriesCount > 0 ? unreadInquiriesCount : undefined,
        },
        {
          label: "Kontak & Sosial",
          href: "/admin/contact",
          icon: PhoneCall,
        },
      ],
    },
    {
      title: "PENGATURAN",
      items: [
        {
          label: "Keamanan Akun",
          href: "/admin/settings",
          icon: Settings,
        },
      ],
    },
  ];

  const isActive = (href: string, exact?: boolean) => {
    if (exact) {
      return pathname === href;
    }
    return pathname === href || pathname?.startsWith(`${href}/`);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-[#06120c] border-r border-[#153424] flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand Header */}
        <div className="h-18 px-5 flex items-center justify-between border-b border-[#153424] bg-[#091a11]/60">
          <Link
            href="/admin"
            className="flex items-center gap-3 group"
            onClick={onClose}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 text-[#041a11]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-white tracking-tight">MintFolio</span>
                <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 rounded border border-emerald-500/30">
                  ADMIN
                </span>
              </div>
              <p className="text-xs text-emerald-400/60 font-medium">Control Center</p>
            </div>
          </Link>

          {/* Close button for mobile */}
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-emerald-400 hover:text-white hover:bg-[#12281d] lg:hidden"
            aria-label="Tutup Menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation items */}
        <nav className="flex-1 overflow-y-auto px-3.5 py-4 space-y-6 scrollbar-thin scrollbar-thumb-emerald-900 scrollbar-track-transparent">
          {navGroups.map((group, groupIdx) => (
            <div key={groupIdx} className="space-y-1.5">
              <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-emerald-400/50">
                {group.title}
              </p>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const active = isActive(item.href, item.exact);
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onClose}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                        active
                          ? "bg-gradient-to-r from-emerald-500/20 to-teal-500/10 text-emerald-300 border border-emerald-500/30 shadow-sm shadow-emerald-950"
                          : "text-emerald-100/70 hover:text-white hover:bg-[#0c2217]"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon
                          className={`w-4 h-4 transition-colors ${
                            active ? "text-emerald-400" : "text-emerald-500/60 group-hover:text-emerald-400"
                          }`}
                        />
                        <span>{item.label}</span>
                      </div>

                      {item.badge !== undefined && (
                        <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-emerald-500 text-black shadow-sm">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer actions */}
        <div className="p-3.5 border-t border-[#153424] bg-[#07150e]/90 space-y-2">
          {/* Quick link to live portfolio */}
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between w-full px-3 py-2 rounded-xl text-xs font-medium text-emerald-300/80 hover:text-emerald-200 bg-[#0d2319] hover:bg-[#133022] border border-emerald-500/20 transition-colors group"
          >
            <div className="flex items-center gap-2">
              <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
              <span>Lihat Web Portofolio</span>
            </div>
            <span className="text-[10px] text-emerald-400/60 group-hover:translate-x-0.5 transition-transform">
              ↗
            </span>
          </Link>

          {/* Logout button */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-xs font-medium text-rose-300/80 hover:text-rose-200 hover:bg-rose-950/30 border border-transparent hover:border-rose-900/40 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5 text-rose-400" />
            <span>Keluar dari Panel Admin</span>
          </button>
        </div>
      </aside>
    </>
  );
}
