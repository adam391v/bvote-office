"use client";

import { useState } from "react";
import { approveRedemptionAction, rejectRedemptionAction } from "@/actions/admin-actions";
import { Button } from "@/components/ui";
import { Check, X } from "lucide-react";

export default function AdminRedemptionActions({ redemptionId }: { redemptionId: number }) {
  const [loading, setLoading] = useState<"approve" | "reject" | null>(null);

  const handleApprove = async () => {
    setLoading("approve");
    await approveRedemptionAction(redemptionId);
    setLoading(null);
  };

  const handleReject = async () => {
    if (!window.confirm("Từ chối sẽ hoàn lại sao cho người dùng. Xác nhận?")) return;
    setLoading("reject");
    await rejectRedemptionAction(redemptionId);
    setLoading(null);
  };

  return (
    <div className="flex gap-1.5 justify-end">
      <Button
        variant="success"
        size="sm"
        icon={<Check size={14} />}
        loading={loading === "approve"}
        disabled={loading !== null}
        onClick={handleApprove}
      >
        Duyệt
      </Button>
      <Button
        variant="danger"
        size="sm"
        icon={<X size={14} />}
        loading={loading === "reject"}
        disabled={loading !== null}
        onClick={handleReject}
      >
        Từ chối
      </Button>
    </div>
  );
}
