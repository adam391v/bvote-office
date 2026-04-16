import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import ThemeProvider from "@/components/ui/ThemeProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bvote - Quản lý Hiệu suất Liên tục",
  description:
    "Nền tảng quản lý hiệu suất liên tục: thiết lập mục tiêu, check-in 1:1, phản hồi 360° và gamification",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <ThemeProvider>
          {children}
          <Toaster position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
