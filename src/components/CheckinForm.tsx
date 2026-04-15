"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createCheckinAction } from "@/actions/checkin-actions";
import { Button, Input, Textarea, Select } from "@/components/ui";
import type { SelectOption } from "@/components/ui";
import { Send } from "lucide-react";

const confidenceOptions: SelectOption[] = [
  { value: "LOW", label: "Thấp" },
  { value: "MEDIUM", label: "Trung bình" },
  { value: "HIGH", label: "Cao" },
];

const speedOptions: SelectOption[] = [
  { value: "SLOW", label: "Chậm" },
  { value: "NORMAL", label: "Bình thường" },
  { value: "FAST", label: "Nhanh" },
];

const effortOptions: SelectOption[] = [
  { value: "LOW", label: "Thấp" },
  { value: "MEDIUM", label: "Trung bình" },
  { value: "HIGH", label: "Cao" },
];

const checkinSchema = z.object({
  goalId: z.string().min(1, "Vui lòng chọn mục tiêu"),
  progressPct: z.string().min(1, "Vui lòng nhập tiến độ"),
  progressNote: z.string().min(5, "Ít nhất 5 ký tự"),
  issue: z.string().min(5, "Ít nhất 5 ký tự"),
  cause: z.string().min(5, "Ít nhất 5 ký tự"),
  solution: z.string().min(5, "Ít nhất 5 ký tự"),
  confidence: z.string().optional(),
  speed: z.string().optional(),
  effort: z.string().optional(),
});

type CheckinFormData = z.infer<typeof checkinSchema>;

interface CheckinFormProps {
  goals: { id: number; title: string }[];
  selectedGoalId?: number;
}

export default function CheckinForm({ goals, selectedGoalId }: CheckinFormProps) {
  const [success, setSuccess] = useState(false);

  const goalOptions: SelectOption[] = goals.map((g) => ({
    value: String(g.id),
    label: g.title,
  }));

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<CheckinFormData>({
    resolver: zodResolver(checkinSchema),
    defaultValues: {
      goalId: selectedGoalId ? String(selectedGoalId) : "",
    },
  });

  const onSubmit = async (data: CheckinFormData) => {
    setSuccess(false);

    const formData = new FormData();
    formData.set("goalId", data.goalId);
    formData.set("progressPct", String(data.progressPct));
    formData.set("progressNote", data.progressNote);
    formData.set("issue", data.issue);
    formData.set("cause", data.cause);
    formData.set("solution", data.solution);
    if (data.confidence) formData.set("confidence", data.confidence);
    if (data.speed) formData.set("speed", data.speed);
    if (data.effort) formData.set("effort", data.effort);

    const result = await createCheckinAction(formData);
    if (result?.error) {
      setError("root", { message: result.error });
    } else {
      setSuccess(true);
      reset();
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {errors.root?.message && (
        <div className="alert alert-error">{errors.root.message}</div>
      )}
      {success && (
        <div className="alert alert-success">
          ✅ Check-in thành công! Bạn nhận được +2 ⭐
        </div>
      )}

      <div className="flex flex-col gap-4">
        {/* Goal */}
        <Controller
          name="goalId"
          control={control}
          render={({ field }) => (
            <Select
              id="goalId"
              label="Mục tiêu *"
              options={goalOptions}
              value={goalOptions.find((o) => o.value === field.value) || null}
              onChange={(opt) => field.onChange(opt?.value || "")}
              error={errors.goalId?.message}
              placeholder="Tìm kiếm mục tiêu..."
              isSearchable
            />
          )}
        />

        {/* Progress */}
        <Input
          id="progressPct"
          label="Tiến độ hoàn thành (%) *"
          type="number"
          min={0}
          max={100}
          placeholder="Ví dụ: 60"
          error={errors.progressPct?.message}
          {...register("progressPct")}
        />

        {/* 4 câu hỏi vàng */}
        <div className="p-4 bg-primary/[0.06] rounded-xl border border-primary/15">
          <p className="font-semibold text-sm mb-4 text-primary">
            📋 4 Câu hỏi Check-in
          </p>

          <div className="flex flex-col gap-3">
            <Textarea
              id="progressNote"
              label="📈 1. Tiến độ hiện tại như thế nào? *"
              placeholder="Mô tả tiến độ công việc hiện tại..."
              rows={2}
              error={errors.progressNote?.message}
              {...register("progressNote")}
            />

            <Textarea
              id="issue"
              label="⚠️ 2. Vấn đề / Rủi ro gặp phải? *"
              placeholder="Những khó khăn, rủi ro đang gặp..."
              rows={2}
              error={errors.issue?.message}
              {...register("issue")}
            />

            <Textarea
              id="cause"
              label="🔍 3. Nguyên nhân gốc rễ? *"
              placeholder="Phân tích nguyên nhân cốt lõi..."
              rows={2}
              error={errors.cause?.message}
              {...register("cause")}
            />

            <Textarea
              id="solution"
              label="💡 4. Giải pháp đề xuất? *"
              placeholder="Đề xuất giải pháp cụ thể..."
              rows={2}
              error={errors.solution?.message}
              {...register("solution")}
            />
          </div>
        </div>

        {/* Self-rating */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Controller
            name="confidence"
            control={control}
            render={({ field }) => (
              <Select
                id="confidence"
                label="Tự tin"
                options={confidenceOptions}
                value={confidenceOptions.find((o) => o.value === field.value) || null}
                onChange={(opt) => field.onChange(opt?.value || "")}
                isClearable
                placeholder="Chọn..."
              />
            )}
          />
          <Controller
            name="speed"
            control={control}
            render={({ field }) => (
              <Select
                id="speed"
                label="Tốc độ"
                options={speedOptions}
                value={speedOptions.find((o) => o.value === field.value) || null}
                onChange={(opt) => field.onChange(opt?.value || "")}
                isClearable
                placeholder="Chọn..."
              />
            )}
          />
          <Controller
            name="effort"
            control={control}
            render={({ field }) => (
              <Select
                id="effort"
                label="Nỗ lực"
                options={effortOptions}
                value={effortOptions.find((o) => o.value === field.value) || null}
                onChange={(opt) => field.onChange(opt?.value || "")}
                isClearable
                placeholder="Chọn..."
              />
            )}
          />
        </div>

        {/* Submit */}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          loading={isSubmitting}
          icon={<Send size={18} />}
          className="w-full"
        >
          Gửi Check-in
        </Button>
      </div>
    </form>
  );
}
