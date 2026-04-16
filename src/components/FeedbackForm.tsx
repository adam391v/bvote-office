"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "react-hot-toast";
import { sendFeedbackAction } from "@/actions/feedback-actions";
import { Button, Textarea, Select } from "@/components/ui";
import type { SelectOption } from "@/components/ui";
import { Send, Star } from "lucide-react";

const typeOptions: SelectOption[] = [
  { value: "POSITIVE", label: "✨ Tích cực (Khen ngợi)" },
  { value: "CONSTRUCTIVE", label: "💡 Góp ý xây dựng" },
  { value: "GENERAL", label: "💬 Chung" },
];

const feedbackSchema = z.object({
  toUserId: z.string().min(1, "Vui lòng chọn người nhận"),
  type: z.string().min(1, "Vui lòng chọn loại phản hồi"),
  rating: z.number().min(1, "Vui lòng đánh giá sao").max(5),
  comments: z.string().min(10, "Nhận xét ít nhất 10 ký tự"),
});

type FeedbackFormData = z.infer<typeof feedbackSchema>;

interface FeedbackFormProps {
  users: { id: number; name: string; role: string }[];
}

export default function FeedbackForm({ users }: FeedbackFormProps) {
  const [hoverRating, setHoverRating] = useState(0);

  const userOptions: SelectOption[] = users.map((u) => ({
    value: String(u.id),
    label: `${u.name} (${u.role === "ADMIN" ? "Admin" : u.role === "MANAGER" ? "Quản lý" : "Nhân viên"})`,
  }));

  const {
    handleSubmit,
    control,
    reset,
    register,
    watch,
    setValue,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<FeedbackFormData>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      type: "POSITIVE",
      rating: 0,
    },
  });

  const currentRating = watch("rating");

  const onSubmit = async (data: FeedbackFormData) => {
    const formData = new FormData();
    formData.set("toUserId", data.toUserId);
    formData.set("type", data.type);
    formData.set("rating", String(data.rating));
    formData.set("comments", data.comments);

    const result = await sendFeedbackAction({
      toUserId: Number(data.toUserId),
      comments: data.comments,
      performanceRate: data.rating,
      effortRate: data.rating,
      category: data.type as any,
    });
    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success("✅ Phản hồi đã gửi! Bạn nhận được +1 ⭐");
      reset();
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="flex flex-col gap-4">
        {/* To User */}
        <Select
          id="toUserId"
          label="Gửi đến *"
          options={userOptions}
          value={userOptions.find((o) => o.value === watch("toUserId")) || null}
          onChange={(opt) => setValue("toUserId", opt?.value?.toString() || "")}
          error={errors.toUserId?.message}
          placeholder="Tìm kiếm người nhận..."
          isSearchable
        />

        {/* Type */}
        <Select
          id="type"
          label="Loại phản hồi *"
          options={typeOptions}
          value={typeOptions.find((o) => o.value === watch("type")) || null}
          onChange={(opt) => setValue("type", opt?.value?.toString() || "")}
          error={errors.type?.message}
        />

        {/* Star Rating */}
        <div className="form-group">
          <label className="form-label">Đánh giá sao *</label>
          <div className="star-rating mt-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setValue("rating", star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className={`star bg-transparent border-none p-0.5 cursor-pointer ${star <= (hoverRating || currentRating) ? "active" : ""}`}
              >
                <Star
                  size={24}
                  fill={star <= (hoverRating || currentRating) ? "#f59e0b" : "transparent"}
                  color={star <= (hoverRating || currentRating) ? "#f59e0b" : "currentColor"}
                />
              </button>
            ))}
          </div>
          {errors.rating?.message && (
            <p className="form-error">{errors.rating.message}</p>
          )}
        </div>

        {/* Comments */}
        <Textarea
          id="comments"
          label="Nhận xét chi tiết *"
          placeholder="Viết nhận xét cụ thể, mang tính xây dựng..."
          rows={4}
          error={errors.comments?.message}
          {...register("comments")}
        />

        {/* Submit */}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          loading={isSubmitting}
          icon={<Send size={18} />}
          className="w-full"
        >
          Gửi phản hồi
        </Button>
      </div>
    </form>
  );
}
