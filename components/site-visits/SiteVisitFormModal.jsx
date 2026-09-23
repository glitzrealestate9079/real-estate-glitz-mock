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
import { useAppSelector } from "@/hooks/useReduxHooks";

const STATUSES = ["requested", "confirmed", "rescheduled", "completed", "cancelled"];

const schema = yup.object({
  buyerName: yup.string().trim().required("Buyer name is required").min(2, "Name is too short"),
  buyerPhone: yup
    .string()
    .trim()
    .required("Phone number is required")
    .matches(/^[+]?[\d\s-]{10,15}$/, "Enter a valid phone number"),
  listingId: yup.string().required("Select the property being visited"),
  city: yup.string().trim().required("City / locality is required"),
  agentId: yup.string().required("Assign an agent or host"),
  date: yup.string().required("Select a visit date"),
  time: yup.string().trim().required("Enter a visit time"),
  status: yup.string().oneOf(STATUSES).required("Select a status"),
  notes: yup.string().trim().notRequired(),
});

const DEFAULT_VALUES = {
  buyerName: "",
  buyerPhone: "",
  listingId: "",
  city: "",
  agentId: "",
  date: "",
  time: "",
  status: "requested",
  notes: "",
};

/** Add/Edit modal for a site visit — links a buyer to a real listing and a real agent/host. */
export default function SiteVisitFormModal({ isOpen, onClose, onSubmit, initialData, submitting }) {
  const isEdit = Boolean(initialData);
  const listings = useAppSelector((state) => state.listings.items);
  const users = useAppSelector((state) => state.users.items);
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm({ resolver: yupResolver(schema), defaultValues: DEFAULT_VALUES });

  const listingId = watch("listingId");

  useEffect(() => {
    if (isOpen) {
      reset(
        initialData
          ? {
              buyerName: initialData.buyerName,
              buyerPhone: initialData.buyerPhone,
              listingId: initialData.listingId,
              city: initialData.city,
              agentId: initialData.agentId,
              date: initialData.date,
              time: initialData.time,
              status: initialData.status,
              notes: initialData.notes ?? "",
            }
          : DEFAULT_VALUES
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, initialData]);

  // Auto-fill city from the selected listing when adding a new visit, so the admin doesn't have
  // to retype something the Listings module already knows — still editable afterward.
  function handleListingChange(e) {
    const id = e.target.value;
    setValue("listingId", id);
    if (!isEdit) {
      const listing = listings.find((l) => l.id === id);
      if (listing) setValue("city", listing.city);
    }
  }

  function submit(values) {
    const listing = listings.find((l) => l.id === values.listingId);
    const agent = users.find((u) => u.id === values.agentId);
    onSubmit({
      ...values,
      listingTitle: listing?.title ?? initialData?.listingTitle ?? "",
      agentName: agent?.name ?? initialData?.agentName ?? "",
    });
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      title={isEdit ? `Edit Site Visit — ${initialData?.id}` : "Schedule Site Visit"}
      description="Book a buyer/tenant walkthrough for a listing with an assigned agent."
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit(submit)} loading={submitting}>
            {isEdit ? "Save Changes" : "Schedule Visit"}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit(submit)} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input label="Buyer Name" required error={errors.buyerName?.message} {...register("buyerName")} />
          <Input
            label="Phone"
            required
            error={errors.buyerPhone?.message}
            {...register("buyerPhone")}
            placeholder="+91 98765 43210"
          />
          <Select
            label="Property"
            required
            error={errors.listingId?.message}
            placeholder="Select a listing"
            value={listingId ?? ""}
            onChange={handleListingChange}
            containerClassName="sm:col-span-2"
          >
            {listings.map((l) => (
              <option key={l.id} value={l.id}>
                {l.id} — {l.title}
              </option>
            ))}
          </Select>
          <Input label="City / Locality" required error={errors.city?.message} {...register("city")} />
          <Select label="Agent / Host" required error={errors.agentId?.message} placeholder="Select a user" {...register("agentId")}>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name} ({u.role})
              </option>
            ))}
          </Select>
          <Input label="Visit Date" type="date" required error={errors.date?.message} {...register("date")} />
          <Input label="Visit Time" required error={errors.time?.message} {...register("time")} placeholder="e.g. 11:00 AM" />
          <Select label="Status" required error={errors.status?.message} {...register("status")}>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </option>
            ))}
          </Select>
        </div>

        <Textarea
          label="Notes (optional)"
          rows={3}
          error={errors.notes?.message}
          {...register("notes")}
          placeholder="Anything the agent should know before the visit"
        />
      </form>
    </Modal>
  );
}
