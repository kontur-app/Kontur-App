"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useAppSettings } from "@/lib/settings";
import {
  LayoutDashboard,
  FolderKanban,
  CalendarClock,
  Settings,
  Menu,
  X,
  LogOut,
} from "lucide-react";

const navItems = [
  { href: "/", label: "Дашборд", icon: LayoutDashboard },
  { href: "/projects", label: "Проекты", icon: FolderKanban },
  { href: "/meetings", label: "Совещания", icon: CalendarClock },
  { href: "/settings", label: "Настройки", icon: Settings },
];

const directionLabels: Record<string, string> = {
  backend: "Backend",
  frontend: "Frontend",
  smm: "SMM",
  design: "Дизайн",
  mobile: "Mobile",
  devops: "DevOps",
  qa: "QA",
  pm: "PM",
  other: "Другое",
};

export default function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();
  const { settings } = useAppSettings();

  const appName = settings?.app_name || "Kontur";
  const logoUrl = settings?.logo_url || null;
  const sec = settings?.secondary_color || "#1B2A6B";
  const accent = settings?.accent_color || "#7FE0F5";
  const bg = settings?.primary_color || "#F3EFE6";

  const handleLogout = async () => {
    await logout();
    setMobileOpen(false);
  };

  return (
    <>
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-50 md:hidden p-2 rounded-lg"
        style={{ backgroundColor: sec, color: bg }}
      >
        <Menu size={24} />
      </button>

      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-full z-50 w-64 flex flex-col transition-transform duration-300 md:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ backgroundColor: bg }}
      >
        {/* Logo */}
        <div className="flex items-center justify-between p-5 border-b-2" style={{ borderColor: sec }}>
          <div className="flex items-center gap-3">
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoUrl} alt={appName} className="w-10 h-10 rounded-lg object-contain" />
            ) : (
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg"
                style={{ backgroundColor: accent, color: sec }}
              >
                {appName.charAt(0)}
              </div>
            )}
            <span className="text-xl font-bold" style={{ color: sec }}>
              {appName}
            </span>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="md:hidden"
            style={{ color: sec }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all"
                style={{
                  backgroundColor: isActive ? sec : "transparent",
                  color: isActive ? bg : sec,
                }}
              >
                <item.icon size={20} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User + Logout */}
        <div className="p-4 border-t-2 space-y-3" style={{ borderColor: sec }}>
          {user && (
            <div className="flex items-center gap-3 px-2">
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm"
                style={{ backgroundColor: accent, color: sec }}
              >
                {user.first_name?.charAt(0) || user.username.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate" style={{ color: sec }}>
                  {user.first_name || user.username}
                </p>
                <p className="text-xs truncate" style={{ color: accent }}>
                  {directionLabels[user.profile?.direction] || user.profile?.direction || ""}
                </p>
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all hover:opacity-80"
            style={{ backgroundColor: sec + "15", color: sec }}
          >
            <LogOut size={18} />
            Выйти
          </button>
        </div>
      </aside>
    </>
  );
}
