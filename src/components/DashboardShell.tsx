"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { signOut } from "next-auth/react";
import Sidebar from "./Sidebar";
import ChangePasswordModal from "./ChangePasswordModal";
import { Menu, ChevronDown, User, Key, LogOut } from "lucide-react";

interface DashboardShellProps {
  children: React.ReactNode;
  userName: string;
  userRole: string;
  userStars: number;
}

export default function DashboardShell({
  children,
  userName,
  userRole,
  userStars,
}: DashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isPwModalOpen, setIsPwModalOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();

  // Tự động đóng sidebar khi chuyển trang (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  // Đóng sidebar / dropdown khi nhấn Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSidebarOpen(false);
        setDropdownOpen(false);
      }
    };
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleSidebar = useCallback(() => {
    setSidebarOpen((prev) => !prev);
  }, []);

  const closeSidebar = useCallback(() => {
    setSidebarOpen(false);
  }, []);

  return (
    <div className="flex">
      {/* Overlay trên mobile khi sidebar mở */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm md:hidden transition-opacity duration-300"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <Sidebar
        userName={userName}
        userRole={userRole}
        userStars={userStars}
        isOpen={sidebarOpen}
        onClose={closeSidebar}
      />

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-h-screen min-w-0 md:ml-[260px]">
        {/* Global Header */}
        <header className="sticky top-0 z-20 flex items-center justify-between gap-3 px-4 sm:px-6 py-3 bg-[var(--bg-secondary)] border-b border-[var(--border-color)]">
          <div className="flex items-center gap-3">
            <button
              onClick={toggleSidebar}
              className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] transition-colors"
              aria-label="Mở menu"
            >
              <Menu size={22} />
            </button>
            
            {/* Hiểu thi logo bvote cho mobile */}
            <div className="md:hidden flex items-center gap-2">
              <div className="gradient-bg w-7 h-7 rounded-md flex items-center justify-center shrink-0">
                <span className="text-white text-xs font-bold">B</span>
              </div>
              <span className="font-bold text-base tracking-tight">Bvote</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Account Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2.5 p-1.5 rounded-full hover:bg-[var(--bg-card-hover)] transition-colors border border-transparent hover:border-[var(--border-color)] focus:outline-none"
              >
                <div className="gradient-bg w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold text-white">
                  {userName?.charAt(0)?.toUpperCase()}
                </div>
                <div className="hidden sm:block text-left mr-1">
                  <p className="text-sm font-semibold leading-none mb-0.5">{userName}</p>
                  <p className="text-[0.6875rem] text-[var(--text-muted)] leading-none">
                    {userRole === "ADMIN" ? "Quản trị viên" : userRole === "MANAGER" ? "Quản lý" : "Nhân viên"}
                  </p>
                </div>
                <ChevronDown size={16} className={`text-[var(--text-muted)] transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-[var(--bg-card)] border border-gray-100 rounded-xl shadow-lg  z-50 overflow-hidden animate-fade-in">
                  <div className="px-4 py-3 border-b border-[var(--border-color)]">
                    <p className="text-sm text-[var(--text-primary)] font-medium truncate">{userName}</p>
                    <p className="text-xs text-[var(--text-muted)] truncate mt-0.5">{userRole}</p>
                  </div>
                  
                  <div className="py-1">
                    <Link 
                      href="/dashboard/profile" 
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)] hover:text-[var(--text-primary)]"
                    >
                      <User size={16} />
                      Thông tin tài khoản
                    </Link>
                    <button 
                      onClick={() => { setDropdownOpen(false); setIsPwModalOpen(true); }}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)] hover:text-[var(--text-primary)]"
                    >
                      <Key size={16} />
                      Đổi mật khẩu
                    </button>
                  </div>
                  
                  <div className="py-1 border-t border-[var(--border-color)]">
                    <button
                      onClick={() => signOut({ callbackUrl: "/login" })}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-[var(--color-danger)] hover:bg-[var(--color-danger)]/10"
                    >
                      <LogOut size={16} />
                      Đăng xuất
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Nội dung chính */}
        <main className="main-content flex-1 !ml-0 md:!ml-0">{children}</main>
      </div>

      <ChangePasswordModal isOpen={isPwModalOpen} onClose={() => setIsPwModalOpen(false)} />
    </div>
  );
}
