"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";

const schema = yup.object({
  code: yup
    .string()
    .trim()
    .required("Coupon code is required")
    .matches(/^[A-Za-z0-9]{3,20}$/, "Use 3-20 letters/numbers, no spaces"),
  discountType: yup.string().oneOf(["percentage", "flat"]).required("Select a discount type"),
  discountValue: yup
    .number()
    .typeError("Enter a valid amount")
    .positive("Must be positive")
    .required("Discount value is required")
    .when("$discountType", {
      is: "percentage",
      then: (s) => s.max(100, "Percentage can't exceed 100"),
    }),
  applicablePlans: yup.string().trim().required("e.g. All Plans, or Featured, Premium"),
  maxUses: yup.number().typeError("Enter a number").min(0, "Can't be negative").required("Required (0 = unlimited)"),
  expiryDate: yup.string().required("Expiry date is required"),
  status: yup.string().oneOf(["active", "disabled"]).required("Select a status"),
});

const resolver = (values, _context, options) =>
  yupResolver(schema)(values, { discountType: values.discountType }, options);

const DEFAULT_VALUES = {
  code: "",
  discountType: "percentage",
  discountValue: "",
  applicablePlans: "All Plans",
  maxUses: 0,
  expiryDate: "",
  status: "active",
};

/** Add/Edit modal for a discount coupon code (Section 4.5). */
export default function CouponFormModal({ isOpen, onClose, onSubmit, initialData, submitting }) {
  const isEdit = Boolean(initialData);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ resolver, defaultValues: DEFAULT_VALUES });

  useEffect(() => {
    if (isOpen) {
      reset(
        initialData
          ? {
              code: initialData.code,
              discountType: initialData.discountType,
              discountValue: initialData.discountValue,
              applicablePlans: initialData.applicablePlans,
              maxUses: initialData.maxUses,
              expiryDate: initialData.expiryDate,
              status: initialData.status === "expired" ? "disabled" : initialData.status,
            }
          : DEFAULT_VALUES
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, initialData]);

  function submit(values) {
    onSubmit({ ...values, code: values.code.toUpperCase() });
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      title={isEdit ? `Edit Coupon — ${initialData?.id}` : "Add Coupon"}
      description="Coupon codes are matched case-insensitively at checkout."
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit(submit)} loading={submitting}>
            {isEdit ? "Save Changes" : "Add Coupon"}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit(submit)} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input label="Coupon Code" required error={errors.code?.message} {...register("code")} placeholder="e.g. WELCOME50" containerClassName="sm:col-span-2" />
          <Select label="Discount Type" required error={errors.discountType?.message} {...register("discountType")}>
            <option value="percentage">Percentage (%)</option>
            <option value="flat">Flat Amount (₹)</option>
          </Select>
          <Input label="Discount Value" type="number" required error={errors.discountValue?.message} {...register("discountValue")} />
          <Input
            label="Applicable Plans"
            required
            error={errors.applicablePlans?.message}
            {...register("applicablePlans")}
            placeholder="All Plans, or Featured, Premium"
            containerClassName="sm:col-span-2"
          />
          <Input label="Max Uses (0 = unlimited)" type="number" required error={errors.maxUses?.message} {...register("maxUses")} />
          <Input label="Expiry Date" type="date" required error={errors.expiryDate?.message} {...register("expiryDate")} />
          <Select label="Status" required error={errors.status?.message} {...register("status")} containerClassName="sm:col-span-2">
            <option value="active">Active</option>
            <option value="disabled">Disabled</option>
          </Select>
        </div>
      </form>
    </Modal>
  );
}
