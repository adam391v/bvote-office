"use server";

import bcrypt from "bcryptjs";
import { signIn } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { loginSchema, registerSchema } from "@/lib/validations";

// ==================== ĐĂNG KÝ ====================

interface RegisterInput {
  name: string;
  email: string;
  password: string;
  confirmPassword?: string;
}

export async function registerAction(input: RegisterInput | FormData) {
  const raw =
    input instanceof FormData
      ? {
          name: input.get("name") as string,
          email: input.get("email") as string,
          password: input.get("password") as string,
          confirmPassword: input.get("confirmPassword") as string,
        }
      : input;

  const parsed = registerSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues?.[0]?.message || "Dữ liệu không hợp lệ" };
  }

  // Kiểm tra email đã tồn tại
  const existingUser = await prisma.user.findUnique({
    where: { email: parsed.data.email },
  });
  if (existingUser) {
    return { error: "Email đã được sử dụng" };
  }

  // Hash mật khẩu và tạo user
  const hashedPassword = await bcrypt.hash(parsed.data.password, 12);
  const user = await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      password: hashedPassword,
      role: "EMPLOYEE",
    },
  });

  // Tạo bản ghi sao cho user mới
  await prisma.userStars.create({
    data: { userId: user.id, totalStars: 0 },
  });

  return { success: true };
}

// ==================== ĐĂNG NHẬP ====================

interface LoginInput {
  email: string;
  password: string;
}

export async function loginAction(input: LoginInput | FormData) {
  const raw =
    input instanceof FormData
      ? {
          email: input.get("email") as string,
          password: input.get("password") as string,
        }
      : input;

  const parsed = loginSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues?.[0]?.message || "Dữ liệu không hợp lệ" };
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: "/dashboard",
    });
    return { success: true };
  } catch (error: unknown) {
    // NextAuth redirect errors khi signIn thành công
    if (
      error &&
      typeof error === "object" &&
      "digest" in error &&
      typeof (error as { digest: unknown }).digest === "string" &&
      (error as { digest: string }).digest.includes("NEXT_REDIRECT")
    ) {
      throw error;
    }
    return { error: "Email hoặc mật khẩu không đúng" };
  }
}
