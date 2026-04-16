"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "react-hot-toast";
import { registerAction } from "@/actions/auth-actions";
import { Button, Input } from "@/components/ui";
import { UserPlus, Mail, Lock, User, Target } from "lucide-react";
import Link from "next/link";
import ThemeToggle from "@/components/ui/ThemeToggle";

const registerSchema = z
  .object({
    name: z.string().min(2, "Tên ít nhất 2 ký tự"),
    email: z.string().email("Email không hợp lệ"),
    password: z.string().min(6, "Mật khẩu ít nhất 6 ký tự"),
    confirmPassword: z.string().min(1, "Vui lòng xác nhận mật khẩu"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
  });

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterForm) => {
    const result = await registerAction({
      name: data.name,
      email: data.email,
      password: data.password,
    });
    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success("Đăng ký thành công! Vui lòng đăng nhập.");
      router.push("/login");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8 relative">
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>

      <div className="card-static animate-fade-in w-full max-w-[420px] !p-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="gradient-bg w-14 h-14 rounded-xl inline-flex items-center justify-center mb-4">
            <Target size={28} color="white" />
          </div>
          <h1 className="text-2xl font-bold">
            Đăng ký <span className="gradient-text">Bvote</span>
          </h1>
          <p className="text-[var(--text-secondary)] mt-1.5 text-sm">
            Tạo tài khoản để bắt đầu
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-col gap-4">
            <Input
              id="name"
              label="Họ tên"
              icon={<User size={14} />}
              placeholder="Nguyễn Văn A"
              error={errors.name?.message}
              {...register("name")}
            />

            <Input
              id="email"
              label="Email"
              icon={<Mail size={14} />}
              type="email"
              placeholder="you@company.com"
              error={errors.email?.message}
              {...register("email")}
            />

            <Input
              id="password"
              label="Mật khẩu"
              icon={<Lock size={14} />}
              type="password"
              placeholder="Ít nhất 6 ký tự"
              error={errors.password?.message}
              {...register("password")}
            />

            <Input
              id="confirmPassword"
              label="Xác nhận mật khẩu"
              icon={<Lock size={14} />}
              type="password"
              placeholder="Nhập lại mật khẩu"
              error={errors.confirmPassword?.message}
              {...register("confirmPassword")}
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={isSubmitting}
              icon={<UserPlus size={18} />}
              className="w-full mt-2"
            >
              Đăng ký
            </Button>
          </div>
        </form>

        <p className="text-center mt-6 text-sm text-[var(--text-secondary)]">
          Đã có tài khoản?{" "}
          <Link
            href="/login"
            className="text-[var(--color-primary-light)] font-medium no-underline hover:underline"
          >
            Đăng nhập
          </Link>
        </p>
      </div>
    </div>
  );
}
