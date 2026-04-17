import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(req: NextRequest) {
  // Kiểm tra session cookie (next-auth v5 sử dụng authjs)
  const token =
    req.cookies.get("authjs.session-token") ||
    req.cookies.get("__Secure-authjs.session-token");
  const isLoggedIn = !!token;

  const { pathname } = req.nextUrl;
  const isHome = pathname === "/";
  const isOnDashboard = pathname.startsWith("/dashboard");
  const isOnAuth =
    pathname.startsWith("/login") || pathname.startsWith("/register");

  // Trang chủ: redirect theo trạng thái đăng nhập
  if (isHome) {
    return NextResponse.redirect(
      new URL(isLoggedIn ? "/dashboard" : "/login", req.nextUrl)
    );
  }

  // Chuyển hướng nếu người dùng chưa đăng nhập
  if (isOnDashboard && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  // Chuyển hướng nếu đã đăng nhập mà vào trang auth
  if (isOnAuth && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/dashboard/:path*", "/login", "/register"],
};
