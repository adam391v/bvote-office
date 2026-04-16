import { getGoalMetrics } from "@/actions/admin-actions";
import GoalMetricActions from "@/components/GoalMetricActions";
import { Settings } from "lucide-react";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AdminMetricsPage() {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    redirect("/dashboard");
  }

  const metrics = await getGoalMetrics();

  return (
    <div>
      <div className="page-header mb-6">
        <h1 className="page-title flex items-center gap-2">
          <Settings size={28} className="text-[var(--color-primary)]" />
          Cấu hình Loại mục tiêu
        </h1>
        <p className="page-subtitle">Quản lý danh mục loại mục tiêu và đơn vị đo lường tương ứng</p>
      </div>

      <div className="card-static animate-fade-in w-full max-w-5xl">
        <GoalMetricActions metrics={metrics} />
      </div>
    </div>
  );
}
