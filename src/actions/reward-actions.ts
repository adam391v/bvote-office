"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// ==================== LẤY DANH SÁCH PHẦN THƯỞNG ====================

export async function getRewards() {
  return prisma.reward.findMany({
    where: { isActive: true, quantity: { gt: 0 } },
    orderBy: { starCost: "asc" },
  });
}

// ==================== LẤY SỐ SAO HIỆN TẠI ====================

export async function getUserStars() {
  const session = await auth();
  if (!session?.user) return 0;

  const stars = await prisma.userStars.findUnique({
    where: { userId: parseInt(session.user.id) },
  });

  return stars?.totalStars ?? 0;
}

// ==================== LẤY LỊCH SỬ SAO ====================

export async function getStarHistory() {
  const session = await auth();
  if (!session?.user) return [];

  return prisma.starTransaction.findMany({
    where: { userId: parseInt(session.user.id) },
    orderBy: { createdAt: "desc" },
    take: 20,
  });
}

// ==================== ĐỔI THƯỞNG ====================

export async function redeemRewardAction(rewardId: number) {
  const session = await auth();
  if (!session?.user) return { error: "Chưa đăng nhập" };

  const userId = parseInt(session.user.id);

  // Kiểm tra phần thưởng
  const reward = await prisma.reward.findUnique({
    where: { id: rewardId },
  });

  if (!reward || !reward.isActive) {
    return { error: "Phần thưởng không tồn tại hoặc đã hết hạn" };
  }

  if (reward.quantity <= 0) {
    return { error: "Phần thưởng đã hết hàng" };
  }

  // Kiểm tra đủ sao
  const userStars = await prisma.userStars.findUnique({
    where: { userId },
  });

  if (!userStars || userStars.totalStars < reward.starCost) {
    return { error: `Bạn cần ${reward.starCost} sao, hiện có ${userStars?.totalStars ?? 0} sao` };
  }

  // Thực hiện đổi thưởng trong transaction
  await prisma.$transaction(async (tx) => {
    // Trừ sao
    await tx.userStars.update({
      where: { userId },
      data: { totalStars: { decrement: reward.starCost } },
    });

    // Giảm số lượng quà
    await tx.reward.update({
      where: { id: rewardId },
      data: { quantity: { decrement: 1 } },
    });

    // Ghi nhận lịch sử đổi
    await tx.redemption.create({
      data: {
        userId,
        rewardId,
        quantity: 1,
        status: "PENDING",
      },
    });

    // Ghi nhận giao dịch sao
    await tx.starTransaction.create({
      data: {
        userId,
        amount: -reward.starCost,
        reason: `Đổi thưởng: ${reward.name}`,
        referenceId: rewardId,
        type: "SPENT",
      },
    });
  });

  revalidatePath("/dashboard/rewards");
  return { success: true };
}

// ==================== LẤY LỊCH SỬ ĐỔI THƯỞNG ====================

export async function getRedemptions() {
  const session = await auth();
  if (!session?.user) return [];

  return prisma.redemption.findMany({
    where: { userId: parseInt(session.user.id) },
    include: {
      reward: { select: { name: true, starCost: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}
