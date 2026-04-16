import { getDepartments, getUsersForSelect } from "@/actions/admin-actions";
import { Users, Building2, Crown } from "lucide-react";
import AdminDepartmentActions from "@/components/AdminDepartmentActions";

export default async function AdminDepartmentsPage() {
  const [departments, users] = await Promise.all([
    getDepartments(),
    getUsersForSelect(),
  ]);

  return (
    <div>
      <div className="page-header">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="page-title">Quản lý phòng ban</h1>
            <p className="page-subtitle">{departments.length} phòng ban</p>
          </div>
          <AdminDepartmentActions mode="create" users={users} />
        </div>
      </div>

      {departments.length === 0 ? (
        <div className="empty-state mt-12">
          <Building2 size={48} />
          <p className="mt-2">Chưa có phòng ban nào</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {departments.map((dept, i) => (
            <div
              key={dept.id}
              className={`card animate-fade-in stagger-${(i % 4) + 1} opacity-0 flex justify-between items-start`}
            >
              <div className="flex items-start gap-3.5">
                <div className="w-12 h-12 rounded-lg bg-cyan-500/10 flex items-center justify-center text-[var(--color-secondary)] shrink-0">
                  <Building2 size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-base">{dept.name}</h3>
                  <p className="flex items-center gap-1.5 mt-1 text-[var(--text-secondary)] text-[0.8125rem]">
                    <Users size={14} />
                    {dept._count.users} thành viên
                  </p>
                  {dept.manager ? (
                    <p className="flex items-center gap-1.5 mt-1 text-amber-600 dark:text-amber-400 text-[0.8125rem]">
                      <Crown size={14} />
                      {dept.manager.name}
                    </p>
                  ) : (
                    <p className="flex items-center gap-1.5 mt-1 text-[var(--text-tertiary)] text-[0.8125rem] italic">
                      <Crown size={14} />
                      Chưa có quản lý
                    </p>
                  )}
                </div>
              </div>
              <AdminDepartmentActions
                mode="edit"
                department={{ id: dept.id, name: dept.name, managerId: dept.managerId }}
                memberCount={dept._count.users}
                users={users}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
