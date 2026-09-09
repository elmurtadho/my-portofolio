"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AdminSidebar } from "./AdminSidebar";
import { AdminNavbar } from "./AdminNavbar";
import {
  LayoutDashboard,
  Briefcase,
  Sparkles,
  Mail,
  Menu,
} from "lucide-react";

interface AdminLayoutClientProps {
  children: React.ReactNode;
}

export function AdminLayoutClient({ children }: AdminLayoutClientProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [authChecking, setAuthChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const pathname = usePathname();

  const isLoginPage = pathname === "/admin/login" || pathname === "/admin/logout";

  useEffect(() => {
    if (isLoginPage) {
      setAuthChecking(false);
      return;
    }

    // Check authentication
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/admin/auth");
        const data = await res.json();
        const hasLocalDemo =
          typeof window !== "undefined" &&
          localStorage.getItem("mintfolio_admin_logged_in") === "true";

        if (data?.authenticated || hasLocalDemo) {
          setIsAuthenticated(true);
          setAuthChecking(false);
        } else {
          setIsAuthenticated(false);
          setAuthChecking(false);
          if (typeof window !== "undefined") {
            window.location.href = "/admin/login";
          }
        }
      } catch {
        const hasLocalDemo =
          typeof window !== "undefined" &&
          localStorage.getItem("mintfolio_admin_logged_in") === "true";
        if (hasLocalDemo) {
          setIsAuthenticated(true);
          setAuthChecking(false);
        } else {
          if (typeof window !== "undefined") {
            window.location.href = "/admin/login";
          }
        }
      }
    };

    checkAuth();
  }, [pathname, isLoginPage]);

  useEffect(() => {
    // Fetch inquiries unread count
    if (!isLoginPage) {
      fetch("/api/admin/inquiries")
        .then((res) => {
          if (res.ok) return res.json();
          return null;
        })
        .then((data) => {
          if (data && data.success && Array.isArray(data.data)) {
            const unread = data.data.filter((item: any) => !item.read).length;
            setUnreadCount(unread);
          }
        })
        .catch(() => {
          // ignore error
        });
    }
  }, [pathname, isLoginPage]);

  if (isLoginPage) {
    return (
      <div className="min-h-screen bg-[#06100b] text-[#ecfdf5] flex flex-col justify-center items-center p-4 relative overflow-hidden">
        {/* Subtle Ambient Dark Mint Background Glow */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[140px]" />
          <div className="absolute bottom-[-10%] left-[20%] w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-[140px]" />
        </div>
        <div className="relative z-10 w-full max-w-md">{children}</div>
      </div>
    );
  }

  // Verification loading state for protected routes
  if (authChecking) {
    return (
      <div className="min-h-screen bg-[#06100b] text-[#ecfdf5] flex flex-col justify-center items-center p-4 relative overflow-hidden">
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px]" />
        </div>
        <div className="relative z-10 flex flex-col items-center space-y-4 text-center">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Sparkles className="w-7 h-7 animate-pulse" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              Memverifikasi Sesi Admin...
            </h2>
            <p className="text-xs text-emerald-400/60 mt-1">
              Memeriksa hak akses dan kredensial keamanan MintFolio
            </p>
          </div>
          <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mt-2" />
        </div>
      </div>
    );
  }

  // Not authenticated fallback
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#06100b] text-[#ecfdf5] flex flex-col justify-center items-center p-4 text-center">
        <p className="text-sm text-emerald-400/70">Mengalihkan ke halaman login...</p>
      </div>
    );
  }

  const mobileNavItems = [
    { label: "Dashboard", href: "/admin", icon: LayoutDashboard, exact: true },
    { label: "Karya", href: "/admin/projects", icon: Briefcase },
    { label: "Skills", href: "/admin/skills", icon: Sparkles },
    {
      label: "Pesan",
      href: "/admin/inquiries",
      icon: Mail,
      badge: unreadCount > 0 ? unreadCount : undefined,
    },
  ];

  return (
    <div className="min-h-screen bg-[#06100b] text-[#ecfdf5] flex relative selection:bg-emerald-500/30 selection:text-emerald-300">
      {/* Ambient Dark Mint Glows */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-5%] left-[-5%] w-[500px] h-[500px] bg-emerald-500/8 rounded-full blur-[140px]" />
        <div className="absolute top-[40%] right-[-10%] w-[600px] h-[600px] bg-teal-500/6 rounded-full blur-[160px]" />
        <div className="absolute bottom-[-5%] left-[25%] w-[450px] h-[450px] bg-emerald-600/8 rounded-full blur-[140px]" />
      </div>

      {/* Desktop & Mobile Responsive Sidebar */}
      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        unreadInquiriesCount={unreadCount}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-72 transition-all duration-300 relative z-10">
        {/* Top Navbar */}
        <AdminNavbar onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-24 lg:pb-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar (Hidden on lg screens) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#07150e]/95 backdrop-blur-lg border-t border-[#143222] px-3 py-2 flex items-center justify-around shadow-2xl">
        {mobileNavItems.map((item) => {
          const active = item.exact
            ? pathname === item.href
            : pathname === item.href || pathname?.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl text-[10px] font-semibold relative transition ${
                active
                  ? "text-emerald-300 font-bold"
                  : "text-emerald-500/60 hover:text-white"
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 ${
                    active ? "text-emerald-400" : "text-emerald-500/60"
                  }`}
                />
                {item.badge !== undefined && (
                  <span className="absolute -top-1 -right-2 w-4 h-4 rounded-full bg-emerald-500 text-black text-[9px] font-bold flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </div>
              <span>{item.label}</span>
              {active && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 absolute -bottom-1" />
              )}
            </Link>
          );
        })}

        {/* Mobile Toggle Menu */}
        <button
          onClick={() => setSidebarOpen(true)}
          className="flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl text-[10px] font-semibold text-emerald-500/60 hover:text-white transition"
          aria-label="Menu Lengkap"
        >
          <Menu className="w-5 h-5 text-emerald-500/60" />
          <span>Menu</span>
        </button>
      </div>
    </div>
  );
}
