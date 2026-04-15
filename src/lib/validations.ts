import { z } from "zod";

// ==================== AUTH ====================

export const loginSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu tối thiểu 6 ký tự"),
});

export const registerSchema = z
  .object({
    name: z.string().min(2, "Tên tối thiểu 2 ký tự"),
    email: z.string().email("Email không hợp lệ"),
    password: z.string().min(6, "Mật khẩu tối thiểu 6 ký tự"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
  });

// ==================== GOAL ====================

export const goalSchema = z.object({
  title: z.string().min(3, "Tiêu đề tối thiểu 3 ký tự"),
  description: z.string().optional(),
  metric: z.string().min(1, "Chỉ số đo không được trống"),
  targetValue: z.coerce.number().positive("Giá trị mục tiêu phải lớn hơn 0"),
  unit: z.string().min(1, "Đơn vị không được trống"),
  period: z.enum(["YEAR", "QUARTER", "MONTH", "WEEK"]),
  startDate: z.string().min(1, "Ngày bắt đầu không được trống"),
  endDate: z.string().min(1, "Ngày kết thúc không được trống"),
  parentGoalId: z.coerce.number().optional(),
});

// ==================== CHECKIN ====================

export const checkinSchema = z.object({
  goalId: z.coerce.number(),
  progressPct: z.coerce.number().min(0).max(100),
  confidence: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
  speed: z.enum(["SLOW", "NORMAL", "FAST"]).optional(),
  effort: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
  progressNote: z.string().min(10, "Ghi chú tiến độ tối thiểu 10 ký tự"),
  issue: z.string().min(5, "Mô tả vấn đề tối thiểu 5 ký tự"),
  cause: z.string().min(5, "Nguyên nhân tối thiểu 5 ký tự"),
  solution: z.string().min(5, "Giải pháp tối thiểu 5 ký tự"),
});

// ==================== FEEDBACK ====================

export const feedbackSchema = z.object({
  toUserId: z.coerce.number(),
  rating: z.coerce.number().min(1).max(5),
  comments: z.string().min(10, "Nhận xét tối thiểu 10 ký tự"),
  type: z.enum(["POSITIVE", "CONSTRUCTIVE", "GENERAL"]).default("GENERAL"),
  checkinId: z.coerce.number().optional(),
});

// ==================== TYPES ====================

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type GoalInput = z.infer<typeof goalSchema>;
export type CheckinInput = z.infer<typeof checkinSchema>;
export type FeedbackInput = z.infer<typeof feedbackSchema>;
