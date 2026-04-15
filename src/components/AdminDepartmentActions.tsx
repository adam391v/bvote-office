"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { createDepartmentAction, updateDepartmentAction, deleteDepartmentAction } from "@/actions/admin-actions";
import { Button, Input } from "@/components/ui";
import { Plus, Edit3, Trash2, Save, X } from "lucide-react";

interface Props {
  mode: "create" | "edit";
  department?: { id: number; name: string };
  memberCount?: number;
}

export default function AdminDepartmentActions({ mode, department, memberCount = 0 }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState("");

  const { register, handleSubmit, reset } = useForm({
    defaultValues: { name: department?.name || "" },
  });

  const onSubmit = async (data: { name: string }) => {
    setMessage("");
    let result;
    if (mode === "create") {
      result = await createDepartmentAction(data);
    } else {
      result = await updateDepartmentAction(department!.id, data);
    }

    if (result?.error) {
      setMessage(result.error);
    } else {
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
      setMessage(result.error);
      setDeleting(false);
      setTimeout(() => setMessage(""), 3000);
    }
  };

  if (mode === "create") {
    return (
      <>
        <Button variant="primary" size="sm" icon={<Plus size={16} />} onClick={() => setShowForm(true)}>
          Tạo phòng ban
        </Button>

        {showForm && (
          <div className="modal-overlay" onClick={() => setShowForm(false)}>
            <div className="card-static w-[380px]" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold">Tạo phòng ban mới</h3>
                <Button variant="ghost" size="icon" onClick={() => setShowForm(false)}><X size={18} /></Button>
              </div>
              {message && <div className="alert alert-error">{message}</div>}
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="flex flex-col gap-4">
                  <Input id="dept-name" label="Tên phòng ban" placeholder="Ví dụ: Phòng Kinh doanh" {...register("name")} />
                  <div className="flex gap-2">
                    <Button type="submit" variant="primary" icon={<Save size={16} />}>Tạo</Button>
                    <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>Hủy</Button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}
      </>
    );
  }

  // Edit mode
  return (
    <div className="flex gap-1">
      {message && (
        <span className="text-xs text-[var(--color-danger)] self-center mr-1">
          {message}
        </span>
      )}
      <Button variant="ghost" size="icon" onClick={() => setShowForm(true)} title="Sửa">
        <Edit3 size={16} />
      </Button>
      <Button variant="ghost" size="icon" onClick={onDelete} loading={deleting} title="Xóa" className="text-[var(--color-danger)]">
        <Trash2 size={16} />
      </Button>

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="card-static w-[380px]" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold">Sửa phòng ban</h3>
              <Button variant="ghost" size="icon" onClick={() => setShowForm(false)}><X size={18} /></Button>
            </div>
            {message && <div className="alert alert-error">{message}</div>}
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="flex flex-col gap-4">
                <Input id={`dept-${department!.id}`} label="Tên phòng ban" {...register("name")} />
                <div className="flex gap-2">
                  <Button type="submit" variant="primary" icon={<Save size={16} />}>Lưu</Button>
                  <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>Hủy</Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
