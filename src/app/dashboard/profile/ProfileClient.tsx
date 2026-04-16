"use client";

import { ShieldAlert, Mail } from "lucide-react";

interface ProfileClientProps {
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
}

export default function ProfileClient({ user }: ProfileClientProps) {
  const getRoleLabel = (role: string) => {
    switch (role) {
      case "ADMIN": return "Quản trị viên";
      case "MANAGER": return "Quản lý";
      default: return "Nhân viên";
    }
  };

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6">
      <div className="flex items-center gap-3 justify-center mb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-center">Tài khoản của tôi</h1>
          <p className="text-[var(--text-secondary)] text-center mt-1">Thông tin cá nhân được quản lý bảo mật</p>
        </div>
      </div>

      <div className="card-static flex flex-col items-center text-center !p-10">
        <div className="gradient-bg w-28 h-28 rounded-full flex items-center justify-center text-4xl font-bold text-white mb-6">
          {user.name.charAt(0).toUpperCase()}
        </div>
        <h2 className="text-2xl font-bold mb-2">{user.name}</h2>
        <div className="flex items-center gap-2 text-[var(--color-primary)] bg-[var(--color-primary)]/10 px-4 py-1.5 rounded-full text-sm font-medium mb-8">
          <ShieldAlert size={16} />
          {getRoleLabel(user.role)}
        </div>

        <div className="w-full max-w-md space-y-4 text-left border-t border-[var(--border-color)] pt-8 mt-2">
          <div>
            <p className="text-xs text-[var(--text-muted)] font-medium uppercase tracking-wider mb-2" style={{letterSpacing: "1px"}}>Email liên hệ</p>
            <p className="flex items-center gap-3 text-base mt-2 px-4 py-3 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-color)]">
              <Mail size={18} className="text-[var(--text-secondary)]" />
              <span className="font-medium text-[var(--text-primary)]">{user.email}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
