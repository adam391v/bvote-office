import { getAdminRewards } from "@/actions/admin-actions";
import { Star, Package } from "lucide-react";
import DataTable, { type Column } from "@/components/ui/DataTable";
import AdminRewardActions from "@/components/AdminRewardActions";

interface RewardRow {
  id: number;
  name: string;
  description: string | null;
  starCost: number;
  quantity: number;
  isActive: boolean;
  redemptionCount: number;
}

export default async function AdminRewardsPage() {
  const rewards = await getAdminRewards();

  const rows: RewardRow[] = rewards.map((r) => ({
    id: r.id,
    name: r.name,
    description: r.description,
    starCost: r.starCost,
    quantity: r.quantity,
    isActive: r.isActive,
    redemptionCount: r._count.redemptions,
  }));

  const columns: Column<RewardRow>[] = [
    {
      key: "name",
      header: "Phần thưởng",
      render: (row) => (
        <div>
          <p className="font-semibold text-sm">{row.name}</p>
          {row.description && (
            <p className="text-xs text-[var(--text-muted)] mt-0.5 max-w-[280px] overflow-hidden text-ellipsis whitespace-nowrap">
              {row.description}
            </p>
          )}
        </div>
      ),
    },
    {
      key: "cost",
      header: "Giá (sao)",
      align: "center",
      render: (row) => (
        <span className="inline-flex items-center gap-1 font-bold text-[var(--color-accent)] text-[0.9375rem]">
          <Star size={14} fill="#f59e0b" color="#f59e0b" />
          {row.starCost}
        </span>
      ),
    },
    {
      key: "quantity",
      header: "Tồn kho",
      align: "center",
      render: (row) => (
        <span
          className={`inline-flex items-center gap-1.5 font-semibold ${
            row.quantity > 0 ? "text-[var(--text-primary)]" : "text-[var(--color-danger)]"
          }`}
        >
          <Package size={14} className="text-[var(--text-muted)]" />
          {row.quantity}
        </span>
      ),
    },
    {
      key: "redeemed",
      header: "Đã đổi",
      align: "center",
      render: (row) => <span className="text-[var(--text-secondary)]">{row.redemptionCount}</span>,
    },
    {
      key: "status",
      header: "Trạng thái",
      align: "center",
      render: (row) => (
        <span className={`badge ${row.isActive ? "badge-success" : "badge-danger"}`}>
          {row.isActive ? "Hoạt động" : "Tạm ngừng"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Hành động",
      align: "right",
      render: (row) => (
        <AdminRewardActions
          mode="edit"
          reward={{
            id: row.id,
            name: row.name,
            description: row.description || "",
            starCost: row.starCost,
            quantity: row.quantity,
            isActive: row.isActive,
          }}
        />
      ),
    },
  ];

  return (
    <div>
      <div className="page-header">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="page-title">Quản lý phần thưởng</h1>
            <p className="page-subtitle">{rewards.length} phần thưởng trong kho</p>
          </div>
          <AdminRewardActions mode="create" />
        </div>
      </div>

      <DataTable
        columns={columns}
        data={rows}
        emptyIcon={<Package size={48} />}
        emptyMessage="Chưa có phần thưởng nào"
      />
    </div>
  );
}
