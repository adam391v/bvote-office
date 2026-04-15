"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { checkinSchema } from "@/lib/validations";
import { revalidatePath } from "next/cache";

// ==================== TẠO CHECK-IN ====================

export async function createCheckinAction(formData: FormData) {
  const session = await auth();
  if (!session?.user) return { error: "Chưa đăng nhập" };

  const raw = {
    goalId: formData.get("goalId") as string,
    progressPct: formData.get("progressPct") as string,
    confidence: (formData.get("confidence") as string) || undefined,
    speed: (formData.get("speed") as string) || undefined,
    effort: (formData.get("effort") as string) || undefined,
    progressNote: formData.get("progressNote") as string,
    issue: formData.get("issue") as string,
    cause: formData.get("cause") as string,
    solution: formData.get("solution") as string,
  };

  const parsed = checkinSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues?.[0]?.message || "Dữ liệu không hợp lệ" };
  }

  const userId = parseInt(session.user.id);

  // Lấy thông tin goal để xác định manager
  const goal = await prisma.goal.findUnique({
    where: { id: parsed.data.goalId },
    include: { owner: true },
  });

  if (!goal) return { error: "Mục tiêu không tồn tại" };

  // Tạo checkin + detail trong transaction
  const checkin = await prisma.$transaction(async (tx) => {
    const newCheckin = await tx.checkin.create({
      data: {
        goalId: parsed.data.goalId,
        ownerId: userId,
        progressPct: parsed.data.progressPct,
        confidence: parsed.data.confidence || null,
        speed: parsed.data.speed || null,
        effort: parsed.data.effort || null,
        status: "COMPLETED",
      },
    });

    await tx.checkinDetail.create({
      data: {
        checkinId: newCheckin.id,
        progressNote: parsed.data.progressNote,
        issue: parsed.data.issue,
        cause: parsed.data.cause,
        solution: parsed.data.solution,
      },
    });

    // Cập nhật currentValue trên goal
    await tx.goal.update({
      where: { id: parsed.data.goalId },
      data: {
        currentValue: (goal.targetValue * parsed.data.progressPct) / 100,
      },
    });

    // Thưởng sao cho việc check-in
    await tx.userStars.upsert({
      where: { userId },
      create: { userId, totalStars: 2 },
      update: { totalStars: { increment: 2 } },
    });

    await tx.starTransaction.create({
      data: {
        userId,
        amount: 2,
        reason: "Hoàn thành check-in tuần",
        referenceId: newCheckin.id,
        type: "EARNED",
      },
    });

    return newCheckin;
  });

  revalidatePath("/dashboard/checkins");
  revalidatePath("/dashboard/goals");
  return { success: true, checkinId: checkin.id };
}

// ==================== LẤY DANH SÁCH CHECK-IN ====================

export async function getCheckins(goalId?: number) {
  const session = await auth();
  if (!session?.user) return [];

  const userId = parseInt(session.user.id);
  const role = session.user.role;

  const where: Record<string, unknown> = {};

  if (goalId) where.goalId = goalId;
  if (role === "EMPLOYEE") where.ownerId = userId;

  return prisma.checkin.findMany({
    where,
    include: {
      detail: true,
      goal: { select: { id: true, title: true, metric: true, unit: true } },
      owner: { select: { id: true, name: true, email: true } },
      manager: { select: { id: true, name: true } },
      feedbacks: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

// ==================== MANAGER PHẢN HỒI CHECK-IN ====================

export async function reviewCheckinAction(
  checkinId: number,
  formData: FormData
) {
  const session = await auth();
  if (!session?.user) return { error: "Chưa đăng nhập" };

  const confidence = formData.get("confidence") as string;
  const speed = formData.get("speed") as string;
  const effort = formData.get("effort") as string;
  const comments = formData.get("comments") as string;

  await prisma.$transaction(async (tx) => {
    // Cập nhật checkin
    await tx.checkin.update({
      where: { id: checkinId },
      data: {
        managerId: parseInt(session.user.id),
        confidence: confidence as "LOW" | "MEDIUM" | "HIGH",
        speed: speed as "SLOW" | "NORMAL" | "FAST",
        effort: effort as "LOW" | "MEDIUM" | "HIGH",
        status: "REVIEWED",
      },
    });

    // Tạo feedback nếu có comments
    if (comments && comments.length > 0) {
      const checkin = await tx.checkin.findUnique({
        where: { id: checkinId },
      });

      if (checkin) {
        await tx.feedback.create({
          data: {
            fromUserId: parseInt(session.user.id),
            toUserId: checkin.ownerId,
            checkinId: checkinId,
            comments,
            type: "GENERAL",
          },
        });
      }
    }

    // Thưởng sao cho manager phản hồi
    await tx.userStars.upsert({
      where: { userId: parseInt(session.user.id) },
      create: { userId: parseInt(session.user.id), totalStars: 1 },
      update: { totalStars: { increment: 1 } },
    });
  });

  revalidatePath("/dashboard/checkins");
  return { success: true };
}

// ==================== LẤY MỤC TIÊU CHO TRANG CHECK-IN ====================

export async function getGoalsForCheckin(filter: "mine" | "subordinate" = "mine") {
  const session = await auth();
  if (!session?.user) return [];
  const userId = parseInt(session.user.id);

  if (filter === "mine") {
    return prisma.goal.findMany({
      where: { ownerId: userId },
      include: {
        owner: { select: { id: true, name: true } },
        checkins: {
          orderBy: { createdAt: "desc" },
          take: 1,
          include: { feedbacks: { take: 1 } },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  } else {
    // Mục tiêu cấp dưới: mục tiêu người khác liên kết với mục tiêu của tôi, hoặc tất cả nếu ADMIN/MANAGER
    const isManager = session.user.role === "ADMIN" || session.user.role === "MANAGER";
    return prisma.goal.findMany({
      where: {
        ownerId: { not: userId },
        ...(isManager ? {} : {
          parentLinks: {
            some: { parentGoal: { ownerId: userId } },
          },
        }),
      },
      include: {
        owner: { select: { id: true, name: true } },
        checkins: {
          orderBy: { createdAt: "desc" },
          take: 1,
          include: { feedbacks: { take: 1 } },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }
}

// ==================== CẬP NHẬT LINK KẾ HOẠCH ====================

export async function updateGoalPlanUrlAction(goalId: number, planUrl: string) {
  const session = await auth();
  if (!session?.user) return { error: "Chưa đăng nhập" };

  try {
    await prisma.goal.update({
      where: { id: goalId },
      data: { planUrl: planUrl || null },
    });

    revalidatePath("/dashboard/checkins");
    return { success: true };
  } catch (error) {
    console.error("Lỗi cập nhật kế hoạch:", error);
    return { error: "Lỗi hệ thống" };
  }
}
