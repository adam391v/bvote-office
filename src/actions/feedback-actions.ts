"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// ==================== TẠO YÊU CẦU PHẢN HỒI ====================

interface CreateFeedbackRequestData {
  category: "GOAL" | "CULTURE" | "PROJECT" | "WORK";
  subject: string;
  message: string;
  recipientIds: number[];
  goalId?: number;
  checkinId?: number;
}

export async function createFeedbackRequestAction(data: CreateFeedbackRequestData) {
  const session = await auth();
  if (!session?.user) return { error: "Chưa đăng nhập" };

  try {
    const request = await prisma.feedbackRequest.create({
      data: {
        fromUserId: parseInt(session.user.id),
        category: data.category,
        subject: data.subject,
        message: data.message,
        goalId: data.goalId || null,
        checkinId: data.checkinId || null,
        recipients: {
          create: data.recipientIds.map((userId) => ({
            userId,
          })),
        },
      },
    });

    revalidatePath("/dashboard/feedbacks");
    return { success: true, requestId: request.id };
  } catch (error) {
    console.error("Lỗi tạo yêu cầu phản hồi:", error);
    return { error: "Lỗi hệ thống khi tạo yêu cầu phản hồi." };
  }
}

// ==================== GỬI PHẢN HỒI ====================

interface SendFeedbackData {
  toUserId: number;
  requestId?: number;
  checkinId?: number;
  performanceRate: number;
  effortRate: number;
  criteria?: string;
  criteriaStars?: number;
  comments: string;
  category?: "GOAL" | "CULTURE" | "PROJECT" | "WORK";
}

export async function sendFeedbackAction(data: SendFeedbackData) {
  const session = await auth();
  if (!session?.user) return { error: "Chưa đăng nhập" };

  try {
    // Tính tổng sao = hiệu suất + nỗ lực + tiêu chí
    const totalStars = (data.performanceRate || 0) + (data.effortRate || 0) + (data.criteriaStars || 0);

    await prisma.feedback.create({
      data: {
        fromUserId: parseInt(session.user.id),
        toUserId: data.toUserId,
        checkinId: data.checkinId || null,
        requestId: data.requestId || null,
        performanceRate: data.performanceRate,
        effortRate: data.effortRate,
        criteria: data.criteria || null,
        criteriaStars: data.criteriaStars || null,
        rating: totalStars,
        comments: data.comments,
        type: "GENERAL",
        category: data.category || "GOAL",
      },
    });

    // Đánh dấu đã reply nếu từ FeedbackRequest
    if (data.requestId) {
      await prisma.feedbackRequestRecipient.updateMany({
        where: {
          requestId: data.requestId,
          userId: parseInt(session.user.id),
        },
        data: {
          hasReplied: true,
          repliedAt: new Date(),
        },
      });

      // Kiểm tra đã tất cả reply chưa -> cập nhật status
      const remaining = await prisma.feedbackRequestRecipient.count({
        where: { requestId: data.requestId, hasReplied: false },
      });
      if (remaining === 0) {
        await prisma.feedbackRequest.update({
          where: { id: data.requestId },
          data: { status: "COMPLETED" },
        });
      }
    }

    revalidatePath("/dashboard/feedbacks");
    return { success: true };
  } catch (error) {
    console.error("Lỗi gửi phản hồi:", error);
    return { error: "Lỗi hệ thống khi gửi phản hồi." };
  }
}

// ==================== LẤY LỊCH SỬ PHẢN HỒI ====================

export async function getFeedbackHistory() {
  const session = await auth();
  if (!session?.user) return null;
  const userId = parseInt(session.user.id);

  const [received, sent] = await Promise.all([
    // Phản hồi nhận được
    prisma.feedback.findMany({
      where: { toUserId: userId },
      include: {
        fromUser: { select: { id: true, name: true, avatar: true } },
        toUser: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    // Phản hồi gửi đi
    prisma.feedback.findMany({
      where: { fromUserId: userId },
      include: {
        fromUser: { select: { id: true, name: true } },
        toUser: { select: { id: true, name: true, avatar: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return { received, sent };
}

// ==================== LẤY LỊCH SỬ YÊU CẦU PHẢN HỒI ====================

export async function getFeedbackRequests() {
  const session = await auth();
  if (!session?.user) return null;
  const userId = parseInt(session.user.id);

  const [requestsSent, requestsReceived] = await Promise.all([
    // Yêu cầu gửi đi (tôi nhờ phản hồi)
    prisma.feedbackRequest.findMany({
      where: { fromUserId: userId },
      include: {
        fromUser: { select: { id: true, name: true } },
        recipients: {
          include: { user: { select: { id: true, name: true } } },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    // Yêu cầu nhận được (được nhờ phản hồi)
    prisma.feedbackRequest.findMany({
      where: {
        recipients: { some: { userId: userId } },
      },
      include: {
        fromUser: { select: { id: true, name: true, avatar: true } },
        recipients: {
          where: { userId: userId },
          select: { hasReplied: true },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return { requestsSent, requestsReceived };
}

// ==================== LẤY DANH SÁCH USERS CHO SELECT ====================

export async function getFeedbackFormData() {
  const session = await auth();
  if (!session?.user) return null;

  const [users, goals] = await Promise.all([
    prisma.user.findMany({
      where: { id: { not: parseInt(session.user.id) } },
      select: { id: true, name: true, email: true },
    }),
    prisma.goal.findMany({
      select: {
        id: true,
        title: true,
        metric: true,
        targetValue: true,
        unit: true,
        period: true,
        cycleValue: true,
        owner: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return { users, goals };
}
