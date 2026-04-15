"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { updateUserAction, deleteUserAction, resetPasswordAction } from "@/actions/admin-actions";
import { Button, Input, Select } from "@/components/ui";
import type { SelectOption } from "@/components/ui";
import { Edit3, Trash2, Key, X, Save } from "lucide-react";

const roleOptions: SelectOption[] = [
  { value: "ADMIN", label: "Admin" },
  { value: "MANAGER", label: "Quản lý" },
  { value: "EMPLOYEE", label: "Nhân viên" },
];

interface UserData {
  id: number;
  name: string;
  email: string;
  role: "ADMIN" | "MANAGER" | "EMPLOYEE";
  departmentId: number | null;
}

interface Props {
  user: UserData;
  departments: { id: number; name: string }[];
}

export default function AdminUserActions({ user, departments }: Props) {
  const [editing, setEditing] = useState(false);
  const [resettingPw, setResettingPw] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState("");

  const deptOptions: SelectOption[] = [
    { value: 0, label: "— Chưa phân —" },
    ...departments.map((d) => ({ value: d.id, label: d.name })),
  ];

  const { register, handleSubmit, control } = useForm({
    defaultValues: {
      name: user.name,
      email: user.email,
      role: user.role,
      departmentId: user.departmentId ?? 0,
    },
  });

  const { register: registerPw, handleSubmit: handlePw, reset: resetPwForm } = useForm({
    defaultValues: { newPassword: "" },
  });

  const onSubmitEdit = async (data: { name: string; email: string; role: string; departmentId: number }) => {
    const result = await updateUserAction(user.id, {
      name: data.name,
      email: data.email,
      role: data.role as "ADMIN" | "MANAGER" | "EMPLOYEE",
      departmentId: data.departmentId === 0 ? null : data.departmentId,
    });
    if (result?.error) setMessage(result.error);
    else setEditing(false);
  };

  const onResetPw = async (data: { newPassword: string }) => {
    if (data.newPassword.length < 6) {
      setMessage("Mật khẩu ít nhất 6 ký tự");
      return;
    }
    const result = await resetPasswordAction(user.id, data.newPassword);
    if (result?.error) setMessage(result.error);
    else {
      setMessage("Đã đặt lại mật khẩu!");
      setResettingPw(false);
      resetPwForm();
    }
  };

  const onDelete = async () => {
    if (!window.confirm(`Xóa người dùng "${user.name}"? Không thể hoàn tác!`)) return;
    setDeleting(true);
    const result = await deleteUserAction(user.id);
    if (result?.error) {
      setMessage(result.error);
      setDeleting(false);
    }
  };

  if (editing) {
    return (
      <div className="modal-overlay" onClick={() => setEditing(false)}>
        <div
          className="card-static w-[420px] max-h-[90vh] overflow-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-5">
            <h3 className="font-semibold">Sửa người dùng</h3>
            <Button variant="ghost" size="icon" onClick={() => setEditing(false)}>
              <X size={18} />
            </Button>
          </div>
          {message && <div className="alert alert-error">{message}</div>}
          <form onSubmit={handleSubmit(onSubmitEdit)}>
            <div className="flex flex-col gap-4">
              <Input id="name" label="Họ tên" {...register("name")} />
              <Input id="email" label="Email" type="email" {...register("email")} />
              <Controller
                name="role"
                control={control}
                render={({ field }) => (
                  <Select
                    id="role"
                    label="Vai trò"
                    options={roleOptions}
                    value={roleOptions.find((o) => o.value === field.value) || null}
                    onChange={(opt) => field.onChange(opt?.value || "EMPLOYEE")}
                  />
                )}
              />
              <Controller
                name="departmentId"
                control={control}
                render={({ field }) => (
                  <Select
                    id="dept"
                    label="Phòng ban"
                    options={deptOptions}
                    value={deptOptions.find((o) => o.value === field.value) || deptOptions[0]}
                    onChange={(opt) => field.onChange(Number(opt?.value) || 0)}
                  />
                )}
              />
              <div className="flex gap-2">
                <Button type="submit" variant="primary" icon={<Save size={16} />}>Lưu thay đổi</Button>
                <Button type="button" variant="secondary" onClick={() => setEditing(false)}>Hủy</Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    );
  }

  if (resettingPw) {
    return (
      <div className="modal-overlay" onClick={() => setResettingPw(false)}>
        <div className="card-static w-[380px]" onClick={(e) => e.stopPropagation()}>
          <h3 className="font-semibold mb-4">Đặt lại mật khẩu - {user.name}</h3>
          {message && <div className="alert alert-error">{message}</div>}
          <form onSubmit={handlePw(onResetPw)}>
            <div className="flex flex-col gap-4">
              <Input id="newPassword" label="Mật khẩu mới" type="password" placeholder="Ít nhất 6 ký tự" {...registerPw("newPassword")} />
              <div className="flex gap-2">
                <Button type="submit" variant="primary" icon={<Key size={16} />}>Đặt lại</Button>
                <Button type="button" variant="secondary" onClick={() => setResettingPw(false)}>Hủy</Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-1 justify-end">
      <Button variant="ghost" size="sm" icon={<Edit3 size={14} />} onClick={() => { setMessage(""); setEditing(true); }}>
        Sửa
      </Button>
      <Button variant="ghost" size="sm" icon={<Key size={14} />} onClick={() => { setMessage(""); setResettingPw(true); }}>
        MK
      </Button>
      <Button variant="ghost" size="sm" icon={<Trash2 size={14} />} onClick={onDelete} loading={deleting} className="text-[var(--color-danger)]">
        Xóa
      </Button>
    </div>
  );
}
