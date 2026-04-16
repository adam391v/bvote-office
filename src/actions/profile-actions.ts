"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";

export async function changePasswordAction(currentPassword: string, newPassword: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "Bạn chưa đăng nhập" };
    }

    const userId = Number(session.user.id);
    const user = await prisma.user.findUnique({ where: { id: userId } });
    
    if (!user) {
      return { error: "Không tìm thấy người dùng" };
    }

    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      return { error: "Mật khẩu hiện tại không đúng" };
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });

    return { success: true };
  } catch (error: any) {
    console.error("changePasswordAction error:", error);
    return { error: "Lỗi lưu thay đổi. Vui lòng thử lại sau." };
  }
}
