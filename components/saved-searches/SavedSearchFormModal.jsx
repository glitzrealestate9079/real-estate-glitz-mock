"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";

const PROPERTY_TYPES = ["Apartment", "Villa", "Plot", "Commercial", "Studio", "PG"];
const LISTING_TYPES = ["Sell", "Rent", "PG"];
const BEDROOM_OPTIONS = ["Any", "1", "2", "2+", "3+", "4+"];
const FREQUENCIES = ["Instant", "Daily", "Weekly", "Off"];

const schema = yup.object({
  userName: yup.string().trim().required("User name is required").min(2, "Name is too short"),
  userEmail: yup.string().trim().email("Enter a valid email address").required("Email is required"),
  city: yup.string().trim().required("City is required"),
  propertyType: yup.string().oneOf(PROPERTY_TYPES).required("Select a property type"),
  listingType: yup.string().oneOf(LISTING_TYPES).required("Select a listing type"),
  bedrooms: yup.string().oneOf(BEDROOM_OPTIONS).required("Select a bedroom filter"),
  minBudget: yup.number().typeError("Enter a valid amount").min(0, "Must be 0 or more").required("Minimum budget is required"),
  maxBudget: yup
    .number()
    .typeError("Enter a valid amount")
    .required("Maximum budget is required")
    .moreThan(yup.ref("minBudget"), "Maximum budget must be greater than the minimum"),
  alertFrequency: yup.string().oneOf(FREQUENCIES).required("Select an alert frequency"),
});

const DEFAULT_VALUES = {
  userName: "",
  userEmail: "",
  city: "",
  propertyType: "Apartment",
  listingType: "Sell",
  bedrooms: "Any",
  minBudget: "",
  maxBudget: "",
  alertFrequency: "Instant",
};

/** Add/Edit modal for a saved search — used when support sets up an alert on a buyer's behalf. */
export default function SavedSearchFormModal({ isOpen, onClose, onSubmit, initialData, submitting }) {
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
          ? {
              userName: initialData.userName,
              userEmail: initialData.userEmail,
              city: initialData.city,
              propertyType: initialData.propertyType,
              listingType: initialData.listingType,
              bedrooms: initialData.bedrooms,
              minBudget: initialData.minBudget,
              maxBudget: initialData.maxBudget,
              alertFrequency: initialData.alertFrequency,
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
      title={isEdit ? `Edit Saved Search — ${initialData?.id}` : "Add Saved Search"}
      description="Set up search-alert criteria on behalf of a buyer or tenant."
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit(onSubmit)} loading={submitting}>
            {isEdit ? "Save Changes" : "Add Saved Search"}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input label="User Name" required error={errors.userName?.message} {...register("userName")} />
        <Input label="Email" type="email" required error={errors.userEmail?.message} {...register("userEmail")} />
        <Input label="City" required error={errors.city?.message} {...register("city")} />
        <Select label="Property Type" required error={errors.propertyType?.message} {...register("propertyType")}>
          {PROPERTY_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </Select>
        <Select label="Listing Type" required error={errors.listingType?.message} {...register("listingType")}>
          {LISTING_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </Select>
        <Select label="Bedrooms" required error={errors.bedrooms?.message} {...register("bedrooms")}>
          {BEDROOM_OPTIONS.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </Select>
        <Input label="Min Budget (₹)" type="number" required error={errors.minBudget?.message} {...register("minBudget")} />
        <Input label="Max Budget (₹)" type="number" required error={errors.maxBudget?.message} {...register("maxBudget")} />
        <Select
          label="Alert Frequency"
          required
          error={errors.alertFrequency?.message}
          {...register("alertFrequency")}
          containerClassName="sm:col-span-2"
        >
          {FREQUENCIES.map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </Select>
      </form>
    </Modal>
  );
}
