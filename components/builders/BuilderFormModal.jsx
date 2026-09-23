"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

const schema = yup.object({
  name: yup.string().trim().required("Builder / firm name is required"),
  reraNumber: yup.string().trim().required("RERA registration number is required"),
  city: yup.string().trim().required("City is required"),
  establishedYear: yup
    .number()
    .typeError("Enter a valid year")
    .min(1950, "Enter a valid year")
    .max(new Date().getFullYear(), "Can't be in the future")
    .required("Established year is required"),
});

const DEFAULT_VALUES = { name: "", reraNumber: "", city: "", establishedYear: "" };

/** Add/Edit modal for a builder profile (Section 4.6). */
export default function BuilderFormModal({ isOpen, onClose, onSubmit, initialData, submitting }) {
  const isEdit = Boolean(initialData);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ resolver: yupResolver(schema), defaultValues: DEFAULT_VALUES });

  useEffect(() => {
    if (isOpen) {
      reset(
        initialData
          ? { name: initialData.name, reraNumber: initialData.reraNumber, city: initialData.city, establishedYear: initialData.establishedYear }
          : DEFAULT_VALUES
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, initialData]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      title={isEdit ? `Edit Builder — ${initialData?.id}` : "Add Builder"}
      description="Projects are managed separately from the builder's profile page."
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit(onSubmit)} loading={submitting}>
            {isEdit ? "Save Changes" : "Add Builder"}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input label="Builder / Firm Name" required error={errors.name?.message} {...register("name")} />
        <Input label="RERA Registration Number" required error={errors.reraNumber?.message} {...register("reraNumber")} placeholder="e.g. HR-RERA-99871" />
        <div className="grid grid-cols-2 gap-4">
          <Input label="City" required error={errors.city?.message} {...register("city")} />
          <Input label="Established Year" type="number" required error={errors.establishedYear?.message} {...register("establishedYear")} />
        </div>
      </form>
    </Modal>
  );
}
