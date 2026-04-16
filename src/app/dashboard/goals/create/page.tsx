import { getGoalFormData } from "@/actions/goal-actions";
import { auth } from "@/lib/auth";
import CreateGoalForm from "./CreateGoalForm";
import { redirect } from "next/navigation";

export default async function CreateGoalPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const formData = await getGoalFormData();
  if (!formData) redirect("/dashboard");

  return (
    <div>
      <div className="page-header mb-6">
        <h1 className="page-title">Tạo mục tiêu</h1>
      </div>

      {/* Client Boundary - Form phức tạp */}
      <CreateGoalForm
        users={formData.users}
        departments={formData.departments}
        goals={formData.goals}
        metrics={formData.metrics}
        currentUserId={Number(session.user.id)}
      />
    </div>
  );
}
