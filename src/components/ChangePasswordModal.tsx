"use client";

import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { changePasswordAction } from "@/actions/profile-actions";
import { Button, Input, Modal } from "@/components/ui";
import { Key } from "lucide-react";

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ChangePasswordModal({ isOpen, onClose }: ChangePasswordModalProps) {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    }
  });

  const onSubmit = async (data: any) => {
    if (data.newPassword !== data.confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp");
      return;
    }
    if (data.newPassword.length < 6) {
      toast.error("Mật khẩu mới phải có ít nhất 6 ký tự");
      return;
    }

    const result = await changePasswordAction(data.currentPassword, data.newPassword);
    
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Đổi mật khẩu thành công!");
      reset();
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Đổi mật khẩu">
      <form onSubmit={handleSubmit(onSubmit)} className="p-6">
        <div className="flex flex-col gap-4">
          <Input 
            id="currentPassword"
            label="Mật khẩu hiện tại"
            type="password"
            placeholder="••••••••"
            {...register("currentPassword", { required: "Vui lòng nhập mật khẩu hiện tại" })}
            error={errors.currentPassword?.message as string}
          />
          
          <Input 
            id="newPassword"
            label="Mật khẩu mới"
            type="password"
            placeholder="••••••••"
            {...register("newPassword", { required: "Vui lòng nhập mật khẩu mới" })}
            error={errors.newPassword?.message as string}
          />

          <Input 
            id="confirmPassword"
            label="Xác nhận mật khẩu mới"
            type="password"
            placeholder="••••••••"
            {...register("confirmPassword", { required: "Vui lòng xác nhận mật khẩu mới" })}
            error={errors.confirmPassword?.message as string}
          />

          <div className="flex gap-2 mt-4 pt-4 border-t border-[var(--border-color)]">
            <Button 
              type="submit" 
              variant="primary" 
              loading={isSubmitting}
              icon={<Key size={16} />}
            >
              Lưu mật khẩu mới
            </Button>
            <Button 
              type="button" 
              variant="secondary" 
              onClick={onClose}
            >
              Hủy
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
