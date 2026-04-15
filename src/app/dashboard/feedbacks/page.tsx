import { getFeedbackHistory, getFeedbackRequests, getFeedbackFormData } from "@/actions/feedback-actions";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import FeedbackPageClient from "./FeedbackPageClient";

export default async function FeedbacksPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const [history, requests, formData] = await Promise.all([
    getFeedbackHistory(),
    getFeedbackRequests(),
    getFeedbackFormData(),
  ]);

  // Serialize Date objects thành string để truyền qua Client Component
  const serializedHistory = history
    ? {
        received: JSON.parse(JSON.stringify(history.received)),
        sent: JSON.parse(JSON.stringify(history.sent)),
      }
    : null;

  const serializedRequests = requests
    ? {
        requestsSent: JSON.parse(JSON.stringify(requests.requestsSent)),
        requestsReceived: JSON.parse(JSON.stringify(requests.requestsReceived)),
      }
    : null;

  return (
    <FeedbackPageClient
      feedbackHistory={serializedHistory}
      feedbackRequests={serializedRequests}
      users={formData?.users || []}
      goals={formData?.goals || []}
      currentUserId={Number(session.user.id)}
    />
  );
}
