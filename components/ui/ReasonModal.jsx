"use client";

import { useState } from "react";
import Modal from "./Modal";
import Button from "./Button";
import Textarea from "./Textarea";

/**
 * Modal that requires a written reason before confirming an action (reject a listing,
 * warn/ban a user, reject a review, etc.) — the spec calls for this in several moderation
 * flows ("Reject / Request Docs", "Suspend / Ban / Warn").
 */
export default function ReasonModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Reason required",
  description = "This will be visible to the submitter.",
  confirmLabel = "Confirm",
  placeholder = "Explain why...",
  loading = false,
}) {
  const [reason, setReason] = useState("");
  const [touched, setTouched] = useState(false);
  const error = touched && !reason.trim() ? "A reason is required" : undefined;

  function handleConfirm() {
    if (!reason.trim()) {
      setTouched(true);
      return;
    }
    onConfirm(reason.trim());
    setReason("");
    setTouched(false);
  }

  function handleClose() {
    setReason("");
    setTouched(false);
    onClose();
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="sm"
      title={title}
      description={description}
      footer={
        <>
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleConfirm} loading={loading}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <Textarea
        label="Reason"
        required
        rows={3}
        placeholder={placeholder}
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        onBlur={() => setTouched(true)}
        error={error}
        autoFocus
      />
    </Modal>
  );
}
