"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose?: () => void;
  title: React.ReactNode;
  children: React.ReactNode;
  maxWidth?: string; 
  description?: React.ReactNode;
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = "max-w-md",
  description,
}: ModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Khóa cuộn trang khi mở modal
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div 
      className="modal-overlay flex items-center justify-center fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className={`modal-content animate-slide-up bg-[var(--bg-card)] rounded-xl shadow-xl overflow-hidden ${maxWidth} w-full m-4  p-0! max-h-[90vh] flex flex-col`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header flex justify-between items-center px-6 py-4 border-b border-[var(--border-color)]">
          <h3 className="text-lg font-semibold m-0">{title}</h3>
          {onClose && (
            <button
              onClick={onClose}
              className="text-[var(--text-muted)] hover:text-[var(--danger)] transition-colors p-1"
              aria-label="Đóng"
            >
              <X size={20} />
            </button>
          )}
        </div>
        
        {description && (
          <div className="px-6 py-3 bg-[var(--bg-card-hover)] border-b border-[var(--border-color)] text-sm text-[var(--text-secondary)]">
            {description}
          </div>
        )}
        
        <div className="overflow-y-auto">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}
