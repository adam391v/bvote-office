"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// ==================== HELPERS ====================

async function requireAdmin() {
  const session = await auth();
  if (!session?.user) throw new Error("Chưa đăng nhập");
  if ((session.user as { role: string }).role !== "ADMIN") {
    throw new Error("Bạn không có quyền truy cập");
  }
  return session.user;
}

// ==================== ADMIN STATS ====================

export async function getAdminStats() {
  await requireAdmin();

  const [
    totalUsers,
    totalGoals,
    totalCheckins,
    totalFeedbacks,
    totalRewards,
    totalDepartments,
    usersByRole,
    recentUsers,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.goal.count(),
    prisma.checkin.count(),
    prisma.feedback.count(),
    prisma.reward.count(),
    prisma.department.count(),
    prisma.user.groupBy({
      by: ["role"],
      _count: { id: true },
    }),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { department: true, stars: true },
    }),
  ]);

  const roleCounts = {
    ADMIN: usersByRole.find((r) => r.role === "ADMIN")?._count.id || 0,
    MANAGER: usersByRole.find((r) => r.role === "MANAGER")?._count.id || 0,
    EMPLOYEE: usersByRole.find((r) => r.role === "EMPLOYEE")?._count.id || 0,
  };

  return {
    totalUsers,
    totalGoals,
    totalCheckins,
    totalFeedbacks,
    totalRewards,
    totalDepartments,
    roleCounts,
    recentUsers,
  };
}

// ==================== USER MANAGEMENT ====================

export async function getUsers() {
  await requireAdmin();
  return prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      department: true,
      stars: true,
      _count: {
        select: {
          goals: true,
          checkinsOwned: true,
          feedbacksSent: true,
        },
      },
    },
  });
}

export async function getUserById(id: number) {
  await requireAdmin();
  return prisma.user.findUnique({
    where: { id },
    include: {
      department: true,
      stars: true,
      goals: { take: 5, orderBy: { createdAt: "desc" } },
      checkinsOwned: { take: 5, orderBy: { createdAt: "desc" }, include: { goal: true } },
    },
  });
}

interface UpdateUserInput {
  name: string;
  email: string;
  role: "ADMIN" | "MANAGER" | "EMPLOYEE";
  departmentId: number | null;
}

export async function updateUserAction(userId: number, input: UpdateUserInput) {
  await requireAdmin();

  try {
    await prisma.user.update({
      where: { id: userId },
      data: {
        name: input.name,
        email: input.email,
        role: input.role,
        departmentId: input.departmentId,
      },
    });
    revalidatePath("/dashboard/admin/users");
    return { success: true };
  } catch {
    return { error: "Không thể cập nhật người dùng" };
  }
}

export async function deleteUserAction(userId: number) {
  await requireAdmin();

  try {
    await prisma.user.delete({ where: { id: userId } });
    revalidatePath("/dashboard/admin/users");
    return { success: true };
  } catch {
    return { error: "Không thể xóa người dùng" };
  }
}

export async function resetPasswordAction(userId: number, newPassword: string) {
  await requireAdmin();
  const bcrypt = await import("bcryptjs");
  const hashed = await bcrypt.hash(newPassword, 12);

  try {
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashed },
    });
    return { success: true };
  } catch {
    return { error: "Không thể đặt lại mật khẩu" };
  }
}

// ==================== DEPARTMENT MANAGEMENT ====================

export async function getDepartments() {
  await requireAdmin();
  return prisma.department.findMany({
    orderBy: { name: "asc" },
    include: {
      manager: { select: { id: true, name: true, email: true } },
      _count: { select: { users: true } },
    },
  });
}

/// Lấy danh sách user (id, name, email) để hiển thị trong dropdown chọn quản lý
export async function getUsersForSelect() {
  await requireAdmin();
  return prisma.user.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, email: true, role: true },
  });
}

interface DepartmentInput {
  name: string;
  managerId: number | null;
}

export async function createDepartmentAction(input: DepartmentInput) {
  await requireAdmin();

  if (!input.name || input.name.trim().length < 2) {
    return { error: "Tên phòng ban ít nhất 2 ký tự" };
  }

  try {
    await prisma.department.create({
      data: {
        name: input.name.trim(),
        managerId: input.managerId,
      },
    });
    revalidatePath("/dashboard/admin/departments");
    return { success: true };
  } catch {
    return { error: "Không thể tạo phòng ban" };
  }
}

export async function updateDepartmentAction(id: number, input: DepartmentInput) {
  await requireAdmin();

  if (!input.name || input.name.trim().length < 2) {
    return { error: "Tên phòng ban ít nhất 2 ký tự" };
  }

  try {
    await prisma.department.update({
      where: { id },
      data: {
        name: input.name.trim(),
        managerId: input.managerId,
      },
    });
    revalidatePath("/dashboard/admin/departments");
    return { success: true };
  } catch {
    return { error: "Không thể cập nhật phòng ban" };
  }
}

export async function deleteDepartmentAction(id: number) {
  await requireAdmin();

  // Kiểm tra phòng ban còn nhân viên
  const count = await prisma.user.count({ where: { departmentId: id } });
  if (count > 0) {
    return { error: `Phòng ban còn ${count} nhân viên, không thể xóa` };
  }

  try {
    await prisma.department.delete({ where: { id } });
    revalidatePath("/dashboard/admin/departments");
    return { success: true };
  } catch {
    return { error: "Không thể xóa phòng ban" };
  }
}

// ==================== REWARD MANAGEMENT ====================

export async function getAdminRewards() {
  await requireAdmin();
  return prisma.reward.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { redemptions: true } },
    },
  });
}

interface RewardInput {
  name: string;
  description?: string;
  starCost: number;
  quantity: number;
  isActive: boolean;
}

export async function createRewardAction(input: RewardInput) {
  await requireAdmin();

  if (!input.name || input.name.trim().length < 2) {
    return { error: "Tên phần thưởng ít nhất 2 ký tự" };
  }
  if (input.starCost <= 0) {
    return { error: "Số sao phải > 0" };
  }

  try {
    await prisma.reward.create({
      data: {
        name: input.name.trim(),
        description: input.description?.trim() || null,
        starCost: input.starCost,
        quantity: input.quantity,
        isActive: input.isActive,
      },
    });
    revalidatePath("/dashboard/admin/rewards");
    return { success: true };
  } catch {
    return { error: "Không thể tạo phần thưởng" };
  }
}

export async function updateRewardAction(id: number, input: RewardInput) {
  await requireAdmin();

  try {
    await prisma.reward.update({
      where: { id },
      data: {
        name: input.name.trim(),
        description: input.description?.trim() || null,
        starCost: input.starCost,
        quantity: input.quantity,
        isActive: input.isActive,
      },
    });
    revalidatePath("/dashboard/admin/rewards");
    return { success: true };
  } catch {
    return { error: "Không thể cập nhật phần thưởng" };
  }
}

export async function deleteRewardAction(id: number) {
  await requireAdmin();

  try {
    await prisma.reward.delete({ where: { id } });
    revalidatePath("/dashboard/admin/rewards");
    return { success: true };
  } catch {
    return { error: "Không thể xóa phần thưởng" };
  }
}

export async function toggleRewardAction(id: number) {
  await requireAdmin();

  const reward = await prisma.reward.findUnique({ where: { id } });
  if (!reward) return { error: "Không tìm thấy phần thưởng" };

  await prisma.reward.update({
    where: { id },
    data: { isActive: !reward.isActive },
  });
  revalidatePath("/dashboard/admin/rewards");
  return { success: true };
}

// ==================== PENDING REDEMPTIONS ====================

export async function getPendingRedemptions() {
  await requireAdmin();
  return prisma.redemption.findMany({
    where: { status: "PENDING" },
    orderBy: { createdAt: "desc" },
    include: {
      user: true,
      reward: true,
    },
  });
}

export async function approveRedemptionAction(id: number) {
  await requireAdmin();
  try {
    await prisma.redemption.update({
      where: { id },
      data: { status: "APPROVED" },
    });
    revalidatePath("/dashboard/admin");
    return { success: true };
  } catch {
    return { error: "Không thể duyệt" };
  }
}

export async function rejectRedemptionAction(id: number) {
  await requireAdmin();

  const redemption = await prisma.redemption.findUnique({
    where: { id },
    include: { reward: true },
  });
  if (!redemption) return { error: "Không tìm thấy" };

  // Hoàn sao khi từ chối
  await prisma.$transaction([
    prisma.redemption.update({
      where: { id },
      data: { status: "REJECTED" },
    }),
    prisma.userStars.update({
      where: { userId: redemption.userId },
      data: { totalStars: { increment: redemption.reward.starCost } },
    }),
    prisma.reward.update({
      where: { id: redemption.rewardId },
      data: { quantity: { increment: 1 } },
    }),
    prisma.starTransaction.create({
      data: {
        userId: redemption.userId,
        amount: redemption.reward.starCost,
        reason: `Hoàn sao - Từ chối đổi thưởng: ${redemption.reward.name}`,
        type: "EARNED",
      },
    }),
  ]);

  revalidatePath("/dashboard/admin");
  return { success: true };
}

// ==================== GOAL METRICS ====================

export async function getGoalMetrics() {
  const session = await auth();
  if (!session?.user) throw new Error("Chưa đăng nhập");
  return prisma.goalMetric.findMany({ orderBy: { createdAt: "desc" } });
}

export async function createGoalMetricAction(data: { name: string; unit: string }) {
  await requireAdmin();
  if (!data.name || !data.unit) return { error: "Vui lòng điền đủ thông tin" };

  try {
    const existing = await prisma.goalMetric.findUnique({ where: { name: data.name } });
    if (existing) return { error: "Loại mục tiêu đã tồn tại" };

    await prisma.goalMetric.create({ data });
    revalidatePath("/dashboard/admin/metrics");
    revalidatePath("/dashboard/goals/create");
    return { success: true };
  } catch {
    return { error: "Có lỗi xảy ra" };
  }
}

export async function updateGoalMetricAction(id: number, data: { name: string; unit: string }) {
  await requireAdmin();
  if (!data.name || !data.unit) return { error: "Vui lòng điền đủ thông tin" };

  try {
    await prisma.goalMetric.update({
      where: { id },
      data,
    });
    revalidatePath("/dashboard/admin/metrics");
    revalidatePath("/dashboard/goals/create");
    return { success: true };
  } catch {
    return { error: "Có lỗi xảy ra hoặc loại mục tiêu đã tồn tại" };
  }
}

export async function deleteGoalMetricAction(id: number) {
  await requireAdmin();
  try {
    await prisma.goalMetric.delete({ where: { id } });
    revalidatePath("/dashboard/admin/metrics");
    revalidatePath("/dashboard/goals/create");
    return { success: true };
  } catch {
    return { error: "Có lỗi xảy ra" };
  }
}
