"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

// ==================== DỮ LIỆU DASHBOARD ====================

export async function getDashboardData() {
  const session = await auth();
  if (!session?.user) return null;

  const userId = parseInt(session.user.id);
  const role = session.user.role;

  // Lấy thông tin cơ bản
  const isAdmin = role === "ADMIN" || role === "MANAGER";
  const goalWhere = isAdmin ? {} : { ownerId: userId };

  // Song song nhiều query
  const [
    totalGoals,
    completedGoals,
    totalCheckins,
    pendingCheckins,
    totalFeedbacks,
    userStars,
    recentGoals,
    recentCheckins,
  ] = await Promise.all([
    prisma.goal.count({ where: goalWhere }),
    prisma.goal.count({
      where: { ...goalWhere, status: "COMPLETED" },
    }),
    prisma.checkin.count({
      where: isAdmin ? {} : { ownerId: userId },
    }),
    prisma.checkin.count({
      where: isAdmin
        ? { status: "PENDING" }
        : { ownerId: userId, status: "PENDING" },
    }),
    prisma.feedback.count({
      where: { toUserId: userId },
    }),
    prisma.userStars.findUnique({
      where: { userId },
    }),
    prisma.goal.findMany({
      where: goalWhere,
      include: {
        owner: { select: { id: true, name: true } },
      },
      orderBy: { updatedAt: "desc" },
      take: 5,
    }),
    prisma.checkin.findMany({
      where: isAdmin ? {} : { ownerId: userId },
      include: {
        goal: { select: { title: true } },
        owner: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  return {
    stats: {
      totalGoals,
      completedGoals,
      goalCompletionRate:
        totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0,
      totalCheckins,
      pendingCheckins,
      totalFeedbacks,
      totalStars: userStars?.totalStars ?? 0,
    },
    recentGoals,
    recentCheckins,
  };
}
