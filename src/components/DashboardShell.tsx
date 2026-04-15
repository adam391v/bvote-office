"use client";

import { useState, useCallback, useEffect } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";
import { Menu } from "lucide-react";

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
  const pathname = usePathname();

  // Tự động đóng sidebar khi chuyển trang (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  // Đóng sidebar khi nhấn Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSidebarOpen(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
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
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Mobile header - chỉ hiện trên màn hình nhỏ */}
        <header className="sticky top-0 z-20 flex items-center gap-3 px-4 py-3 bg-[var(--bg-secondary)] border-b border-[var(--border-color)] md:hidden">
          <button
            onClick={toggleSidebar}
            className="flex items-center justify-center w-10 h-10 rounded-lg text-[var(--text-primary)] bg-[var(--bg-card-hover)] transition-colors hover:bg-[var(--color-primary)] hover:text-white"
            aria-label="Mở menu"
          >
            <Menu size={22} />
          </button>
          <div className="flex items-center gap-2">
            <div className="gradient-bg w-7 h-7 rounded-md flex items-center justify-center shrink-0">
              <span className="text-white text-xs font-bold">B</span>
            </div>
            <span className="font-bold text-base tracking-tight">Bvote</span>
          </div>
        </header>

        {/* Nội dung chính */}
        <main className="main-content md:!ml-[260px]">{children}</main>
      </div>
    </div>
  );
}
