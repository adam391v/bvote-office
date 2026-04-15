import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getGoals } from "@/actions/goal-actions";
import GoalsPageClient from "./GoalsPageClient";

export default async function GoalsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const goals = await getGoals();

  return (
    <GoalsPageClient
      goals={JSON.parse(JSON.stringify(goals))}
      currentUserName={session.user.name || "Tôi"}
    />
  );
}
