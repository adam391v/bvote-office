"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { loginAction } from "@/actions/auth-actions";
import { Button, Input } from "@/components/ui";
import { LogIn, Mail, Lock, Target } from "lucide-react";
import Link from "next/link";
import ThemeToggle from "@/components/ui/ThemeToggle";

const loginSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(1, "Vui lòng nhập mật khẩu"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setServerError("");
    const result = await loginAction(data);
    if (result?.error) {
      setServerError(result.error);
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8 relative">
      {/* Theme Toggle góc phải trên */}
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
            Đăng nhập <span className="gradient-text">Bvote</span>
          </h1>
          <p className="text-[var(--text-secondary)] mt-1.5 text-sm">
            Quản lý hiệu suất liên tục
          </p>
        </div>

        {/* Server Error */}
        {serverError && <div className="alert alert-error">{serverError}</div>}

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-col gap-4">
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
              placeholder="••••••••"
              error={errors.password?.message}
              {...register("password")}
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={isSubmitting}
              icon={<LogIn size={18} />}
              className="w-full mt-2"
            >
              Đăng nhập
            </Button>
          </div>
        </form>

        <p className="text-center mt-6 text-sm text-[var(--text-secondary)]">
          Chưa có tài khoản?{" "}
          <Link
            href="/register"
            className="text-[var(--color-primary-light)] font-medium no-underline hover:underline"
          >
            Đăng ký
          </Link>
        </p>
      </div>
    </div>
  );
}
