"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Target,
  ClipboardCheck,
  MessageCircle,
  Gift,
  LogOut,
  Star,
  Target as Logo,
  Shield,
  ChevronDown,
  Users,
  Building2,
  BarChart3,
  X,
} from "lucide-react";
import { signOut } from "next-auth/react";
import ThemeToggle from "./ui/ThemeToggle";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/goals", label: "Mục tiêu", icon: Target },
  { href: "/dashboard/checkins", label: "Check-in", icon: ClipboardCheck },
  { href: "/dashboard/feedbacks", label: "Phản hồi 360°", icon: MessageCircle },
  { href: "/dashboard/rewards", label: "Kho quà", icon: Gift },
];

const adminSubItems = [
  { href: "/dashboard/admin", label: "Tổng quan", icon: BarChart3 },
  { href: "/dashboard/admin/users", label: "Người dùng", icon: Users },
  { href: "/dashboard/admin/departments", label: "Phòng ban", icon: Building2 },
  { href: "/dashboard/admin/metrics", label: "Loại mục tiêu", icon: Target },
  { href: "/dashboard/admin/rewards", label: "Phần thưởng", icon: Gift },
];

interface SidebarProps {
  userName: string;
  userRole: string;
  userStars: number;
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({
  userName,
  userRole,
  userStars,
  isOpen = false,
  onClose,
}: SidebarProps) {
  const pathname = usePathname();
  const [adminOpen, setAdminOpen] = useState(pathname.startsWith("/dashboard/admin"));

  const roleLabel =
    userRole === "ADMIN"
      ? "Quản trị viên"
      : userRole === "MANAGER"
      ? "Quản lý"
      : "Nhân viên";

  return (
    <aside className={`sidebar ${isOpen ? "open" : ""}`}>
      {/* Logo + Theme Toggle + Close (mobile) */}
      <div className="px-6 py-5 border-b border-[var(--border-color)] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="gradient-bg w-9 h-9 rounded-lg flex items-center justify-center shrink-0">
            <Logo size={20} color="white" />
          </div>
          <div>
            <span className="font-bold text-lg tracking-tight">Bvote</span>
            <p className="text-[0.6875rem] text-[var(--text-muted)] mt-0.5">
              Performance Management
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          {/* Nút đóng sidebar - chỉ hiện trên mobile */}
          {onClose && (
            <button
              onClick={onClose}
              className="flex items-center justify-center w-8 h-8 rounded-lg text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-card-hover)] hover:text-[var(--text-primary)] md:hidden"
              aria-label="Đóng menu"
            >
              <X size={20} />
            </button>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 flex flex-col gap-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" &&
              pathname.startsWith(item.href) &&
              !pathname.startsWith("/dashboard/admin"));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`sidebar-nav-item relative ${isActive ? "active" : ""}`}
            >
              <item.icon size={20} />
              {item.label}
            </Link>
          );
        })}

        {/* Admin dropdown - chỉ hiện cho ADMIN */}
        {userRole === "ADMIN" && (
          <>
            <div className="mx-3 mt-2 mb-0.5 px-2 text-[0.625rem] font-semibold text-[var(--text-muted)] uppercase tracking-wider">
              Hệ thống
            </div>

            {/* Dropdown toggle */}
            <button
              onClick={() => setAdminOpen(!adminOpen)}
              className={`sidebar-nav-item relative w-auto bg-transparent border-none cursor-pointer text-left font-[inherit] justify-between ${
                pathname.startsWith("/dashboard/admin") ? "active" : ""
              }`}
            >
              <span className="flex items-center gap-3">
                <Shield size={20} />
                Quản trị
              </span>
              <ChevronDown
                size={16}
                className={`text-[var(--text-muted)] transition-transform duration-200 ${
                  adminOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Admin sub-items - dropdown */}
            <div
              className="transition-all duration-250"
              style={{
                maxHeight: adminOpen ? "200px" : "0",
                overflow: "hidden",
                opacity: adminOpen ? 1 : 0,
              }}
            >
              {adminSubItems.map((item) => {
                const isActive =
                  item.href === "/dashboard/admin"
                    ? pathname === "/dashboard/admin"
                    : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`sidebar-sub-item relative ${isActive ? "active" : ""}`}
                  >
                    <item.icon size={16} />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </>
        )}
      </nav>

      <div className="mx-3 mb-3 p-3.5 rounded-lg flex items-center gap-3 bg-gradient-to-br from-amber-500/[0.08] to-amber-500/[0.02] border border-amber-500/15">
        <div className="animate-float">
          <Star size={24} fill="#f59e0b" color="#f59e0b" />
        </div>
        <div>
          <p className="font-bold text-lg text-[var(--color-accent)]">
            {userStars}
          </p>
          <p className="text-[0.6875rem] text-[var(--text-muted)]">sao tích lũy</p>
        </div>
      </div>
    </aside>
  );
}
