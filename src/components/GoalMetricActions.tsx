"use client";

import { useState } from "react";
import { Plus, Edit, Trash2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { Button, Input, Modal } from "@/components/ui";
import { createGoalMetricAction, updateGoalMetricAction, deleteGoalMetricAction } from "@/actions/admin-actions";

export default function GoalMetricActions({ metrics }: { metrics: any[] }) {
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  
  const [formData, setFormData] = useState({ name: "", unit: "" });

  const openCreateModal = () => {
    setEditId(null);
    setFormData({ name: "", unit: "" });
    setIsModalOpen(true);
  };

  const openEditModal = (m: any) => {
    setEditId(m.id);
    setFormData({ name: m.name, unit: m.unit });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const res = editId 
      ? await updateGoalMetricAction(editId, formData)
      : await createGoalMetricAction(formData);

    setLoading(false);
    if (res?.error) {
      toast.error(res.error);
    } else {
      toast.success(editId ? "Cập nhật thành công!" : "Thêm cấu hình thành công!");
      closeModal();
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa cấu hình này không?")) return;
    
    setLoading(true);
    const res = await deleteGoalMetricAction(id);
    if (res?.error) {
      toast.error(res.error);
    } else {
      toast.success("Xóa cấu hình thành công!");
    }
    setLoading(false);
  };

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button onClick={openCreateModal} variant="primary" icon={<Plus size={16} />}>
          Thêm cấu hình
        </Button>
      </div>

      <div className="data-table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Tên loại mục tiêu</th>
              <th>Đơn vị mặc định</th>
              <th className="text-right">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {metrics.map((m) => (
              <tr key={m.id}>
                <td>#{m.id}</td>
                <td className="font-semibold">{m.name}</td>
                <td><span className="badge badge-outline">{m.unit}</span></td>
                <td className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button size="sm" variant="ghost" onClick={() => openEditModal(m)} icon={<Edit size={16} />}>Sửa</Button>
                    <Button size="sm" variant="danger" className="bg-red-50 text-red-500 hover:bg-red-100" onClick={() => handleDelete(m.id)} icon={<Trash2 size={16} />} />
                  </div>
                </td>
              </tr>
            ))}
            {metrics.length === 0 && (
              <tr>
                <td colSpan={4} className="text-center py-6 text-[var(--text-muted)]">
                  Chưa có cấu hình mục tiêu nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={closeModal} 
        title={editId ? "Cập nhật Loại mục tiêu" : "Thêm Loại mục tiêu mới"}
      >
        <form onSubmit={handleSubmit} className="p-6">
          <div className="flex flex-col gap-4">
            <Input
              id="name"
              label="Tên Loại mục tiêu *"
              placeholder="VD: Doanh thu sản phẩm A"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            
            <Input
              id="unit"
              label="Đơn vị mặc định *"
              placeholder="VD: Triệu VNĐ"
              value={formData.unit}
              onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              required
            />
          </div>

          <div className="modal-footer mt-6">
            <Button type="button" variant="secondary" onClick={closeModal} disabled={loading}>
              Hủy
            </Button>
            <Button type="submit" variant="primary" loading={loading}>
              {editId ? "Cập nhật" : "Thêm mới"}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
