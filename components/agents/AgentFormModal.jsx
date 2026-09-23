"use client";

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Checkbox from "@/components/ui/Checkbox";

const SPECIALIZATIONS = ["Apartments", "Villas", "Plots", "Commercial", "PG / Co-living"];

const schema = yup.object({
  name: yup.string().trim().required("Agent name is required").min(2, "Name is too short"),
  email: yup.string().trim().email("Enter a valid email address").required("Email is required"),
  phone: yup
    .string()
    .trim()
    .required("Phone number is required")
    .matches(/^[+]?[\d\s-]{10,15}$/, "Enter a valid phone number"),
  agency: yup.string().trim().required("Agency / firm name is required"),
  city: yup.string().trim().required("City is required"),
  reraNumber: yup.string().trim().notRequired(),
  status: yup.string().oneOf(["active", "inactive"]).required("Select a status"),
  specializations: yup.array().of(yup.string()).min(1, "Select at least one specialization"),
});

const DEFAULT_VALUES = {
  name: "",
  email: "",
  phone: "",
  agency: "",
  city: "",
  reraNumber: "",
  status: "active",
  specializations: [],
};

/** Add/Edit modal for an agent's business profile — separate from the account-moderation form in Users & Agents. */
export default function AgentFormModal({ isOpen, onClose, onSubmit, initialData, submitting }) {
  const isEdit = Boolean(initialData);
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm({ resolver: yupResolver(schema), defaultValues: DEFAULT_VALUES });

  useEffect(() => {
    if (isOpen) {
      reset(
        initialData
          ? {
              name: initialData.name,
              email: initialData.email,
              phone: initialData.phone,
              agency: initialData.agency,
              city: initialData.city,
              reraNumber: initialData.reraNumber ?? "",
              status: initialData.status,
              specializations: initialData.specializations ?? [],
            }
          : DEFAULT_VALUES
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, initialData]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      title={isEdit ? `Edit Agent — ${initialData?.id}` : "Add Agent"}
      description="Business profile shown on the Agents performance module."
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit(onSubmit)} loading={submitting}>
            {isEdit ? "Save Changes" : "Add Agent"}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input label="Full Name" required error={errors.name?.message} {...register("name")} />
          <Input label="Email" type="email" required error={errors.email?.message} {...register("email")} />
          <Input label="Phone" required error={errors.phone?.message} {...register("phone")} placeholder="+91 98765 43210" />
          <Input label="Agency / Firm" required error={errors.agency?.message} {...register("agency")} />
          <Input label="City" required error={errors.city?.message} {...register("city")} />
          <Input label="RERA Number (optional)" error={errors.reraNumber?.message} {...register("reraNumber")} />
          <Select label="Status" required error={errors.status?.message} {...register("status")}>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </Select>
        </div>

        <Controller
          name="specializations"
          control={control}
          render={({ field }) => (
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Specializations <span className="text-danger">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {SPECIALIZATIONS.map((s) => (
                  <Checkbox
                    key={s}
                    label={s}
                    checked={field.value.includes(s)}
                    onChange={(e) => {
                      field.onChange(
                        e.target.checked ? [...field.value, s] : field.value.filter((v) => v !== s)
                      );
                    }}
                  />
                ))}
              </div>
              {errors.specializations && <p className="mt-1 text-xs text-danger">{errors.specializations.message}</p>}
            </div>
          )}
        />
      </form>
    </Modal>
  );
}
