import { getDashboardData } from "@/actions/dashboard-actions";
import {
  Target,
  ClipboardCheck,
  MessageCircle,
  Star,
  TrendingUp,
  Clock,
  ArrowUpRight,
} from "lucide-react";
import Link from "next/link";

export default async function DashboardPage() {
  const data = await getDashboardData();

  if (!data) {
    return <p>Không thể tải dữ liệu</p>;
  }

  const { stats, recentGoals, recentCheckins } = data;

  const statCards = [
    {
      label: "Mục tiêu",
      value: stats.totalGoals,
      sub: `${stats.goalCompletionRate}% hoàn thành`,
      icon: Target,
      color: "var(--color-primary)",
      variant: "stat-card-primary",
      href: "/dashboard/goals",
    },
    {
      label: "Check-in",
      value: stats.totalCheckins,
      sub: `${stats.pendingCheckins} chờ phản hồi`,
      icon: ClipboardCheck,
      color: "var(--color-secondary)",
      variant: "stat-card-success",
      href: "/dashboard/checkins",
    },
    {
      label: "Phản hồi",
      value: stats.totalFeedbacks,
      sub: "phản hồi đã nhận",
      icon: MessageCircle,
      color: "var(--color-success)",
      variant: "stat-card-warning",
      href: "/dashboard/feedbacks",
    },
    {
      label: "Điểm sao",
      value: stats.totalStars,
      sub: "sao tích lũy",
      icon: Star,
      color: "var(--color-accent)",
      variant: "stat-card-danger",
      href: "/dashboard/rewards",
    },
  ];

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">
          Dashboard <span className="gradient-text">Bvote</span>
        </h1>
        <p className="page-subtitle">
          Tổng quan hiệu suất và hoạt động của bạn
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {statCards.map((card, i) => (
          <Link
            key={i}
            href={card.href}
            className={`card stat-card ${card.variant} animate-fade-in stagger-${i + 1} opacity-0 no-underline !text-inherit`}
          >
            <div className="flex justify-between items-start mb-4">
              <div
                className="w-11 h-11 rounded-lg flex items-center justify-center"
                style={{
                  background: `${card.color}15`,
                  color: card.color,
                }}
              >
                <card.icon size={22} />
              </div>
              <ArrowUpRight size={16} className="text-[var(--text-muted)]" />
            </div>
            <p className="animate-count text-[2rem] font-bold leading-none mb-1.5">
              {card.value}
            </p>
            <p className="text-sm font-medium">{card.label}</p>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              {card.sub}
            </p>
          </Link>
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Mục tiêu gần đây */}
        <div className="card-static animate-fade-in opacity-0 [animation-delay:0.25s]">
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-base font-semibold flex items-center gap-2">
              <TrendingUp size={18} className="text-[var(--color-primary)]" />
              Mục tiêu gần đây
            </h2>
            <Link href="/dashboard/goals" className="btn btn-ghost btn-sm">
              Xem tất cả
            </Link>
          </div>

          {recentGoals.length === 0 ? (
            <div className="empty-state !p-8">
              <Target size={32} className="text-[var(--text-muted)]" />
              <p className="mt-2 text-sm">Chưa có mục tiêu nào</p>
              <Link href="/dashboard/goals/create" className="btn btn-primary btn-sm mt-4">
                Tạo mục tiêu đầu tiên
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {recentGoals.map((goal) => {
                const progress = goal.targetValue > 0 ? Math.min(100, Math.round((goal.currentValue / goal.targetValue) * 100)) : 0;
                const progressColor = progress >= 80 ? "progress-fill-success" : progress >= 40 ? "progress-fill-warning" : "";
                return (
                  <Link
                    key={goal.id}
                    href={`/dashboard/goals/${goal.id}`}
                    className="p-3.5 rounded-lg border border-[var(--border-color)] no-underline !text-inherit transition-all duration-200 hover:border-[var(--color-primary)] hover:shadow-[var(--shadow-glow)]"
                  >
                    <div className="flex justify-between mb-2">
                      <p className="font-medium text-sm">{goal.title}</p>
                      <span className="badge badge-primary">{goal.period}</span>
                    </div>
                    <div className="progress-bar mb-1.5">
                      <div className={`progress-fill ${progressColor}`} style={{ width: `${progress}%` }} />
                    </div>
                    <div className="flex justify-between text-xs text-[var(--text-muted)]">
                      <span>{goal.currentValue} / {goal.targetValue} {goal.unit}</span>
                      <span>{progress}%</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Check-in gần đây */}
        <div className="card-static animate-fade-in opacity-0 [animation-delay:0.3s]">
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-base font-semibold flex items-center gap-2">
              <Clock size={18} className="text-[var(--color-secondary)]" />
              Check-in gần đây
            </h2>
            <Link href="/dashboard/checkins" className="btn btn-ghost btn-sm">
              Xem tất cả
            </Link>
          </div>

          {recentCheckins.length === 0 ? (
            <div className="empty-state !p-8">
              <ClipboardCheck size={32} className="text-[var(--text-muted)]" />
              <p className="mt-2 text-sm">Chưa có check-in nào</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {recentCheckins.map((checkin) => (
                <Link
                  key={checkin.id}
                  href={`/dashboard/checkins/${checkin.id}`}
                  className="p-3.5 rounded-lg border border-[var(--border-color)] no-underline !text-inherit flex justify-between items-center transition-all duration-200 hover:border-[var(--color-primary)] hover:shadow-[var(--shadow-glow)]"
                >
                  <div>
                    <p className="font-medium text-sm">{checkin.goal.title}</p>
                    <p className="text-xs text-[var(--text-muted)] mt-1">
                      bởi {checkin.owner.name} · {new Date(checkin.createdAt).toLocaleDateString("vi-VN")}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {checkin.progressPct !== null && (
                      <span className="badge badge-info">{checkin.progressPct}%</span>
                    )}
                    <span
                      className={`badge ${
                        checkin.status === "COMPLETED"
                          ? "badge-success"
                          : checkin.status === "REVIEWED"
                          ? "badge-warning"
                          : "badge-primary"
                      }`}
                    >
                      {checkin.status === "COMPLETED"
                        ? "Hoàn thành"
                        : checkin.status === "REVIEWED"
                        ? "Đã duyệt"
                        : "Chờ duyệt"}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
