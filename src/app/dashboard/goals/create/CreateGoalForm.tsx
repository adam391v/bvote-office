"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { createGoalAction } from "@/actions/goal-actions";
import { Button, Input, Select, DatePicker } from "@/components/ui";
import type { SelectOption } from "@/components/ui";
import { Save, Layers } from "lucide-react";
import Link from "next/link";
import ReactSelect from "react-select";
import CreatableSelect from "react-select/creatable";

const periodOptions: SelectOption[] = [
  { value: "QUARTER", label: "Chu kỳ theo quý" },
  { value: "MONTH", label: "Chu kỳ theo tháng" },
  { value: "YEAR", label: "Chu kỳ theo năm" },
];

const yearOptions: SelectOption[] = [
  { value: "2024", label: "Năm 2024" },
  { value: "2025", label: "Năm 2025" },
  { value: "2026", label: "Năm 2026" },
];

const quarterOptions: SelectOption[] = [
  { value: "Q1", label: "Quý 1" },
  { value: "Q2", label: "Quý 2" },
  { value: "Q3", label: "Quý 3" },
  { value: "Q4", label: "Quý 4" },
];

// Shared react-select theme styles
const reactSelectStyles = {
  control: (base: any) => ({
    ...base,
    backgroundColor: "var(--bg-input)",
    borderColor: "var(--border-color)",
    minHeight: 42,
  }),
  menu: (base: any) => ({ ...base, backgroundColor: "var(--bg-card)", zIndex: 100 }),
  option: (base: any, state: any) => ({
    ...base,
    backgroundColor: state.isFocused ? "var(--bg-card-hover)" : "transparent",
    color: "var(--text-primary)",
  }),
  multiValue: (base: any) => ({
    ...base,
    backgroundColor: "rgba(99, 102, 241, 0.15)",
    borderRadius: 4,
  }),
  multiValueLabel: (base: any) => ({
    ...base,
    color: "var(--primary-light)",
    fontSize: "0.8125rem",
    fontWeight: 500,
  }),
};

const followerSelectStyles = {
  ...reactSelectStyles,
  multiValue: (base: any) => ({
    ...base,
    backgroundColor: "rgba(16, 185, 129, 0.15)",
    borderRadius: 4,
  }),
  multiValueLabel: (base: any) => ({
    ...base,
    color: "var(--success)",
    fontSize: "0.8125rem",
    fontWeight: 500,
  }),
};

interface Props {
  users: { id: number; name: string; email: string }[];
  departments: { id: number; name: string }[];
  goals: { id: number; title: string; ownerId: number }[];
  currentUserId: number;
}

export default function CreateGoalForm({ users, departments, goals, currentUserId }: Props) {
  const router = useRouter();
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const myGoals = goals.filter((g) => g.ownerId === currentUserId).map(g => ({ value: g.id, label: g.title }));
  const otherGoals = goals.filter((g) => g.ownerId !== currentUserId).map(g => ({ value: g.id, label: g.title }));
  const deptOptions = departments.map(d => ({ value: d.id, label: d.name }));
  const userOptions = users.map(u => ({ value: u.id, label: u.name }));

  const { register, handleSubmit, control, watch, setValue } = useForm({
    defaultValues: {
      period: "QUARTER",
      yearStr: new Date().getFullYear().toString(),
      quarterStr: `Q${Math.floor((new Date().getMonth() + 3) / 3)}`,
      title: "",
      metric: "",
      targetValue: "",
      unit: "Tỷ",
      minTargetValue: "",
      myParentId: "",
      otherParentId: "",
      startDate: new Date(),
      endDate: new Date(new Date().setMonth(new Date().getMonth() + 3)),
      departmentId: "",
      tags: [] as any[],
      participantIds: [] as number[],
      followerIds: [] as number[],
    },
  });

  const periodWatch = watch("period");
  const targetValueWatch = watch("targetValue");
  const minTargetWatch = watch("minTargetValue");

  const onSubmit = async (data: any) => {
    setLoading(true);
    setServerError("");

    const cycleValue = `${data.yearStr} - ${periodWatch === "QUARTER" ? data.quarterStr : periodWatch}`;
    const parentGoalId = data.myParentId ? Number(data.myParentId) : (data.otherParentId ? Number(data.otherParentId) : null);

    const payload = {
      ...data,
      cycleValue,
      parentGoalId,
      departmentId: data.departmentId ? Number(data.departmentId) : null,
      tags: data.tags.map((t: any) => t.value),
    };

    const res = await createGoalAction(payload);
    if (res?.error) {
      setServerError(res.error);
      setLoading(false);
    } else {
      router.push("/dashboard/goals");
    }
  };

  return (
    <div className="card-static animate-fade-in !p-0 overflow-hidden">
      <div className="px-6 py-5 border-b border-[var(--border-color)] flex items-center gap-2">
        <Layers size={18} className="text-[var(--color-primary)]" />
        <h2 className="font-semibold text-lg">Tạo mục tiêu</h2>
      </div>

      {serverError && <div className="alert alert-error mx-4 mt-4">{serverError}</div>}

      <form onSubmit={handleSubmit(onSubmit)} className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

          {/* CỘT TRÁI - CHI TIẾT MỤC TIÊU */}
          <div className="flex flex-col gap-5">
            <Controller
              name="period"
              control={control}
              render={({ field }) => (
                <Select id="period" label="Chọn loại chu kỳ *" options={periodOptions} value={periodOptions.find(o => o.value === field.value)} onChange={(opt) => field.onChange(opt?.value)} />
              )}
            />

            <div className="flex gap-4">
              <div className="flex-1">
                <Controller
                  name="yearStr"
                  control={control}
                  render={({ field }) => (
                    <Select id="yearStr" label="Chọn năm *" options={yearOptions} value={yearOptions.find(o => o.value === field.value)} onChange={(opt) => field.onChange(opt?.value)} />
                  )}
                />
              </div>
              {periodWatch === "QUARTER" && (
                <div className="flex-1">
                  <Controller
                    name="quarterStr"
                    control={control}
                    render={({ field }) => (
                      <Select id="quarterStr" label="Chọn chu kỳ *" options={quarterOptions} value={quarterOptions.find(o => o.value === field.value)} onChange={(opt) => field.onChange(opt?.value)} />
                    )}
                  />
                </div>
              )}
            </div>

            <Input id="title" label="Tiêu đề mục tiêu *" placeholder="Ví dụ: Hoàn thành MVP Bvote v1.0" {...register("title", { required: true })} />

            <div className="flex gap-4">
              <div className="flex-[2]">
                <Input id="metric" label="Loại mục tiêu (Chỉ số) *" placeholder="Doanh thu sản phẩm A" {...register("metric", { required: true })} />
              </div>
              <div className="flex-1">
                <Input id="targetValue" type="number" label="Chỉ tiêu *" placeholder="5" {...register("targetValue", { required: true })} />
              </div>
              <div className="flex-1">
                <Input id="unit" label="Đơn vị" placeholder="Tỷ" {...register("unit")} />
              </div>
            </div>

            {/* Mục tiêu tối thiểu */}
            <div className="bg-[var(--bg-input)] p-4 rounded-lg border border-[var(--border-color)]">
              <div className="flex justify-between items-center mb-2">
                <label className="text-[0.8125rem] font-semibold">Đánh dấu mốc mục tiêu tối thiểu (Tùy chọn)</label>
                <div className="w-[100px]">
                  <Input id="minTargetValue" type="number" placeholder="0" {...register("minTargetValue")} className="!py-1 !px-2 !h-[30px] text-[0.8125rem]" />
                </div>
              </div>
              <input
                type="range"
                className="w-full accent-[var(--color-primary)] "
                min="0"
                max={targetValueWatch || 100}
                value={minTargetWatch || 0}
                onChange={(e) => setValue("minTargetValue", e.target.value)}
              />
              <div className="flex justify-between text-[0.7rem] text-[var(--text-muted)] mt-1">
                <span>0%</span>
                <span>{targetValueWatch ? "100%" : "Mới: Hãy điền chỉ tiêu trước"}</span>
              </div>
            </div>

            <Controller
              name="myParentId"
              control={control}
              render={({ field }) => (
                <Select id="myParentId" label="Liên kết với mục tiêu của tôi" placeholder="-- Chọn mục tiêu của tôi --" options={myGoals} value={myGoals.find(o => String(o.value) === String(field.value)) || null} onChange={(opt) => field.onChange(opt?.value || "")} />
              )}
            />

            <Controller
              name="otherParentId"
              control={control}
              render={({ field }) => (
                <Select id="otherParentId" label="Liên kết với mục tiêu khác" placeholder="-- Chọn mục tiêu của người khác --" options={otherGoals} value={otherGoals.find(o => String(o.value) === String(field.value)) || null} onChange={(opt) => field.onChange(opt?.value || "")} />
              )}
            />

            <div className="flex gap-4">
              <div className="flex-1">
                <Controller
                  name="startDate"
                  control={control}
                  render={({ field }) => (
                    <DatePicker id="startDate" label="Thời gian bắt đầu" selected={field.value} onChange={(d) => field.onChange(d)} />
                  )}
                />
              </div>
              <div className="flex-1">
                <Controller
                  name="endDate"
                  control={control}
                  render={({ field }) => (
                    <DatePicker id="endDate" label="Thời gian kết thúc" selected={field.value} onChange={(d) => field.onChange(d)} />
                  )}
                />
              </div>
            </div>
          </div>

          {/* CỘT PHẢI - PHÂN QUYỀN & MỞ RỘNG */}
          <div className="flex flex-col gap-5 lg:border-l lg:border-[var(--border-color)] lg:pl-10">
            <Controller
              name="departmentId"
              control={control}
              render={({ field }) => (
                <Select id="departmentId" label="Chọn phòng ban/ bộ phận" placeholder="-- Chọn phòng ban/ bộ phận --" options={deptOptions} value={deptOptions.find(o => String(o.value) === String(field.value)) || null} onChange={(opt) => field.onChange(opt?.value || "")} />
              )}
            />

            <div>
              <label className="block mb-1.5 text-[0.8125rem] font-semibold text-[var(--text-secondary)]">
                Gắn thẻ
              </label>
              <Controller
                name="tags"
                control={control}
                render={({ field }) => (
                  <CreatableSelect
                    isMulti
                    placeholder="Nhập tên thẻ và ấn Enter..."
                    onChange={(val) => field.onChange(val)}
                    value={field.value}
                    formatCreateLabel={(inputValue) => `Tạo thẻ mới "${inputValue}"`}
                    styles={reactSelectStyles}
                  />
                )}
              />
            </div>

            <div>
              <label className="block mb-1.5 text-[0.8125rem] font-semibold text-[var(--text-secondary)]">
                Người liên quan
              </label>
              <Controller
                name="participantIds"
                control={control}
                render={({ field }) => (
                  <ReactSelect
                    isMulti
                    options={userOptions}
                    placeholder="-- Chọn người liên quan --"
                    onChange={(opts) => field.onChange(opts.map(o => o.value))}
                    styles={reactSelectStyles}
                  />
                )}
              />
            </div>

            <div>
              <label className="block mb-1.5 text-[0.8125rem] font-semibold text-[var(--text-secondary)]">
                Người theo dõi
                <span className="block text-[0.7rem] text-[var(--text-muted)] mt-0.5 font-normal">
                  (Bỏ trống thì tất cả đều thấy mục tiêu, nếu gắn thì chỉ nhóm này mới thấy)
                </span>
              </label>
              <Controller
                name="followerIds"
                control={control}
                render={({ field }) => (
                  <ReactSelect
                    isMulti
                    options={userOptions}
                    placeholder="-- Chọn người theo dõi --"
                    onChange={(opts) => field.onChange(opts.map(o => o.value))}
                    styles={followerSelectStyles}
                  />
                )}
              />
            </div>

            <div className="flex-1" />

            <div className="flex gap-3 border-t border-[var(--border-color)] pt-6">
              <Button type="submit" variant="primary" size="lg" loading={loading} icon={<Save size={18} />}>
                Tạo mục tiêu
              </Button>
              <Link href="/dashboard/goals">
                <Button type="button" variant="secondary" size="lg">Hủy</Button>
              </Link>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
