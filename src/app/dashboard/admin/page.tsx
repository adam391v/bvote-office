import { getAdminStats, getPendingRedemptions } from "@/actions/admin-actions";
import {
  Users,
  Target,
  ClipboardCheck,
  MessageCircle,
  Gift,
  Building2,
  Star,
  Clock,
} from "lucide-react";
import Link from "next/link";
import AdminRedemptionActions from "@/components/AdminRedemptionActions";

export default async function AdminPage() {
  const [stats, pendingRedemptions] = await Promise.all([
    getAdminStats(),
    getPendingRedemptions(),
  ]);

  const statCards = [
    { label: "Người dùng", value: stats.totalUsers, icon: Users, color: "#05be75", href: "/dashboard/admin/users" },
    { label: "Phòng ban", value: stats.totalDepartments, icon: Building2, color: "#06b6d4", href: "/dashboard/admin/departments" },
    { label: "Mục tiêu", value: stats.totalGoals, icon: Target, color: "#10b981", href: "/dashboard/admin/metrics" },
    { label: "Check-in", value: stats.totalCheckins, icon: ClipboardCheck, color: "#3b82f6" },
    { label: "Phản hồi", value: stats.totalFeedbacks, icon: MessageCircle, color: "#f59e0b" },
    { label: "Phần thưởng", value: stats.totalRewards, icon: Gift, color: "#ef4444", href: "/dashboard/admin/rewards" },
  ];

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <h1 className="page-title">
          <span className="gradient-text">Quản trị hệ thống</span>
        </h1>
        <p className="page-subtitle">Tổng quan hoạt động và quản lý nền tảng Bvote</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {statCards.map((card, i) => {
          const Inner = (
            <div className="flex flex-col gap-3">
              <div
                className="w-[42px] h-[42px] rounded-lg flex items-center justify-center"
                style={{
                  background: `${card.color}12`,
                  color: card.color,
                }}
              >
                <card.icon size={22} />
              </div>
              <div>
                <p className="text-[2rem] font-extrabold leading-none tracking-tight">
                  {card.value}
                </p>
                <p className="text-[0.8125rem] text-[var(--text-secondary)] mt-1">
                  {card.label}
                </p>
              </div>
            </div>
          );

          return card.href ? (
            <Link
              key={i}
              href={card.href}
              className={`card animate-fade-in stagger-${(i % 4) + 1} opacity-0 no-underline !text-inherit`}
            >
              {Inner}
            </Link>
          ) : (
            <div
              key={i}
              className={`card-static animate-fade-in stagger-${(i % 4) + 1} opacity-0`}
            >
              {Inner}
            </div>
          );
        })}
      </div>

      {/* Two-column section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Users by Role */}
        <div className="card-static animate-fade-in">
          <h2 className="text-[0.9375rem] font-semibold mb-5 flex items-center gap-2">
            <Users size={18} className="text-[var(--color-primary)]" />
            Phân bổ theo vai trò
          </h2>
          <div className="flex flex-col gap-3.5">
            {[
              { label: "Quản trị viên", count: stats.roleCounts.ADMIN, color: "#ef4444" },
              { label: "Quản lý", count: stats.roleCounts.MANAGER, color: "#f59e0b" },
              { label: "Nhân viên", count: stats.roleCounts.EMPLOYEE, color: "#05be75" },
            ].map((role) => (
              <div key={role.label}>
                <div className="flex justify-between mb-1.5 text-[0.8125rem]">
                  <span className="flex items-center gap-1.5">
                    <span
                      className="w-2 h-2 rounded-full inline-block"
                      style={{ background: role.color }}
                    />
                    {role.label}
                  </span>
                  <span className="font-semibold">{role.count}</span>
                </div>
                <div className="progress-bar" style={{ height: 6 }}>
                  <div
                    className="progress-fill"
                    style={{
                      width: `${stats.totalUsers > 0 ? (role.count / stats.totalUsers) * 100 : 0}%`,
                      background: role.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Users */}
        <div className="card-static animate-fade-in">
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-[0.9375rem] font-semibold flex items-center gap-2">
              <Clock size={18} className="text-[var(--color-secondary)]" />
              Thành viên mới nhất
            </h2>
            <Link href="/dashboard/admin/users" className="btn btn-ghost btn-sm">
              Xem tất cả →
            </Link>
          </div>
          <div className="flex flex-col gap-1.5">
            {stats.recentUsers.map((user) => (
              <div
                key={user.id}
                className="flex justify-between items-center py-2 px-3 rounded-lg transition-colors duration-150 hover:bg-[var(--bg-card-hover)]"
              >
                <div className="flex items-center gap-2.5">
                  <div className="gradient-bg w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold text-white shrink-0">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-[0.8125rem]">{user.name}</p>
                    <p className="text-[0.6875rem] text-[var(--text-muted)]">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`badge ${
                      user.role === "ADMIN"
                        ? "badge-danger"
                        : user.role === "MANAGER"
                        ? "badge-warning"
                        : "badge-primary"
                    }`}
                  >
                    {user.role === "ADMIN"
                      ? "Admin"
                      : user.role === "MANAGER"
                      ? "Quản lý"
                      : "NV"}
                  </span>
                  <span className="flex items-center gap-0.5 text-[var(--color-accent)] text-[0.8125rem] font-semibold">
                    <Star size={12} fill="#f59e0b" color="#f59e0b" />
                    {user.stars?.totalStars ?? 0}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pending Redemptions */}
      {pendingRedemptions.length > 0 && (
        <div className="card-static animate-fade-in mt-6">
          <h2 className="text-[0.9375rem] font-semibold mb-5 flex items-center gap-2">
            <Gift size={18} className="text-[var(--color-accent)]" />
            Yêu cầu đổi thưởng chờ duyệt
            <span className="badge badge-warning">{pendingRedemptions.length}</span>
          </h2>
          <div className="data-table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Người yêu cầu</th>
                  <th>Phần thưởng</th>
                  <th>Chi phí</th>
                  <th>Ngày</th>
                  <th className="text-right">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {pendingRedemptions.map((rd) => (
                  <tr key={rd.id}>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="gradient-bg w-[30px] h-[30px] rounded-full flex items-center justify-center text-[0.6875rem] font-semibold text-white shrink-0">
                          {rd.user.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium">{rd.user.name}</span>
                      </div>
                    </td>
                    <td>{rd.reward.name}</td>
                    <td>
                      <span className="flex items-center gap-1 font-semibold text-[var(--color-accent)]">
                        <Star size={12} fill="#f59e0b" color="#f59e0b" />
                        {rd.reward.starCost}
                      </span>
                    </td>
                    <td className="text-[var(--text-muted)]">
                      {new Date(rd.createdAt).toLocaleDateString("vi-VN")}
                    </td>
                    <td className="text-right">
                      <AdminRedemptionActions redemptionId={rd.id} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
