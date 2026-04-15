"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Plus,
  Target,
  Calendar,
  TrendingUp,
  ChevronDown,
} from "lucide-react";

// ===== TYPES =====
interface Goal {
  id: number;
  title: string;
  description: string | null;
  metric: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  period: string;
  cycleValue: string | null;
  startDate: string;
  endDate: string;
  status: string;
  tags: string | null;
  owner: { id: number; name: string };
  parentLinks: { parentGoal: { id: number; title: string } }[];
}

interface Props {
  goals: Goal[];
  currentUserName: string;
}

// ===== PERIOD LABELS =====
const periodLabels: Record<string, string> = {
  YEAR: "Năm",
  QUARTER: "Quý",
  MONTH: "Tháng",
  WEEK: "Tuần",
};

// ===== DROPDOWN FILTER =====
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
                    ? "bg-indigo-500/[0.08] text-[var(--color-primary)] font-semibold"
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

// ===== MAIN =====
export default function GoalsPageClient({ goals, currentUserName }: Props) {
  const [cycleFilter, setCycleFilter] = useState("ALL");
  const [periodFilter, setPeriodFilter] = useState("ALL");
  const [ownerFilter, setOwnerFilter] = useState("ALL");

  // Tạo chu kỳ options
  const cycleOptions = useMemo(
    () => [
      { value: "ALL", label: "Tất cả chu kỳ" },
      ...Array.from(new Set(goals.map((g) => g.period))).map((p) => ({
        value: p,
        label: periodLabels[p] || p,
      })),
    ],
    [goals]
  );

  // Lọc theo chu kỳ
  const afterCycle =
    cycleFilter === "ALL"
      ? goals
      : goals.filter((g) => g.period === cycleFilter);

  // Tạo thời gian options
  const periodOptions = useMemo(
    () => [
      { value: "ALL", label: "Tất cả thời gian" },
      ...Array.from(
        new Set(
          afterCycle.map(
            (g) =>
              g.cycleValue ||
              `${periodLabels[g.period] || g.period} ${new Date(
                g.startDate
              ).getFullYear()}`
          )
        )
      ).map((p) => ({ value: p, label: p })),
    ],
    [afterCycle]
  );

  // Lọc theo thời gian
  const afterPeriod =
    periodFilter === "ALL"
      ? afterCycle
      : afterCycle.filter((g) => {
          const val =
            g.cycleValue ||
            `${periodLabels[g.period] || g.period} ${new Date(
              g.startDate
            ).getFullYear()}`;
          return val === periodFilter;
        });

  // Tạo owner options
  const ownerOptions = useMemo(
    () => [
      { value: "ALL", label: "Tất cả người" },
      ...Array.from(
        new Map(afterPeriod.map((g) => [g.owner.id, g.owner.name]))
      ).map(([id, name]) => ({ value: String(id), label: name })),
    ],
    [afterPeriod]
  );

  // Lọc theo người
  const displayGoals =
    ownerFilter === "ALL"
      ? afterPeriod
      : afterPeriod.filter((g) => String(g.owner.id) === ownerFilter);

  // Tên hiển thị
  const ownerName =
    ownerFilter !== "ALL"
      ? ownerOptions.find((o) => o.value === ownerFilter)?.label ||
        currentUserName
      : currentUserName;

  const periodText =
    periodFilter !== "ALL"
      ? periodFilter
      : cycleFilter !== "ALL"
      ? periodLabels[cycleFilter]
      : "";

  return (
    <div>
      {/* Header */}
      <div className="page-header flex justify-between items-center">
        <div>
          <h1 className="page-title">Mục tiêu</h1>
          <p className="page-subtitle">Quản lý và theo dõi tất cả mục tiêu</p>
        </div>
        <Link href="/dashboard/goals/create" className="btn btn-primary">
          <Plus size={18} />
          Tạo mục tiêu
        </Link>
      </div>

      {/* Filter bar */}
      <div className="flex justify-between items-center mb-5 flex-wrap gap-3 p-4 bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)]">
        {/* Title */}
        <div>
          <h2 className="text-base font-bold text-[var(--text-primary)]">
            Mục tiêu cá nhân của{" "}
            <span className="text-[var(--color-primary)]">{ownerName}</span>
            <span className="text-[var(--text-muted)] font-normal"> (tôi)</span>
          </h2>
          {periodText && (
            <p className="text-[0.8125rem] text-[var(--text-muted)] mt-0.5">
              {periodText}
            </p>
          )}
        </div>

        {/* Filters */}
        <div className="flex gap-2 items-center flex-wrap">
          <FilterDropdown
            label="Tất cả chu kỳ"
            options={cycleOptions}
            value={cycleFilter}
            onChange={(v) => {
              setCycleFilter(v);
              setPeriodFilter("ALL");
            }}
          />
          <FilterDropdown
            label="Tất cả thời gian"
            options={periodOptions}
            value={periodFilter}
            onChange={setPeriodFilter}
          />
          <FilterDropdown
            label={currentUserName}
            options={ownerOptions}
            value={ownerFilter}
            onChange={setOwnerFilter}
          />
        </div>
      </div>

      {/* Goals Grid */}
      {displayGoals.length === 0 ? (
        <div className="card-static p-16 text-center">
          <div className="empty-state">
            <Target size={48} className="text-[var(--text-muted)] mb-4" />
            <h3 className="font-semibold mb-2">
              {goals.length === 0
                ? "Chưa có mục tiêu nào"
                : "Không tìm thấy mục tiêu phù hợp"}
            </h3>
            <p className="text-[var(--text-secondary)] mb-6">
              {goals.length === 0
                ? "Bắt đầu bằng việc tạo mục tiêu đầu tiên cho bạn hoặc đội ngũ"
                : "Thử thay đổi bộ lọc để xem các mục tiêu khác"}
            </p>
            {goals.length === 0 && (
              <Link href="/dashboard/goals/create" className="btn btn-primary">
                <Plus size={18} />
                Tạo mục tiêu đầu tiên
              </Link>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {displayGoals.map((goal, i) => {
            const progress =
              goal.targetValue > 0
                ? Math.min(100, Math.round((goal.currentValue / goal.targetValue) * 100))
                : 0;
            const progressColor =
              progress >= 80
                ? "progress-fill-success"
                : progress >= 40
                ? "progress-fill-warning"
                : progress > 0
                ? ""
                : "progress-fill-danger";
            const statusBadge =
              goal.status === "COMPLETED"
                ? "badge-success"
                : goal.status === "OVERDUE"
                ? "badge-danger"
                : goal.status === "CANCELLED"
                ? "badge-warning"
                : "badge-primary";
            const statusLabel =
              goal.status === "COMPLETED"
                ? "Hoàn thành"
                : goal.status === "OVERDUE"
                ? "Quá hạn"
                : goal.status === "CANCELLED"
                ? "Đã hủy"
                : "Đang thực hiện";

            return (
              <Link
                key={goal.id}
                href={`/dashboard/goals/${goal.id}`}
                className={`card animate-fade-in stagger-${(i % 4) + 1} opacity-0 no-underline !text-inherit`}
              >
                {/* Top */}
                <div className="flex justify-between items-start mb-4">
                  <div className="w-10 h-10 rounded-lg bg-indigo-500/[0.12] flex items-center justify-center text-[var(--color-primary)]">
                    <Target size={20} />
                  </div>
                  <span className={`badge ${statusBadge}`}>{statusLabel}</span>
                </div>

                {/* Title */}
                <h3 className="font-semibold text-base mb-2 leading-snug">
                  {goal.title}
                </h3>

                {/* Meta */}
                <div className="flex gap-4 text-xs text-[var(--text-muted)] mb-4">
                  <span className="flex items-center gap-1">
                    <Calendar size={12} />
                    {goal.cycleValue || periodLabels[goal.period] || goal.period}
                  </span>
                  <span className="flex items-center gap-1">
                    <TrendingUp size={12} />
                    {goal.metric}
                  </span>
                </div>

                {/* Progress */}
                <div className="progress-bar mb-2">
                  <div
                    className={`progress-fill ${progressColor}`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="flex justify-between text-[0.8125rem]">
                  <span className="text-[var(--text-secondary)]">
                    {goal.currentValue} / {goal.targetValue} {goal.unit}
                  </span>
                  <span
                    className={`font-semibold ${
                      progress >= 80 ? "text-[var(--color-success)]" : "text-[var(--text-primary)]"
                    }`}
                  >
                    {progress}%
                  </span>
                </div>

                {/* Owner */}
                <div className="mt-4 pt-3 border-t border-[var(--border-color)] flex items-center gap-2 text-[0.8125rem] text-[var(--text-muted)]">
                  <div className="gradient-bg w-6 h-6 rounded-full flex items-center justify-center text-[0.625rem] font-semibold text-white">
                    {goal.owner.name.charAt(0).toUpperCase()}
                  </div>
                  {goal.owner.name}
                  {goal.parentLinks.length > 0 && (
                    <span className="badge badge-info ml-auto text-[0.6875rem]">
                      Liên kết: {goal.parentLinks[0].parentGoal.title}
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
