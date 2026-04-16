"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  createRewardAction,
  updateRewardAction,
  deleteRewardAction,
} from "@/actions/admin-actions";
import { toast } from "react-hot-toast";
import { Button, Input, Textarea, Modal } from "@/components/ui";
import { Plus, Edit3, Trash2, Save, X, ToggleLeft, ToggleRight } from "lucide-react";

interface RewardData {
  id: number;
  name: string;
  description: string;
  starCost: number;
  quantity: number;
  isActive: boolean;
}

interface Props {
  mode: "create" | "edit";
  reward?: RewardData;
}

export default function AdminRewardActions({ mode, reward }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      name: reward?.name || "",
      description: reward?.description || "",
      starCost: reward?.starCost || 10,
      quantity: reward?.quantity || 100,
      isActive: reward?.isActive ?? true,
    },
  });

  const onSubmit = async (data: {
    name: string;
    description: string;
    starCost: number;
    quantity: number;
    isActive: boolean;
  }) => {
    let result;
    if (mode === "create") {
      result = await createRewardAction({
        name: data.name,
        description: data.description,
        starCost: Number(data.starCost),
        quantity: Number(data.quantity),
        isActive: data.isActive,
      });
    } else {
      result = await updateRewardAction(reward!.id, {
        name: data.name,
        description: data.description,
        starCost: Number(data.starCost),
        quantity: Number(data.quantity),
        isActive: data.isActive,
      });
    }

    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success(mode === "create" ? "Tạo phần thưởng thành công!" : "Cập nhật phần thưởng thành công!");
      setShowForm(false);
      if (mode === "create") reset();
    }
  };

  const onDelete = async () => {
    if (!reward) return;
    if (!window.confirm(`Xóa phần thưởng "${reward.name}"?`)) return;
    setLoading(true);
    const result = await deleteRewardAction(reward.id);
    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success("Xóa phần thưởng thành công!");
    }
    setLoading(false);
  };

  const onToggle = async () => {
    if (!reward) return;
    setLoading(true);
    const result = await toggleRewardAction(reward.id);
    if (!result?.error) {
       toast.success("Cập nhật trạng thái thành công!");
    } else {
       toast.error(result.error);
    }
    setLoading(false);
  };

  if (mode === "create") {
    return (
      <>
        <Button variant="primary" size="sm" icon={<Plus size={16} />} onClick={() => setShowForm(true)}>
          Tạo phần thưởng
        </Button>

        <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Tạo phần thưởng mới">
          <form onSubmit={handleSubmit(onSubmit)} className="p-6">
            <div className="flex flex-col gap-4">
              <Input id="rw-name" label="Tên phần thưởng *" placeholder="Ví dụ: Voucher cafe" {...register("name")} />
              <Textarea id="rw-desc" label="Mô tả" placeholder="Mô tả chi tiết..." {...register("description")} />
              <div className="grid grid-cols-2 gap-3">
                <Input id="rw-cost" label="Giá (sao) *" type="number" min={1} {...register("starCost")} />
                <Input id="rw-qty" label="Số lượng *" type="number" min={0} {...register("quantity")} />
              </div>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" {...register("isActive")} className="w-4 h-4 accent-[var(--color-primary)]" />
                Hoạt động (có thể đổi thưởng)
              </label>
              <div className="flex gap-2 mt-4">
                <Button type="submit" variant="primary" icon={<Save size={16} />}>Tạo</Button>
                <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>Hủy</Button>
              </div>
            </div>
          </form>
        </Modal>
      </>
    );
  }

  // Edit mode
  return (
    <div className="flex gap-1 justify-end">
      <Button
        variant="ghost"
        size="sm"
        icon={reward?.isActive ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
        onClick={onToggle}
        loading={loading}
        title={reward?.isActive ? "Tạm ngừng" : "Kích hoạt"}
        className={reward?.isActive ? "text-[var(--color-success)]" : "text-[var(--text-muted)]"}
      >
        {reward?.isActive ? "Bật" : "Tắt"}
      </Button>
      <Button variant="ghost" size="sm" icon={<Edit3 size={14} />} onClick={() => setShowForm(true)}>
        Sửa
      </Button>
      <Button variant="ghost" size="sm" icon={<Trash2 size={14} />} onClick={onDelete} className="text-[var(--color-danger)]">
        Xóa
      </Button>

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Sửa phần thưởng">
        <form onSubmit={handleSubmit(onSubmit)} className="p-6">
          <div className="flex flex-col gap-4">
            <Input id={`rw-${reward!.id}-name`} label="Tên phần thưởng" {...register("name")} />
            <Textarea id={`rw-${reward!.id}-desc`} label="Mô tả" {...register("description")} />
            <div className="grid grid-cols-2 gap-3">
              <Input id={`rw-${reward!.id}-cost`} label="Giá (sao)" type="number" {...register("starCost")} />
              <Input id={`rw-${reward!.id}-qty`} label="Số lượng" type="number" {...register("quantity")} />
            </div>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" {...register("isActive")} className="w-4 h-4 accent-[var(--color-primary)]" />
              Hoạt động
            </label>
            <div className="flex gap-2 mt-4">
              <Button type="submit" variant="primary" icon={<Save size={16} />}>Lưu</Button>
              <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>Hủy</Button>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}
