"use client";

import { useState } from "react";
import { redeemRewardAction } from "@/actions/reward-actions";
import { Loader2, Gift, Check, X } from "lucide-react";

interface RedeemButtonProps {
  rewardId: number;
  canAfford: boolean;
  starCost: number;
}

export default function RedeemButton({ rewardId, canAfford, starCost }: RedeemButtonProps) {
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [result, setResult] = useState<{ success?: boolean; error?: string } | null>(null);

  const handleClick = () => {
    if (!canAfford || loading) return;
    setConfirming(true);
    setResult(null);
  };

  const handleCancel = () => {
    setConfirming(false);
  };

  const handleConfirm = async () => {
    setConfirming(false);
    setLoading(true);
    setResult(null);

    try {
      const res = await redeemRewardAction(rewardId);
      setResult(res);
    } catch {
      setResult({ error: "Có lỗi xảy ra, vui lòng thử lại" });
    } finally {
      setLoading(false);
    }
  };

  // Trạng thái xác nhận đổi thưởng
  if (confirming) {
    return (
      <div className="flex flex-col gap-2">
        <p className="text-[13px] text-[var(--text-secondary)] text-center">
          Xác nhận đổi <strong>{starCost} ⭐</strong>?
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleConfirm}
            className="btn btn-success flex-1"
          >
            <Check size={16} />
            Xác nhận
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="btn btn-secondary flex-1"
          >
            <X size={16} />
            Huỷ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleClick}
        disabled={!canAfford || loading}
        className={`btn w-full ${
          canAfford
            ? "btn-primary opacity-100 cursor-pointer"
            : "btn-secondary opacity-50 cursor-not-allowed"
        }`}
      >
        {loading ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Đang đổi...
          </>
        ) : canAfford ? (
          <>
            <Gift size={16} />
            Đổi thưởng
          </>
        ) : (
          `Cần ${starCost} ⭐`
        )}
      </button>
      {result?.success && (
        <p className="mt-2 text-[13px] text-[var(--success)] text-center">
          🎉 Đổi thưởng thành công!
        </p>
      )}
      {result?.error && (
        <p className="mt-2 text-[13px] text-[var(--danger)] text-center">
          {result.error}
        </p>
      )}
    </div>
  );
}
