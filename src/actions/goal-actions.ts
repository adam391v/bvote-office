"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { goalSchema } from "@/lib/validations";
import { revalidatePath } from "next/cache";

// ==================== TẠO MỤC TIÊU ====================

export async function createGoalAction(data: any) {
  const session = await auth();
  if (!session?.user) return { error: "Chưa đăng nhập" };

  try {
    const isTransparent = !data.followerIds || data.followerIds.length === 0;

    const goal = await prisma.goal.create({
      data: {
        title: data.title,
        description: data.description || null,
        metric: data.metric,
        targetValue: Number(data.targetValue),
        currentValue: 0,
        unit: data.unit,
        period: data.period, // Enum GoalPeriod
        cycleValue: data.cycleValue || null,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        minTargetValue: data.minTargetValue ? Number(data.minTargetValue) : null,
        tags: Array.isArray(data.tags) ? data.tags.join(",") : (data.tags || null),
        departmentId: data.departmentId ? Number(data.departmentId) : null,
        isTransparent: isTransparent, // Logic: Trống người theo dõi = pubic
        ownerId: parseInt(session.user.id),
        
        // Connect arrays if present
        followers: data.followerIds && data.followerIds.length > 0 ? {
          connect: data.followerIds.map((id: number) => ({ id }))
        } : undefined,

        participants: data.participantIds && data.participantIds.length > 0 ? {
          connect: data.participantIds.map((id: number) => ({ id }))
        } : undefined,
      },
    });

    // Liên kết mục tiêu (cha)
    if (data.parentGoalId) {
      await prisma.goalLink.create({
        data: {
          goalId: goal.id,
          parentGoalId: Number(data.parentGoalId),
        },
      });
    }

    revalidatePath("/dashboard/goals");
    return { success: true, goalId: goal.id };
  } catch (error: any) {
    console.error("Lỗi tạo mục tiêu:", error);
    return { error: "Lỗi hệ thống khi tạo mục tiêu. Vui lòng thử lại." };
  }
}


// ==================== CẬP NHẬT MỤC TIÊU ====================

export async function updateGoalAction(goalId: number, formData: FormData) {
  const session = await auth();
  if (!session?.user) return { error: "Chưa đăng nhập" };

  const raw = {
    title: formData.get("title") as string,
    description: formData.get("description") as string,
    metric: formData.get("metric") as string,
    targetValue: formData.get("targetValue") as string,
    unit: formData.get("unit") as string,
    period: formData.get("period") as string,
    startDate: formData.get("startDate") as string,
    endDate: formData.get("endDate") as string,
  };

  const parsed = goalSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues?.[0]?.message || "Dữ liệu không hợp lệ" };
  }

  await prisma.goal.update({
    where: { id: goalId },
    data: {
      title: parsed.data.title,
      description: parsed.data.description,
      metric: parsed.data.metric,
      targetValue: parsed.data.targetValue,
      unit: parsed.data.unit,
      period: parsed.data.period,
      startDate: new Date(parsed.data.startDate),
      endDate: new Date(parsed.data.endDate),
    },
  });

  revalidatePath("/dashboard/goals");
  return { success: true };
}

// ==================== XÓA MỤC TIÊU ====================

export async function deleteGoalAction(goalId: number) {
  const session = await auth();
  if (!session?.user) return { error: "Chưa đăng nhập" };

  await prisma.goal.delete({
    where: { id: goalId },
  });

  revalidatePath("/dashboard/goals");
  return { success: true };
}

// ==================== LẤY DANH SÁCH MỤC TIÊU ====================

export async function getGoals() {
  const session = await auth();
  if (!session?.user) return [];

  const userId = parseInt(session.user.id);
  const role = session.user.role;

  // Admin/Manager xem tất cả, Employee chỉ xem của mình
  const where =
    role === "ADMIN" || role === "MANAGER" ? {} : { ownerId: userId };

  return prisma.goal.findMany({
    where,
    include: {
      owner: { select: { id: true, name: true, email: true } },
      checkins: { orderBy: { createdAt: "desc" }, take: 1 },
      milestones: true,
      parentLinks: {
        include: {
          parentGoal: { select: { id: true, title: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

// ==================== LẤY CHI TIẾT MỤC TIÊU ====================

export async function getGoalById(goalId: number) {
  return prisma.goal.findUnique({
    where: { id: goalId },
    include: {
      owner: { select: { id: true, name: true, email: true, role: true } },
      department: { select: { id: true, name: true } },
      followers: { select: { id: true, name: true, avatar: true } },
      participants: { select: { id: true, name: true, avatar: true } },
      checkins: {
        include: {
          detail: true,
          owner: { select: { id: true, name: true } },
          manager: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: "desc" },
      },
      milestones: { orderBy: { value: "asc" } },
      parentLinks: {
        include: {
          parentGoal: { select: { id: true, title: true, ownerId: true, owner: { select: { name: true } } } },
        },
      },
      childLinks: {
        include: {
          goal: { select: { id: true, title: true, currentValue: true, targetValue: true } },
        },
      },
    },
  });
}
// ==================== DỮ LIỆU FORM TRỢ GIÚP ====================

export async function getGoalFormData() {
  const session = await auth();
  if (!session?.user) return null;

  const [users, departments, goals] = await Promise.all([
    prisma.user.findMany({ select: { id: true, name: true, email: true } }),
    prisma.department.findMany({ select: { id: true, name: true } }),
    prisma.goal.findMany({ 
      select: { id: true, title: true, ownerId: true },
      // Lấy tất cả hoặc chỉ của người dùng (tùy vào "Liên kết mục tiêu của tôi / Khác")
    }),
  ]);

  return { users, departments, goals };
}
