"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";

const ROLES = ["Buyer", "Owner", "Agent", "Dealer", "Builder"];
const VERIFIED_ROLES = ["Agent", "Dealer", "Builder"];

// `agencyName`/`reraNumber` only apply to Agent/Dealer/Builder — required only for those roles,
// same when($role) resolver pattern used in ListingFormModal (reads the role straight off the
// submitted values so it's always current, no stale-context pitfalls).
const schema = yup.object({
  name: yup.string().trim().required("Name is required").min(3, "Name is too short"),
  email: yup.string().trim().email("Enter a valid email address").required("Email is required"),
  phone: yup
    .string()
    .trim()
    .required("Phone number is required")
    .matches(/^[+]?[\d\s-]{10,15}$/, "Enter a valid phone number"),
  role: yup.string().oneOf(ROLES).required("Select a role"),
  city: yup.string().trim().required("City is required"),
  agencyName: yup.string().when("$role", {
    is: (v) => v === "Dealer" || v === "Builder",
    then: (s) => s.trim().required("Agency / firm name is required"),
    otherwise: (s) => s.nullable(),
  }),
  reraNumber: yup.string().when("$role", {
    is: (v) => VERIFIED_ROLES.includes(v),
    then: (s) => s.trim().required("RERA registration number is required"),
    otherwise: (s) => s.nullable(),
  }),
});

const resolver = (values, _context, options) => yupResolver(schema)(values, { role: values.role }, options);

const DEFAULT_VALUES = { name: "", email: "", phone: "", role: "Buyer", city: "", agencyName: "", reraNumber: "" };

/**
 * Add/Edit modal for a user. Role decides which extra fields show (Section 2.6 — agents/dealers/
 * builders carry an agency name + RERA registration number; buyers/owners don't).
 */
export default function UserFormModal({ isOpen, onClose, onSubmit, initialData, submitting }) {
  const isEdit = Boolean(initialData);
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm({ resolver, defaultValues: DEFAULT_VALUES });

  const role = watch("role");
  const needsVerificationFields = VERIFIED_ROLES.includes(role);

  useEffect(() => {
    if (isOpen) {
      reset(
        initialData
          ? {
              ...DEFAULT_VALUES,
              name: initialData.name,
              email: initialData.email,
              phone: initialData.phone,
              role: initialData.role,
              city: initialData.city,
              agencyName: initialData.verification?.agencyName ?? "",
              reraNumber: initialData.verification?.reraNumber ?? "",
            }
          : DEFAULT_VALUES
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, initialData]);

  function submit(values) {
    onSubmit(values);
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      title={isEdit ? `Edit User — ${initialData?.id}` : "Add User"}
      description="Agents, dealers and builders also require an agency name and RERA registration number."
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit(submit)} loading={submitting}>
            {isEdit ? "Save Changes" : "Add User"}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit(submit)} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input label="Full Name" required error={errors.name?.message} {...register("name")} containerClassName="sm:col-span-2" />
          <Input label="Email" type="email" required error={errors.email?.message} {...register("email")} />
          <Input label="Phone" required error={errors.phone?.message} {...register("phone")} placeholder="+91 98765 43210" />
          <Select label="Role" required error={errors.role?.message} {...register("role")}>
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </Select>
          <Input label="City" required error={errors.city?.message} {...register("city")} placeholder="e.g. Bangalore" />
        </div>

        {needsVerificationFields && (
          <div className="border-t border-gray-100 pt-4 dark:border-gray-800">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
              Agency &amp; RERA Details
            </p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                label="Agency / Firm Name"
                required={role === "Dealer" || role === "Builder"}
                error={errors.agencyName?.message}
                {...register("agencyName")}
                placeholder="e.g. Mehta Realty"
              />
              <Input
                label="RERA Registration Number"
                required
                error={errors.reraNumber?.message}
                {...register("reraNumber")}
                placeholder="e.g. KA-RERA-12345"
              />
            </div>
          </div>
        )}
      </form>
    </Modal>
  );
}
