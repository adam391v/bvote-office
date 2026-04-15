import { getRewards, getUserStars, getStarHistory, getRedemptions } from "@/actions/reward-actions";
import RedeemButton from "@/components/RedeemButton";
import { Gift, Star, History, ShoppingBag, Trophy } from "lucide-react";

export default async function RewardsPage() {
  const [rewards, totalStars, starHistory, redemptions] = await Promise.all([
    getRewards(),
    getUserStars(),
    getStarHistory(),
    getRedemptions(),
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
          <span className="gradient-text">Kho quà</span> &amp; Điểm sao
        </h1>
        <p className="text-sm md:text-base text-[var(--text-secondary)] mt-1">
          Đổi sao tích lũy lấy phần thưởng hấp dẫn
        </p>
      </div>

      {/* Star Balance */}
      <div className="card-static animate-fade-in flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gradient-to-br from-amber-500/8 to-amber-500/2 border border-amber-500/15">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="animate-float">
            <Star size={36} className="sm:w-10 sm:h-10" fill="#f59e0b" color="#f59e0b" />
          </div>
          <div>
            <p className="text-4xl sm:text-5xl font-extrabold text-[var(--accent)] leading-none">
              {totalStars}
            </p>
            <p className="text-sm text-[var(--text-secondary)]">sao tích lũy</p>
          </div>
        </div>
        <div className="text-[13px] text-[var(--text-muted)] sm:text-right">
          <p>Mỗi sao = 5.000đ</p>
          <p className="font-semibold text-[var(--accent)]">
            ≈ {(totalStars * 5000).toLocaleString("vi-VN")}đ
          </p>
        </div>
      </div>

      {/* Rewards Grid */}
      <h2 className="text-base md:text-lg font-semibold flex items-center gap-2">
        <Gift size={20} className="text-[var(--primary)]" />
        Phần thưởng có thể đổi
      </h2>

      {rewards.length === 0 ? (
        <div className="card-static">
          <div className="empty-state p-8">
            <Gift size={48} />
            <p className="mt-3">Chưa có phần thưởng nào</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
          {rewards.map((reward, i) => {
            const canAfford = totalStars >= reward.starCost;
            return (
              <div
                key={reward.id}
                className={`card animate-fade-in stagger-${(i % 4) + 1} relative`}
              >
                {/* Image placeholder */}
                <div
                  className={`w-full h-24 sm:h-28 rounded-lg flex items-center justify-center mb-4 ${
                    canAfford
                      ? "bg-gradient-to-br from-primary/[0.12] to-primary-light/[0.12]"
                      : "bg-gradient-to-br from-slate-500/12 to-slate-500/6"
                  }`}
                >
                  <Trophy
                    size={36}
                    className={canAfford ? "text-[var(--primary)]" : "text-[var(--text-muted)]"}
                  />
                </div>

                <h3 className="font-semibold mb-1 text-sm md:text-base">{reward.name}</h3>
                {reward.description && (
                  <p className="text-[13px] text-[var(--text-secondary)] mb-3 leading-relaxed line-clamp-2">
                    {reward.description}
                  </p>
                )}

                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-1.5">
                    <Star size={16} fill="#f59e0b" color="#f59e0b" />
                    <span className="font-bold text-[var(--accent)]">{reward.starCost}</span>
                  </div>
                  <span className="badge badge-info">Còn {reward.quantity}</span>
                </div>

                <RedeemButton
                  rewardId={reward.id}
                  canAfford={canAfford}
                  starCost={reward.starCost}
                />
              </div>
            );
          })}
        </div>
      )}

      {/* Bottom Grid - Lịch sử sao & Đổi thưởng */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-5">
        {/* Lịch sử sao */}
        <div className="card-static animate-fade-in [animation-delay:0.2s]">
          <h2 className="text-sm md:text-base font-semibold mb-4 flex items-center gap-2">
            <History size={18} className="text-[var(--secondary)]" />
            Lịch sử sao
          </h2>
          {starHistory.length === 0 ? (
            <div className="empty-state p-6">
              <Star size={28} />
              <p className="mt-1.5 text-sm">Chưa có giao dịch nào</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2 max-h-72 overflow-y-auto">
              {starHistory.map((tx) => (
                <div
                  key={tx.id}
                  className="flex justify-between items-center px-3 py-2.5 rounded-lg border border-[var(--border-color)] text-[13px]"
                >
                  <div className="min-w-0 mr-3">
                    <p className="font-medium truncate">{tx.reason}</p>
                    <p className="text-xs text-[var(--text-muted)]">
                      {new Date(tx.createdAt).toLocaleDateString("vi-VN")}
                    </p>
                  </div>
                  <span
                    className={`font-bold whitespace-nowrap ${
                      tx.type === "EARNED" ? "text-[var(--success)]" : "text-[var(--danger)]"
                    }`}
                  >
                    {tx.type === "EARNED" ? "+" : ""}{tx.amount} ⭐
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Lịch sử đổi thưởng */}
        <div className="card-static animate-fade-in [animation-delay:0.25s]">
          <h2 className="text-sm md:text-base font-semibold mb-4 flex items-center gap-2">
            <ShoppingBag size={18} className="text-[var(--accent)]" />
            Đã đổi
          </h2>
          {redemptions.length === 0 ? (
            <div className="empty-state p-6">
              <ShoppingBag size={28} />
              <p className="mt-1.5 text-sm">Chưa đổi thưởng nào</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2 max-h-72 overflow-y-auto">
              {redemptions.map((rd) => (
                <div
                  key={rd.id}
                  className="flex justify-between items-center px-3 py-2.5 rounded-lg border border-[var(--border-color)] text-[13px]"
                >
                  <div className="min-w-0 mr-3">
                    <p className="font-medium truncate">{rd.reward.name}</p>
                    <p className="text-xs text-[var(--text-muted)]">
                      {new Date(rd.createdAt).toLocaleDateString("vi-VN")}
                    </p>
                  </div>
                  <span
                    className={`badge whitespace-nowrap ${
                      rd.status === "DELIVERED"
                        ? "badge-success"
                        : rd.status === "APPROVED"
                          ? "badge-info"
                          : "badge-warning"
                    }`}
                  >
                    {rd.status === "DELIVERED" ? "Đã giao" : rd.status === "APPROVED" ? "Đã duyệt" : "Chờ duyệt"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
