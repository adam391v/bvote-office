import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getGoalsForCheckin, getCheckins } from "@/actions/checkin-actions";
import { getGoals } from "@/actions/goal-actions";
import CheckinPageClient from "./CheckinPageClient";
import CheckinForm from "@/components/CheckinForm";
import Link from "next/link";
import {
  ClipboardCheck,
  Calendar,
  User,
  ArrowLeft,
} from "lucide-react";

interface CheckinsPageProps {
  searchParams: Promise<{ goalId?: string }>;
}

export default async function CheckinsPage({ searchParams }: CheckinsPageProps) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const sp = await searchParams;
  const goalId = sp.goalId ? parseInt(sp.goalId) : undefined;

  // Nếu có goalId → hiển thị form check-in + lịch sử
  if (goalId) {
    const [checkins, goals] = await Promise.all([
      getCheckins(goalId),
      getGoals(),
    ]);

    const currentGoal = goals.find((g) => g.id === goalId);

    return (
      <div>
        {/* Header */}
        <div className="page-header flex justify-between items-center">
          <div>
            <h1 className="page-title">Check-in 1:1</h1>
            <p className="page-subtitle">
              Check-in định kỳ với 4 câu hỏi vàng: Tiến độ, Rủi ro, Nguyên nhân, Giải pháp
            </p>
          </div>
          <Link
            href="/dashboard/checkins"
            className="flex items-center gap-2 py-2 px-4 rounded-lg border border-[var(--border-color)] text-[var(--text-primary)] no-underline text-sm font-medium transition-colors duration-150 hover:bg-[var(--bg-card-hover)]"
          >
            <ArrowLeft size={16} />
            Quay lại
          </Link>
        </div>

        {/* Context: tên mục tiêu */}
        {currentGoal && (
          <div className="py-3 px-5 bg-indigo-500/[0.06] rounded-lg border border-indigo-500/15 mb-6">
            <p className="text-sm font-semibold text-[var(--color-primary-light)]">
              🎯 {currentGoal.cycleValue || currentGoal.period} | {currentGoal.title}
            </p>
            <p className="text-[0.8125rem] text-[var(--text-muted)] mt-1">
              Mục tiêu: {currentGoal.targetValue} {currentGoal.unit} · Hiện tại: {currentGoal.currentValue} {currentGoal.unit}
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Form */}
          <div className="card-static animate-fade-in">
            <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <ClipboardCheck size={20} className="text-[var(--color-secondary)]" />
              Tạo Check-in mới
            </h2>
            <CheckinForm
              goals={goals.map((g) => ({ id: g.id, title: g.title }))}
              selectedGoalId={goalId}
            />
          </div>

          {/* Lịch sử */}
          <div className="card-static animate-fade-in [animation-delay:0.1s]">
            <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <Calendar size={20} className="text-[var(--color-primary)]" />
              Lịch sử Check-in ({checkins.length})
            </h2>

            {checkins.length === 0 ? (
              <div className="empty-state !p-8">
                <ClipboardCheck size={40} />
                <p className="mt-3">Chưa có check-in nào</p>
                <p className="text-[0.8125rem] mt-1">
                  Hãy tạo check-in đầu tiên bằng form bên trái
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-3 max-h-[600px] overflow-y-auto">
                {checkins.map((checkin) => (
                  <div
                    key={checkin.id}
                    className="p-4 rounded-lg border border-[var(--border-color)] transition-colors duration-200 hover:border-[var(--color-primary)]"
                  >
                    {/* Header */}
                    <div className="flex justify-between items-center mb-3">
                      <div>
                        <Link
                          href={`/dashboard/goals/${checkin.goal.id}`}
                          className="font-semibold text-sm text-[var(--color-primary-light)] no-underline hover:underline"
                        >
                          {checkin.goal.title}
                        </Link>
                        <div className="flex items-center gap-2 mt-1 text-xs text-[var(--text-muted)]">
                          <User size={12} />
                          {checkin.owner.name}
                          <span>·</span>
                          <Calendar size={12} />
                          {new Date(checkin.createdAt).toLocaleDateString("vi-VN")}
                        </div>
                      </div>
                      <div className="flex gap-1.5">
                        {checkin.progressPct !== null && (
                          <span className="badge badge-info">{checkin.progressPct}%</span>
                        )}
                      </div>
                    </div>

                    {/* Detail */}
                    {checkin.detail && (
                      <div className="grid grid-cols-2 gap-2 text-[0.8125rem]">
                        <div className="p-2 rounded-md bg-emerald-500/5">
                          <p className="font-medium text-[var(--color-success)] mb-1 text-xs">📈 Tiến độ</p>
                          <p className="text-[var(--text-secondary)]">{checkin.detail.progressNote}</p>
                        </div>
                        <div className="p-2 rounded-md bg-red-500/5">
                          <p className="font-medium text-[var(--color-danger)] mb-1 text-xs">⚠️ Vấn đề</p>
                          <p className="text-[var(--text-secondary)]">{checkin.detail.issue}</p>
                        </div>
                        <div className="p-2 rounded-md bg-amber-500/5">
                          <p className="font-medium text-[var(--color-warning)] mb-1 text-xs">🔍 Nguyên nhân</p>
                          <p className="text-[var(--text-secondary)]">{checkin.detail.cause}</p>
                        </div>
                        <div className="p-2 rounded-md bg-blue-500/5">
                          <p className="font-medium text-[var(--color-info)] mb-1 text-xs">💡 Giải pháp</p>
                          <p className="text-[var(--text-secondary)]">{checkin.detail.solution}</p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Khi KHÔNG có goalId → hiện bảng danh sách mục tiêu (trang đầu)
  const [myGoals, subGoals] = await Promise.all([
    getGoalsForCheckin("mine"),
    getGoalsForCheckin("subordinate"),
  ]);

  return (
    <CheckinPageClient
      myGoals={JSON.parse(JSON.stringify(myGoals))}
      subGoals={JSON.parse(JSON.stringify(subGoals))}
      currentUserId={Number(session.user.id)}
      currentUserName={session.user.name || "Tôi"}
    />
  );
}
