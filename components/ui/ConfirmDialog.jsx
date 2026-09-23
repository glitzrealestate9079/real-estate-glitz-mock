"use client";

import { AlertTriangle } from "lucide-react";
import Modal from "./Modal";
import Button from "./Button";

/**
 * Confirmation modal for destructive/important actions (delete, ban, reject, etc.).
 * Props: isOpen, onClose, onConfirm, title, description, confirmLabel, variant ("danger"|"primary"), loading
 */
export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = "Are you sure?",
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "danger",
  loading = false,
}) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button variant={variant} onClick={onConfirm} loading={loading}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-danger/10 text-danger">
          <AlertTriangle className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{title}</p>
          {description && <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{description}</p>}
        </div>
      </div>
    </Modal>
  );
}
