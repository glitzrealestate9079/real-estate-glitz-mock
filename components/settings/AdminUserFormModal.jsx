"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";

const ROLES = ["Super Admin", "Moderator", "Support", "Finance"];

const schema = yup.object({
  name: yup.string().trim().required("Name is required"),
  email: yup.string().trim().email("Enter a valid email address").required("Email is required"),
  role: yup.string().oneOf(ROLES).required("Select a role"),
});

const DEFAULT_VALUES = { name: "", email: "", role: "Support" };

/** Add/Edit modal for a staff/admin account with role-based access (Section 4.10). */
export default function AdminUserFormModal({ isOpen, onClose, onSubmit, initialData, submitting }) {
  const isEdit = Boolean(initialData);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ resolver: yupResolver(schema), defaultValues: DEFAULT_VALUES });

  useEffect(() => {
    if (isOpen) {
      reset(initialData ? { name: initialData.name, email: initialData.email, role: initialData.role } : DEFAULT_VALUES);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, initialData]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      title={isEdit ? `Edit Admin — ${initialData?.id}` : "Add Admin User"}
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit(onSubmit)} loading={submitting}>
            {isEdit ? "Save Changes" : "Add Admin"}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input label="Full Name" required error={errors.name?.message} {...register("name")} />
        <Input label="Email" type="email" required error={errors.email?.message} {...register("email")} />
        <Select label="Role" required error={errors.role?.message} {...register("role")}>
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </Select>
      </form>
    </Modal>
  );
}
