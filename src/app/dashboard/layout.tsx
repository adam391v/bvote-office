import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import DashboardShell from "@/components/DashboardShell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  // Lấy số sao hiện tại
  const userStars = await prisma.userStars.findUnique({
    where: { userId: parseInt(session.user.id) },
  });

  return (
    <DashboardShell
      userName={session.user.name || "User"}
      userRole={session.user.role || "EMPLOYEE"}
      userStars={userStars?.totalStars ?? 0}
    >
      {children}
    </DashboardShell>
  );
}
