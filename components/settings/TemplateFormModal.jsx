"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Textarea from "@/components/ui/Textarea";

const CHANNELS = ["Email", "SMS", "WhatsApp", "Push"];

// `subject` only applies to Email — same when($channel) resolver pattern as ListingForm.
const schema = yup.object({
  name: yup.string().trim().required("Template name is required"),
  channel: yup.string().oneOf(CHANNELS).required("Select a channel"),
  subject: yup.string().when("$channel", {
    is: "Email",
    then: (s) => s.trim().required("Subject line is required for email templates"),
    otherwise: (s) => s.nullable(),
  }),
  message: yup.string().trim().required("Message body is required").min(5, "Message is too short"),
  status: yup.string().oneOf(["active", "inactive"]).required("Select a status"),
});

const resolver = (values, _context, options) => yupResolver(schema)(values, { channel: values.channel }, options);

const DEFAULT_VALUES = { name: "", channel: "Email", subject: "", message: "", status: "active" };

/** Add/Edit modal for a notification message template (Section 4.10). */
export default function TemplateFormModal({ isOpen, onClose, onSubmit, initialData, submitting }) {
  const isEdit = Boolean(initialData);
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm({ resolver, defaultValues: DEFAULT_VALUES });

  const channel = watch("channel");

  useEffect(() => {
    if (isOpen) {
      reset(
        initialData
          ? { name: initialData.name, channel: initialData.channel, subject: initialData.subject ?? "", message: initialData.message, status: initialData.status }
          : DEFAULT_VALUES
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, initialData]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      title={isEdit ? `Edit Template — ${initialData?.id}` : "Add Notification Template"}
      description="Use {{placeholders}} like {{name}} or {{otp}} — they're filled in when the message is sent."
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit(onSubmit)} loading={submitting}>
            {isEdit ? "Save Changes" : "Add Template"}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input label="Template Name" required error={errors.name?.message} {...register("name")} />
          <Select label="Channel" required error={errors.channel?.message} {...register("channel")}>
            {CHANNELS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
        </div>
        {channel === "Email" && <Input label="Subject" required error={errors.subject?.message} {...register("subject")} />}
        <Textarea label="Message" required rows={4} error={errors.message?.message} {...register("message")} />
        <Select label="Status" required error={errors.status?.message} {...register("status")}>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </Select>
      </form>
    </Modal>
  );
}
