"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { toast } from "react-hot-toast";
import { createDepartmentAction, updateDepartmentAction, deleteDepartmentAction } from "@/actions/admin-actions";
import { Button, Input, Select, Modal } from "@/components/ui";
import type { SelectOption } from "@/components/ui";
import { Plus, Edit3, Trash2, Save, X, Crown, Building2 } from "lucide-react";

interface UserOption {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface Props {
  mode: "create" | "edit";
  department?: { id: number; name: string; managerId: number | null };
  memberCount?: number;
  users?: UserOption[];
}

interface FormData {
  name: string;
  managerId: number | null;
}

export default function AdminDepartmentActions({ mode, department, memberCount = 0, users = [] }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Chuyển danh sách users thành SelectOption[], đánh dấu ★ cho Manager
  const userOptions: SelectOption[] = users.map((u) => ({
    value: u.id,
    label: `${u.name} (${u.email})${u.role === "MANAGER" ? " ★" : ""}`,
  }));

  const { register, handleSubmit, reset, control } = useForm<FormData>({
    defaultValues: {
      name: department?.name || "",
      managerId: department?.managerId ?? null,
    },
  });

  const onSubmit = async (data: FormData) => {
    setSubmitting(true);
    const payload = {
      name: data.name,
      managerId: data.managerId,
    };

    let result;
    if (mode === "create") {
      result = await createDepartmentAction(payload);
    } else {
      result = await updateDepartmentAction(department!.id, payload);
    }

    setSubmitting(false);
    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success(mode === "create" ? "Tạo phòng ban thành công!" : "Cập nhật phòng ban thành công!");
      setShowForm(false);
      if (mode === "create") reset();
    }
  };

  const onDelete = async () => {
    if (!department) return;
    if (!window.confirm(`Xóa phòng ban "${department.name}"?`)) return;
    setDeleting(true);
    const result = await deleteDepartmentAction(department.id);
    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success("Xóa phòng ban thành công!");
    }
    setDeleting(false);
  };

  const handleClose = () => {
    setShowForm(false);
  };

  // Modal chuyên nghiệp - render qua Portal
  const renderFormModal = (title: string, subtitle: string, submitLabel: string) => {
    return (
      <Modal
        isOpen={showForm}
        onClose={handleClose}
        title={
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center text-[var(--color-secondary)] shrink-0">
              <Building2 size={20} />
            </div>
            <div>
              <p className="text-base font-semibold text-[var(--text-primary)] leading-tight">{title}</p>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">{subtitle}</p>
            </div>
          </div>
        }
        maxWidth="max-w-[480px]"
      >
        <div className="px-6 py-5">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-5">
              <Input
                id={mode === "create" ? "dept-name" : `dept-${department!.id}`}
                label="Tên phòng ban"
                placeholder="Ví dụ: Phòng Kinh doanh"
                {...register("name")}
              />

              <Controller
                name="managerId"
                control={control}
                render={({ field }) => (
                  <Select
                    id={mode === "create" ? "dept-manager" : `dept-manager-${department?.id}`}
                    label="Quản lý phòng ban"
                    icon={<Crown size={14} className="text-amber-500" />}
                    options={userOptions}
                    value={userOptions.find((o) => o.value === field.value) ?? null}
                    onChange={(option) => field.onChange(option ? Number(option.value) : null)}
                    placeholder="Tìm và chọn quản lý..."
                    isSearchable={true}
                    isClearable={true}
                    hint="Nhập tên hoặc email để tìm. Manager được đánh dấu ★"
                    menuPortalTarget={typeof document !== "undefined" ? document.body : null}
                  />
                )}
              />
            </div>

            {/* === Footer === */}
            <div
              className="flex gap-3 mt-6 pt-4"
              style={{ borderTop: "1px solid var(--border-color)" }}
            >
              <Button type="submit" variant="primary" icon={<Save size={16} />} loading={submitting}>
                {submitLabel}
              </Button>
              <Button type="button" variant="secondary" onClick={handleClose}>
                Hủy
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    );
  };

  if (mode === "create") {
    return (
      <>
        <Button variant="primary" size="sm" icon={<Plus size={16} />} onClick={() => setShowForm(true)}>
          Tạo phòng ban
        </Button>
        {showForm && renderFormModal("Tạo phòng ban mới", "Thêm phòng ban và chỉ định quản lý", "Tạo phòng ban")}
      </>
    );
  }

  // Edit mode
  return (
    <div className="flex gap-1">
      <Button variant="ghost" size="icon" onClick={() => setShowForm(true)} title="Sửa">
        <Edit3 size={16} />
      </Button>
      <Button variant="ghost" size="icon" onClick={onDelete} loading={deleting} title="Xóa" className="text-[var(--color-danger)]">
        <Trash2 size={16} />
      </Button>
      {showForm && renderFormModal(
        "Chỉnh sửa phòng ban",
        `${department!.name} • ${memberCount} thành viên`,
        "Lưu thay đổi"
      )}
    </div>
  );
}
