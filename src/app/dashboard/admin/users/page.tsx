import { getUsers, getDepartments } from "@/actions/admin-actions";
import { Star, Mail, Building2, Users as UsersIcon } from "lucide-react";
import DataTable, { type Column } from "@/components/ui/DataTable";
import AdminUserActions from "@/components/AdminUserActions";

interface UserRow {
  id: number;
  name: string;
  email: string;
  role: string;
  departmentId: number | null;
  departmentName: string | null;
  stars: number;
  goalCount: number;
  checkinCount: number;
}

export default async function AdminUsersPage() {
  const [users, departments] = await Promise.all([getUsers(), getDepartments()]);

  const rows: UserRow[] = users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    departmentId: u.departmentId,
    departmentName: u.department?.name || null,
    stars: u.stars?.totalStars ?? 0,
    goalCount: u._count.goals,
    checkinCount: u._count.checkinsOwned,
  }));

  const columns: Column<UserRow>[] = [
    {
      key: "user",
      header: "Người dùng",
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="gradient-bg w-9 h-9 rounded-full flex items-center justify-center text-[0.8125rem] font-semibold text-white shrink-0">
            {row.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-sm">{row.name}</p>
            <p className="text-xs text-[var(--text-muted)] flex items-center gap-1">
              <Mail size={11} /> {row.email}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "role",
      header: "Vai trò",
      render: (row) => (
        <span
          className={`badge ${
            row.role === "ADMIN"
              ? "badge-danger"
              : row.role === "MANAGER"
              ? "badge-warning"
              : "badge-primary"
          }`}
        >
          {row.role === "ADMIN"
            ? "Admin"
            : row.role === "MANAGER"
            ? "Quản lý"
            : "Nhân viên"}
        </span>
      ),
    },
    {
      key: "department",
      header: "Phòng ban",
      render: (row) =>
        row.departmentName ? (
          <span className="flex items-center gap-1.5 text-[0.8125rem]">
            <Building2 size={14} className="text-[var(--color-secondary)]" />
            {row.departmentName}
          </span>
        ) : (
          <span className="text-[var(--text-muted)] text-[0.8125rem] italic">—</span>
        ),
    },
    {
      key: "stars",
      header: "Sao",
      render: (row) => (
        <span className="inline-flex items-center gap-1 font-bold text-sm text-[var(--color-accent)]">
          <Star size={14} fill="#f59e0b" color="#f59e0b" />
          {row.stars}
        </span>
      ),
      align: "center",
    },
    {
      key: "activity",
      header: "Hoạt động",
      render: (row) => (
        <div className="flex gap-3 text-xs text-[var(--text-secondary)]">
          <span>{row.goalCount} mục tiêu</span>
          <span>{row.checkinCount} check-in</span>
        </div>
      ),
    },
    {
      key: "actions",
      header: "Hành động",
      align: "right",
      render: (row) => (
        <AdminUserActions
          user={{
            id: row.id,
            name: row.name,
            email: row.email,
            role: row.role as "ADMIN" | "MANAGER" | "EMPLOYEE",
            departmentId: row.departmentId,
          }}
          departments={departments.map((d) => ({ id: d.id, name: d.name }))}
        />
      ),
    },
  ];

  return (
    <div>
      <div className="page-header">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="page-title">Quản lý người dùng</h1>
            <p className="page-subtitle">{users.length} thành viên trong hệ thống</p>
          </div>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={rows}
        emptyIcon={<UsersIcon size={48} />}
        emptyMessage="Chưa có người dùng nào"
      />
    </div>
  );
}
