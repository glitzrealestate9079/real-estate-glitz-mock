"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";

const ENVIRONMENTS = ["Production", "Sandbox"];

const schema = yup.object({
  name: yup.string().trim().required("Key name is required (e.g. what service it's for)"),
  environment: yup.string().oneOf(ENVIRONMENTS).required("Select an environment"),
});

const DEFAULT_VALUES = { name: "", environment: "Sandbox" };

/** Add/Edit modal for an API key record. New keys generate a masked value (Section 4.10). */
export default function ApiKeyFormModal({ isOpen, onClose, onSubmit, initialData, submitting }) {
  const isEdit = Boolean(initialData);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ resolver: yupResolver(schema), defaultValues: DEFAULT_VALUES });

  useEffect(() => {
    if (isOpen) {
      reset(initialData ? { name: initialData.name, environment: initialData.environment } : DEFAULT_VALUES);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, initialData]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      title={isEdit ? `Edit API Key — ${initialData?.id}` : "Generate API Key"}
      description={isEdit ? undefined : "The full key is shown once after creation — copy it immediately."}
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit(onSubmit)} loading={submitting}>
            {isEdit ? "Save Changes" : "Generate Key"}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input label="Key Name" required error={errors.name?.message} {...register("name")} placeholder="e.g. Payment Gateway (Razorpay)" />
        <Select label="Environment" required error={errors.environment?.message} {...register("environment")}>
          {ENVIRONMENTS.map((e) => (
            <option key={e} value={e}>
              {e}
            </option>
          ))}
        </Select>
      </form>
    </Modal>
  );
}
