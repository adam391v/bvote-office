import { getGoalById } from "@/actions/goal-actions";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Target,
  Calendar,
  TrendingUp,
  User,
  ClipboardCheck,
  LinkIcon,
  Trophy,
} from "lucide-react";

interface GoalDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function GoalDetailPage({ params }: GoalDetailPageProps) {
  const { id } = await params;
  const goal = await getGoalById(parseInt(id));

  if (!goal) notFound();

  const progress =
    goal.targetValue > 0
      ? Math.min(100, Math.round((goal.currentValue / goal.targetValue) * 100))
      : 0;

  return (
    <div>
      {/* Header */}
      <div className="page-header flex items-center gap-4">
        <Link href="/dashboard/goals" className="btn btn-ghost btn-icon">
          <ArrowLeft size={20} />
        </Link>
        <div className="flex-1">
          <h1 className="page-title">{goal.title}</h1>
          <p className="page-subtitle">
            {goal.metric} · {goal.period} · Chủ sở hữu: {goal.owner.name}
          </p>
        </div>
        <Link href={`/dashboard/checkins?goalId=${goal.id}`} className="btn btn-primary">
          <ClipboardCheck size={18} />
          Check-in cho mục tiêu này
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6">
        {/* Main Content */}
        <div className="flex flex-col gap-5">
          {/* Progress Card */}
          <div className="card-static animate-fade-in">
            <h2 className="text-base font-semibold mb-5 flex items-center gap-2">
              <TrendingUp size={18} className="text-[var(--color-primary)]" />
              Tiến độ
            </h2>
            <div className="text-center p-6 bg-indigo-500/5 rounded-lg mb-4">
              <p className="gradient-text text-[3.5rem] font-extrabold leading-none">
                {progress}%
              </p>
              <p className="text-[var(--text-secondary)] mt-2 text-sm">
                {goal.currentValue} / {goal.targetValue} {goal.unit}
              </p>
            </div>
            <div className="progress-bar" style={{ height: 12 }}>
              <div
                className={`progress-fill ${progress >= 80 ? "progress-fill-success" : progress >= 40 ? "progress-fill-warning" : ""}`}
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-[var(--text-muted)] mt-2">
              <span>Bắt đầu: {new Date(goal.startDate).toLocaleDateString("vi-VN")}</span>
              <span>Kết thúc: {new Date(goal.endDate).toLocaleDateString("vi-VN")}</span>
            </div>
            {goal.description && (
              <div className="mt-5 p-4 bg-[var(--bg-card-hover)] rounded-lg text-sm text-[var(--text-secondary)]">
                <strong className="block mb-1.5 text-[var(--text-primary)]">Mô tả:</strong>
                {goal.description}
              </div>
            )}
          </div>

          {/* Lịch sử Check-in */}
          <div className="card-static animate-fade-in [animation-delay:0.1s]">
            <h2 className="text-base font-semibold mb-5 flex items-center gap-2">
              <ClipboardCheck size={18} className="text-[var(--color-secondary)]" />
              Lịch sử Check-in ({goal.checkins.length})
            </h2>

            {goal.checkins.length === 0 ? (
              <div className="empty-state !p-8">
                <ClipboardCheck size={32} />
                <p className="mt-2">Chưa có check-in nào</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {goal.checkins.map((checkin) => (
                  <div
                    key={checkin.id}
                    className="p-4 rounded-lg border border-[var(--border-color)]"
                  >
                    <div className="flex justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <User size={14} className="text-[var(--text-muted)]" />
                        <span className="text-sm font-medium">{checkin.owner.name}</span>
                        <span className="text-xs text-[var(--text-muted)]">
                          · {new Date(checkin.createdAt).toLocaleDateString("vi-VN")}
                        </span>
                      </div>
                      {checkin.progressPct !== null && (
                        <span className="badge badge-info">{checkin.progressPct}%</span>
                      )}
                    </div>
                    {checkin.detail && (
                      <div className="grid grid-cols-2 gap-3 text-[0.8125rem]">
                        <div>
                          <p className="font-medium text-[var(--color-success)] mb-1">📈 Tiến độ</p>
                          <p className="text-[var(--text-secondary)]">{checkin.detail.progressNote}</p>
                        </div>
                        <div>
                          <p className="font-medium text-[var(--color-danger)] mb-1">⚠️ Vấn đề</p>
                          <p className="text-[var(--text-secondary)]">{checkin.detail.issue}</p>
                        </div>
                        <div>
                          <p className="font-medium text-[var(--color-warning)] mb-1">🔍 Nguyên nhân</p>
                          <p className="text-[var(--text-secondary)]">{checkin.detail.cause}</p>
                        </div>
                        <div>
                          <p className="font-medium text-[var(--color-info)] mb-1">💡 Giải pháp</p>
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

        {/* Sidebar */}
        <div className="flex flex-col gap-5">
          {/* Info */}
          <div className="card-static animate-fade-in [animation-delay:0.15s]">
            <h3 className="text-sm font-semibold mb-4">Thông tin</h3>
            <div className="flex flex-col gap-3 text-[0.8125rem]">
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)]">Trạng thái</span>
                <span className={`badge ${goal.status === "COMPLETED" ? "badge-success" : goal.status === "OVERDUE" ? "badge-danger" : "badge-primary"}`}>
                  {goal.status === "COMPLETED" ? "Hoàn thành" : goal.status === "OVERDUE" ? "Quá hạn" : "Đang thực hiện"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)]">Chu kỳ</span>
                <span>{goal.cycleValue || goal.period}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)]">Chỉ số</span>
                <span>{goal.metric}</span>
              </div>
              {goal.minTargetValue !== null && (
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">Mốc tối thiểu</span>
                  <span>{goal.minTargetValue}</span>
                </div>
              )}
              {goal.department && (
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">Phòng ban</span>
                  <span>{goal.department.name}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)]">Quyền truy cập</span>
                <span className={goal.isTransparent ? "badge badge-success" : "badge badge-warning"}>
                  {goal.isTransparent ? "Tất cả mọi người" : "Riêng tư & Nội bộ"}
                </span>
              </div>

              {/* Thẻ (Tags) */}
              {goal.tags && (
                <div className="flex justify-between items-center">
                  <span className="text-[var(--text-muted)]">Thẻ</span>
                  <div className="flex gap-1 flex-wrap justify-end">
                    {goal.tags.split(",").filter(Boolean).map((t) => (
                      <span key={t} className="badge bg-indigo-500/10 text-[var(--color-primary-light)] border border-indigo-500/20">#{t}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Người liên quan */}
              {goal.participants && goal.participants.length > 0 && (
                <div className="mt-2 pt-3 border-t border-dashed border-[var(--border-color)]">
                  <span className="text-[var(--text-muted)] block mb-2">Người liên quan</span>
                  <div className="flex gap-1.5 flex-wrap">
                    {goal.participants.map((p) => (
                      <div key={p.id} className="badge flex items-center gap-1.5 bg-[var(--bg-input)]">
                        <User size={12} className="text-[var(--text-muted)]" />
                        {p.name}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Người theo dõi */}
              {goal.followers && goal.followers.length > 0 && (
                <div className="mt-2 pt-3 border-t border-dashed border-[var(--border-color)]">
                  <span className="text-[var(--text-muted)] block mb-2">Người theo dõi tiến độ</span>
                  <div className="flex gap-1.5 flex-wrap">
                    {goal.followers.map((p) => (
                      <div key={p.id} className="badge badge-info flex items-center gap-1.5">
                        <User size={12} />
                        {p.name}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Parent Goals */}
          {(() => {
            const myLinks = goal.parentLinks.filter((l) => l.parentGoal.ownerId === goal.ownerId);
            const otherLinks = goal.parentLinks.filter((l) => l.parentGoal.ownerId !== goal.ownerId);

            return (
              <>
                {myLinks.length > 0 && (
                  <div className="card-static animate-fade-in [animation-delay:0.2s]">
                    <h3 className="text-sm font-semibold mb-4 flex items-center gap-1.5">
                      <LinkIcon size={14} className="text-[var(--color-primary)]" />
                      Mục tiêu cha (Của tôi)
                    </h3>
                    <div className="flex flex-col gap-2">
                      {myLinks.map((link) => (
                        <Link
                          key={link.id}
                          href={`/dashboard/goals/${link.parentGoal.id}`}
                          className="block p-3 rounded-lg border border-[var(--border-color)] no-underline text-[var(--color-primary-light)] text-[0.8125rem] font-medium hover:border-[var(--color-primary)] transition-colors duration-150"
                        >
                          {link.parentGoal.title}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
                {otherLinks.length > 0 && (
                  <div className="card-static animate-fade-in [animation-delay:0.25s]">
                    <h3 className="text-sm font-semibold mb-4 flex items-center gap-1.5">
                      <LinkIcon size={14} className="text-[var(--color-secondary)]" />
                      Mục tiêu kết nối (Người khác)
                    </h3>
                    <div className="flex flex-col gap-2">
                      {otherLinks.map((link) => (
                        <Link
                          key={link.id}
                          href={`/dashboard/goals/${link.parentGoal.id}`}
                          className="block p-3 rounded-lg border border-[var(--border-color)] no-underline text-[var(--color-primary-light)] hover:border-[var(--color-primary)] transition-colors duration-150"
                        >
                          <p className="text-[0.8125rem] font-medium">{link.parentGoal.title}</p>
                          <p className="text-[0.7rem] text-[var(--text-muted)] mt-1.5 flex items-center gap-1">
                            <User size={10} />
                            {link.parentGoal.owner.name}
                          </p>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </>
            );
          })()}

          {/* Child Goals */}
          {goal.childLinks.length > 0 && (
            <div className="card-static animate-fade-in [animation-delay:0.25s]">
              <h3 className="text-sm font-semibold mb-4 flex items-center gap-1.5">
                <Target size={14} className="text-[var(--color-secondary)]" />
                Mục tiêu con ({goal.childLinks.length})
              </h3>
              <div className="flex flex-col gap-2">
                {goal.childLinks.map((link) => {
                  const childProg = link.goal.targetValue > 0 ? Math.round((link.goal.currentValue / link.goal.targetValue) * 100) : 0;
                  return (
                    <Link
                      key={link.id}
                      href={`/dashboard/goals/${link.goal.id}`}
                      className="block p-3 rounded-lg border border-[var(--border-color)] no-underline !text-inherit text-[0.8125rem] hover:border-[var(--color-primary)] transition-colors duration-150"
                    >
                      <p className="font-medium mb-2">{link.goal.title}</p>
                      <div className="progress-bar" style={{ height: 4 }}>
                        <div className="progress-fill" style={{ width: `${childProg}%` }} />
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* Milestones */}
          {goal.milestones.length > 0 && (
            <div className="card-static animate-fade-in [animation-delay:0.3s]">
              <h3 className="text-sm font-semibold mb-4 flex items-center gap-1.5">
                <Trophy size={14} className="text-[var(--color-accent)]" />
                Mốc thưởng
              </h3>
              <div className="flex flex-col gap-2">
                {goal.milestones.map((ms) => (
                  <div
                    key={ms.id}
                    className={`flex justify-between items-center p-2.5 rounded-lg border border-[var(--border-color)] text-[0.8125rem] ${
                      ms.isReached ? "opacity-100" : "opacity-60"
                    }`}
                  >
                    <span>{ms.isReached ? "✅" : "⬜"} {ms.title} ({ms.value})</span>
                    <span className="badge badge-warning">⭐ {ms.starReward}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
