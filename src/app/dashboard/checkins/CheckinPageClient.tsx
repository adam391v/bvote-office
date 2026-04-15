"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { updateGoalPlanUrlAction } from "@/actions/checkin-actions";
import { Button } from "@/components/ui";
import {
  MessageCircle,
  Link2,
  ClipboardCheck,
  TrendingUp,
  Calendar,
  CheckCircle2,
  Settings,
  Eye,
  ChevronDown,
  X,
  Send,
  ExternalLink,
} from "lucide-react";

// ===== TYPES =====
interface GoalCheckin {
  id: number;
  title: string;
  metric: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  period: string;
  cycleValue?: string | null;
  startDate: string;
  endDate: string;
  tags?: string | null;
  planUrl?: string | null;
  owner: { id: number; name: string };
  checkins: {
    id: number;
    progressPct: number | null;
    confidence: string | null;
    createdAt: string;
    feedbacks: { id: number }[];
  }[];
}

interface Props {
  myGoals: GoalCheckin[];
  subGoals: GoalCheckin[];
  currentUserId: number;
  currentUserName: string;
}

// ===== HELPERS =====
const confidenceIcons: Record<string, { icon: string; color: string }> = {
  HIGH: { icon: "🟢", color: "var(--color-success)" },
  MEDIUM: { icon: "🟡", color: "var(--color-warning)" },
  LOW: { icon: "🔴", color: "var(--color-danger)" },
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("vi-VN");
}

function ProgressBar({ pct, endDate }: { pct: number; endDate: string }) {
  const color = pct >= 70 ? "var(--color-success)" : pct >= 40 ? "var(--color-warning)" : "var(--color-danger)";
  return (
    <div className="flex items-center gap-2 min-w-[160px]">
      <span className="text-[0.8125rem] font-semibold min-w-[36px]">{pct}%</span>
      <div className="flex-1 h-1.5 rounded-full bg-[var(--border-color)]">
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(pct, 100)}%`, background: color }} />
      </div>
      <span className="text-xs text-[var(--text-muted)]">{formatDate(endDate)}</span>
    </div>
  );
}

// ===== PLAN URL MODAL =====
function PlanUrlModal({
  goal,
  onClose,
  onSuccess,
}: {
  goal: GoalCheckin;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [planUrl, setPlanUrl] = useState(goal.planUrl || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    const res = await updateGoalPlanUrlAction(goal.id, planUrl);
    if (res?.error) {
      setError(res.error);
      setLoading(false);
    } else {
      onSuccess();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="bg-[var(--bg-card)] rounded-xl w-[500px] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-5 border-b border-[var(--border-color)]">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Link2 size={20} className="text-[var(--color-primary)]" />
            Kế hoạch
          </h2>
          <button onClick={onClose} className="btn btn-ghost btn-icon">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 flex flex-col gap-4">
          {/* Context */}
          <div className="py-3 px-4 bg-primary/[0.06] rounded-lg border border-primary/15">
            <p className="text-[0.8125rem] text-[var(--text-secondary)]">
              <strong>{goal.cycleValue || goal.period}</strong> | {goal.title}
            </p>
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          {/* URL Input */}
          <div>
            <label className="block text-[0.8125rem] font-semibold mb-1.5">
              Link kế hoạch
            </label>
            <input
              value={planUrl}
              onChange={(e) => setPlanUrl(e.target.value)}
              placeholder="https://docs.google.com/document/d/... hoặc URL bất kỳ"
              className="form-input"
            />
            <p className="text-xs text-[var(--text-muted)] mt-1.5">
              Paste link Google Docs, Notion, Trello hoặc file bất kỳ
            </p>
          </div>

          {/* Hiển thị link hiện tại nếu có */}
          {goal.planUrl && (
            <div className="flex items-center gap-2">
              <ExternalLink size={14} className="text-[var(--color-primary)]" />
              <a
                href={goal.planUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[0.8125rem] text-[var(--color-primary-light)] underline break-all"
              >
                {goal.planUrl.length > 60 ? goal.planUrl.slice(0, 60) + "..." : goal.planUrl}
              </a>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[var(--border-color)] flex justify-end gap-2">
          <button className="btn btn-secondary" onClick={onClose}>
            Hủy
          </button>
          <Button variant="primary" onClick={handleSubmit} loading={loading} icon={<CheckCircle2 size={16} />}>
            Lưu kế hoạch
          </Button>
        </div>
      </div>
    </div>
  );
}

// ===== TABLE COMPONENT =====
function GoalCheckinTable({
  goals,
  isReadOnly = false,
  onClickPlan,
}: {
  goals: GoalCheckin[];
  isReadOnly?: boolean;
  onClickPlan: (goal: GoalCheckin) => void;
}) {
  if (goals.length === 0) {
    return (
      <div className="empty-state !p-12">
        <ClipboardCheck size={40} />
        <p className="mt-3">Không có mục tiêu nào</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b-2 border-[var(--border-color)]">
            <th className="py-3 px-2 text-left text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide">Mục tiêu</th>
            <th className="py-3 px-2 text-center w-[60px] text-xs font-semibold text-[var(--text-muted)]">
              <MessageCircle size={15} className="mx-auto" />
              <div className="text-[0.6875rem] mt-0.5">Phản hồi</div>
            </th>
            <th className="py-3 px-2 text-center w-[60px] text-xs font-semibold text-[var(--text-muted)]">
              <Link2 size={15} className="mx-auto" />
              <div className="text-[0.6875rem] mt-0.5">Kế hoạch</div>
            </th>
            <th className="py-3 px-2 text-center w-[60px] text-xs font-semibold text-[var(--text-muted)]">
              <ClipboardCheck size={15} className="mx-auto" />
              <div className="text-[0.6875rem] mt-0.5">Check-in</div>
            </th>
            <th className="py-3 px-2 text-left w-[200px] text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide">Tiến độ</th>
            <th className="py-3 px-2 text-center w-[70px] text-xs font-semibold text-[var(--text-muted)]">
              <div className="text-[0.6875rem]">Mức độ</div>
              <div className="text-[0.6875rem]">tự tin</div>
            </th>
            <th className="py-3 px-2 text-center w-[100px] text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide">Ngày check-in</th>
            {!isReadOnly && (
              <th className="py-3 px-2 text-center w-[80px] text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide">Thao tác</th>
            )}
            {isReadOnly && <th className="py-3 px-2 text-left w-[120px] text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide">Người sở hữu</th>}
          </tr>
        </thead>
        <tbody>
          {goals.map((goal) => {
            const lastCheckin = goal.checkins[0];
            const pct = lastCheckin?.progressPct ?? 0;
            const hasFeedback = lastCheckin?.feedbacks?.length > 0;
            const hasPlan = !!goal.planUrl;
            const hasCheckin = !!lastCheckin;
            const confidence = lastCheckin?.confidence || null;
            const checkinDate = lastCheckin ? formatDate(lastCheckin.createdAt) : null;
            const tags = goal.tags ? goal.tags.split(",").filter(Boolean) : [];

            return (
              <tr
                key={goal.id}
                className="border-b border-[var(--border-color)] transition-colors duration-150 hover:bg-[var(--bg-card-hover)]"
              >
                {/* Mục tiêu */}
                <td className="py-3.5 px-2 align-middle">
                  <Link
                    href={`/dashboard/goals/${goal.id}`}
                    className="font-semibold text-sm text-[var(--text-primary)] no-underline block hover:text-[var(--color-primary)]"
                  >
                    {goal.cycleValue || goal.period} | {goal.title}: {goal.targetValue} {goal.unit}
                  </Link>
                  {tags.length > 0 && (
                    <div className="flex gap-1 mt-1 flex-wrap">
                      {tags.map((tag) => (
                        <span key={tag} className="text-[0.6875rem] text-[var(--color-info)] opacity-80">
                          #{tag.trim()}
                        </span>
                      ))}
                    </div>
                  )}
                </td>

                {/* Phản hồi icon */}
                <td className="py-3.5 px-2 align-middle text-center">
                  <Link
                    href="/dashboard/feedbacks"
                    title="Xem phản hồi"
                    className="inline-flex items-center justify-center p-1 rounded-lg transition-colors duration-150 hover:bg-[var(--bg-card-hover)]"
                  >
                    <MessageCircle
                      size={18}
                      className={hasFeedback ? "text-[var(--color-primary)]" : "text-[var(--text-muted)] opacity-40"}
                    />
                  </Link>
                </td>

                {/* Kế hoạch icon */}
                <td className="py-3.5 px-2 align-middle text-center">
                  <button
                    onClick={() => onClickPlan(goal)}
                    title={hasPlan ? "Xem/Sửa kế hoạch" : "Thêm kế hoạch"}
                    className="bg-transparent border-none cursor-pointer p-1 rounded-lg inline-flex items-center justify-center transition-colors duration-150 hover:bg-[var(--bg-card-hover)]"
                  >
                    <Link2
                      size={18}
                      className={hasPlan ? "text-[var(--color-success)]" : "text-[var(--text-muted)] opacity-40"}
                    />
                  </button>
                </td>

                {/* Check-in icon */}
                <td className="py-3.5 px-2 align-middle text-center">
                  <Link
                    href={`/dashboard/checkins?goalId=${goal.id}`}
                    title="Check-in"
                    className="inline-flex items-center justify-center p-1 rounded-lg transition-colors duration-150 hover:bg-[var(--bg-card-hover)]"
                  >
                    <ClipboardCheck
                      size={18}
                      className={hasCheckin ? "text-[var(--color-success)]" : "text-[var(--text-muted)] opacity-40"}
                    />
                  </Link>
                </td>

                {/* Tiến độ */}
                <td className="py-3.5 px-2 align-middle">
                  <ProgressBar pct={pct} endDate={goal.endDate} />
                </td>

                {/* Mức độ tự tin */}
                <td className="py-3.5 px-2 align-middle text-center">
                  {confidence && confidenceIcons[confidence] ? (
                    <span className="text-xl">{confidenceIcons[confidence].icon}</span>
                  ) : (
                    <span className="text-[var(--text-muted)] text-xs">—</span>
                  )}
                </td>

                {/* Ngày check-in */}
                <td className="py-3.5 px-2 align-middle text-center">
                  {checkinDate ? (
                    <span className="text-[0.8125rem] text-[var(--text-secondary)] font-medium">
                      {checkinDate}
                    </span>
                  ) : (
                    <span className="text-[var(--color-danger)] text-xs font-medium">
                      Chưa check-in
                    </span>
                  )}
                </td>

                {/* Thao tác hoặc Người sở hữu */}
                {!isReadOnly ? (
                  <td className="py-3.5 px-2 align-middle text-center">
                    <div className="flex gap-1.5 justify-center">
                      <Link
                        href={`/dashboard/checkins?goalId=${goal.id}`}
                        title="Check-in"
                        className="w-[30px] h-[30px] rounded-lg flex items-center justify-center bg-emerald-500/10 text-[var(--color-success)] no-underline"
                      >
                        <CheckCircle2 size={16} />
                      </Link>
                      <Link
                        href={`/dashboard/goals/${goal.id}`}
                        title="Chi tiết"
                        className="w-[30px] h-[30px] rounded-lg flex items-center justify-center bg-primary/10 text-[var(--color-primary)] no-underline"
                      >
                        <Settings size={16} />
                      </Link>
                    </div>
                  </td>
                ) : (
                  <td className="py-3.5 px-2 align-middle">
                    <span className="text-[0.8125rem] font-medium text-[var(--text-secondary)]">
                      {goal.owner.name}
                    </span>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ===== DROPDOWN FILTER COMPONENT =====
function FilterDropdown({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (val: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 py-[7px] px-3 rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-primary)] text-[0.8125rem] font-medium cursor-pointer whitespace-nowrap transition-colors duration-150 hover:bg-[var(--bg-card-hover)]"
      >
        {selected?.label || label}
        <ChevronDown size={14} className="text-[var(--text-muted)]" />
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-[49]"
            onClick={() => setOpen(false)}
          />
          <div className="absolute top-[calc(100%+4px)] right-0 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg shadow-lg z-50 min-w-[160px] max-h-60 overflow-y-auto">
            {options.map((opt) => (
              <button
                key={opt.value}
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                className={`block w-full py-2 px-3.5 border-none text-[0.8125rem] cursor-pointer text-left transition-colors duration-150 hover:bg-[var(--bg-card-hover)] ${
                  value === opt.value
                    ? "bg-primary/[0.08] text-[var(--color-primary)] font-semibold"
                    : "bg-transparent text-[var(--text-primary)] font-normal"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ===== PERIOD LABELS =====
const periodLabels: Record<string, string> = {
  YEAR: "Năm",
  QUARTER: "Quý",
  MONTH: "Tháng",
  WEEK: "Tuần",
};

// ===== MAIN COMPONENT =====
export default function CheckinPageClient({
  myGoals,
  subGoals,
  currentUserId,
  currentUserName,
}: Props) {
  const router = useRouter();
  const [filter, setFilter] = useState<"mine" | "subordinate">("mine");
  const [cycleFilter, setCycleFilter] = useState("ALL");
  const [periodFilter, setPeriodFilter] = useState("ALL");
  const [ownerFilter, setOwnerFilter] = useState("ALL");
  const [planModal, setPlanModal] = useState<GoalCheckin | null>(null);

  const baseGoals = filter === "mine" ? myGoals : subGoals;

  // Tạo danh sách chu kỳ từ dữ liệu
  const cycleOptions = [
    { value: "ALL", label: "Tất cả chu kỳ" },
    ...Array.from(new Set(baseGoals.map((g) => g.period)))
      .map((p) => ({ value: p, label: periodLabels[p] || p })),
  ];

  // Lọc theo chu kỳ trước
  const afterCycleGoals =
    cycleFilter === "ALL"
      ? baseGoals
      : baseGoals.filter((g) => g.period === cycleFilter);

  // Tạo danh sách thời gian từ dữ liệu đã lọc
  const periodOptions = [
    { value: "ALL", label: "Tất cả thời gian" },
    ...Array.from(
      new Set(
        afterCycleGoals.map(
          (g) => g.cycleValue || `${periodLabels[g.period] || g.period} ${new Date(g.startDate).getFullYear()}`
        )
      )
    ).map((p) => ({ value: p, label: p })),
  ];

  // Lọc theo thời gian
  const afterPeriodGoals =
    periodFilter === "ALL"
      ? afterCycleGoals
      : afterCycleGoals.filter((g) => {
          const val =
            g.cycleValue ||
            `${periodLabels[g.period] || g.period} ${new Date(g.startDate).getFullYear()}`;
          return val === periodFilter;
        });

  // Tạo danh sách người sở hữu (chỉ cần khi xem cấp dưới)
  const ownerOptions = [
    { value: "ALL", label: "Tất cả người" },
    ...Array.from(
      new Map(afterPeriodGoals.map((g) => [g.owner.id, g.owner.name]))
    ).map(([id, name]) => ({ value: String(id), label: name })),
  ];

  // Lọc theo người sở hữu
  const displayGoals =
    ownerFilter === "ALL"
      ? afterPeriodGoals
      : afterPeriodGoals.filter((g) => String(g.owner.id) === ownerFilter);

  // Tên hiển thị
  const ownerName =
    filter === "mine"
      ? currentUserName
      : ownerFilter !== "ALL"
      ? ownerOptions.find((o) => o.value === ownerFilter)?.label || "Cấp dưới"
      : "Cấp dưới";

  const periodText =
    periodFilter !== "ALL" ? periodFilter : cycleFilter !== "ALL" ? periodLabels[cycleFilter] : "";

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">Check-in</h1>
        <p className="page-subtitle">Danh sách mục tiêu check-in</p>
      </div>

      {/* Card */}
      <div className="card-static animate-fade-in">
        {/* Title row + Filters */}
        <div className="flex justify-between items-center mb-5 flex-wrap gap-3">
          {/* Title */}
          <div>
            <h2 className="text-base font-bold text-[var(--text-primary)]">
              Mục tiêu cá nhân của{" "}
              <span className="text-[var(--color-primary)]">{ownerName}</span>
              {filter === "mine" && (
                <span className="text-[var(--text-muted)] font-normal"> (tôi)</span>
              )}
            </h2>
            {periodText && (
              <p className="text-[0.8125rem] text-[var(--text-muted)] mt-0.5">
                {periodText}
              </p>
            )}
          </div>

          {/* Filter bar */}
          <div className="flex gap-2 items-center flex-wrap">
            {/* Của tôi / Cấp dưới */}
            <FilterDropdown
              label="Của tôi"
              options={[
                { value: "mine", label: "Của tôi" },
                { value: "subordinate", label: "Của cấp dưới" },
              ]}
              value={filter}
              onChange={(v) => {
                setFilter(v as "mine" | "subordinate");
                setCycleFilter("ALL");
                setPeriodFilter("ALL");
                setOwnerFilter("ALL");
              }}
            />

            {/* Chu kỳ */}
            <FilterDropdown
              label="Tất cả chu kỳ"
              options={cycleOptions}
              value={cycleFilter}
              onChange={(v) => {
                setCycleFilter(v);
                setPeriodFilter("ALL");
              }}
            />

            {/* Thời gian */}
            <FilterDropdown
              label="Tất cả thời gian"
              options={periodOptions}
              value={periodFilter}
              onChange={setPeriodFilter}
            />

            {/* Người sở hữu (chỉ khi xem cấp dưới) */}
            {filter === "subordinate" && (
              <FilterDropdown
                label={currentUserName}
                options={ownerOptions}
                value={ownerFilter}
                onChange={setOwnerFilter}
              />
            )}
          </div>
        </div>

        {/* Table */}
        <GoalCheckinTable
          goals={displayGoals}
          isReadOnly={filter === "subordinate"}
          onClickPlan={(goal) => setPlanModal(goal)}
        />
      </div>

      {/* Plan URL Modal */}
      {planModal && (
        <PlanUrlModal
          goal={planModal}
          onClose={() => setPlanModal(null)}
          onSuccess={() => {
            setPlanModal(null);
            router.refresh();
          }}
        />
      )}
    </div>
  );
}
