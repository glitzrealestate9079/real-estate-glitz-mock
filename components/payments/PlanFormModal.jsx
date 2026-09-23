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
import Checkbox from "@/components/ui/Checkbox";

const BILLING_CYCLES = ["One-time", "Monthly", "Quarterly", "Yearly"];

const schema = yup.object({
  name: yup.string().trim().required("Plan name is required"),
  price: yup.number().typeError("Enter a valid amount").min(0, "Price can't be negative").required("Price is required"),
  billingCycle: yup.string().oneOf(BILLING_CYCLES).required("Select a billing cycle"),
  validityDays: yup.number().typeError("Enter a number of days").positive("Must be positive").required("Validity is required"),
  listingsIncluded: yup.string().trim().required("e.g. 5 or Unlimited"),
  featuredCredits: yup.number().typeError("Enter a number").min(0, "Can't be negative").required("Required (0 if none)"),
  featuresText: yup.string().trim().required("List at least one feature"),
  active: yup.boolean(),
  popular: yup.boolean(),
});

const DEFAULT_VALUES = {
  name: "",
  price: "",
  billingCycle: "Monthly",
  validityDays: 30,
  listingsIncluded: "",
  featuredCredits: 0,
  featuresText: "",
  active: true,
  popular: false,
};

/** Add/Edit modal for a listing package / pricing plan (Section 4.5). */
export default function PlanFormModal({ isOpen, onClose, onSubmit, initialData, submitting }) {
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
          ? { ...initialData, featuresText: (initialData.features ?? []).join("\n") }
          : DEFAULT_VALUES
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, initialData]);

  function submit(values) {
    const { featuresText, ...rest } = values;
    onSubmit({
      ...rest,
      features: featuresText
        .split("\n")
        .map((f) => f.trim())
        .filter(Boolean),
    });
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      title={isEdit ? `Edit Plan — ${initialData?.id}` : "Add Pricing Plan"}
      description="One feature per line — shown to sellers/agents on the pricing page."
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit(submit)} loading={submitting}>
            {isEdit ? "Save Changes" : "Add Plan"}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit(submit)} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input label="Plan Name" required error={errors.name?.message} {...register("name")} containerClassName="sm:col-span-2" />
          <Input label="Price (₹)" type="number" required error={errors.price?.message} {...register("price")} />
          <Select label="Billing Cycle" required error={errors.billingCycle?.message} {...register("billingCycle")}>
            {BILLING_CYCLES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
          <Input label="Validity (days)" type="number" required error={errors.validityDays?.message} {...register("validityDays")} />
          <Input label="Listings Included" required error={errors.listingsIncluded?.message} {...register("listingsIncluded")} placeholder="e.g. 5 or Unlimited" />
          <Input label="Featured Credits" type="number" required error={errors.featuredCredits?.message} {...register("featuredCredits")} />
        </div>

        <Textarea
          label="Features (one per line)"
          required
          rows={4}
          error={errors.featuresText?.message}
          {...register("featuresText")}
          placeholder={"5 active listings\nHigher search ranking\nPriority support"}
        />

        <div className="flex flex-wrap gap-x-6 gap-y-2">
          <Checkbox label="Active (visible to sellers)" {...register("active")} containerClassName="w-auto" />
          <Checkbox label="Mark as Popular" {...register("popular")} containerClassName="w-auto" />
        </div>
      </form>
    </Modal>
  );
}
