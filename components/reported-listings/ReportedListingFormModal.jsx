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
import { REPORT_REASONS } from "@/redux/slices/reportedListingsSlice";

const schema = yup.object({
  listingId: yup.string().required("Select the reported listing"),
  reportedByName: yup.string().trim().required("Reporter's name is required"),
  reportedByPhone: yup
    .string()
    .trim()
    .required("Phone number is required")
    .matches(/^[+]?[\d\s-]{10,15}$/, "Enter a valid phone number"),
  reason: yup.string().oneOf(REPORT_REASONS).required("Select a reason"),
  details: yup.string().trim().required("Add a short description of the complaint").min(10, "Description is too short"),
});

const DEFAULT_VALUES = { listingId: "", reportedByName: "", reportedByPhone: "", reason: REPORT_REASONS[0], details: "" };

/**
 * Logs a buyer-reported listing complaint that came in by phone/email — there's no public buyer
 * portal in this project, so admins record the report here rather than it arriving automatically.
 */
export default function ReportedListingFormModal({ isOpen, onClose, onSubmit, submitting }) {
  const listings = useAppSelector((state) => state.listings.items);
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
    if (isOpen) reset(DEFAULT_VALUES);
  }, [isOpen]);

  function submit(values) {
    const listing = listings.find((l) => l.id === values.listingId);
    onSubmit({ ...values, listingTitle: listing?.title ?? "" });
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      title="Log Reported Listing"
      description="Record a buyer's complaint about a live listing — fake, duplicate, wrong price, or otherwise."
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit(submit)} loading={submitting}>
            Log Report
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit(submit)} className="space-y-4">
        <Select
          label="Listing"
          required
          error={errors.listingId?.message}
          placeholder="Select the reported listing"
          value={listingId ?? ""}
          onChange={(e) => setValue("listingId", e.target.value)}
        >
          {listings.map((l) => (
            <option key={l.id} value={l.id}>
              {l.id} — {l.title}
            </option>
          ))}
        </Select>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input label="Reported By" required error={errors.reportedByName?.message} {...register("reportedByName")} />
          <Input
            label="Phone"
            required
            error={errors.reportedByPhone?.message}
            {...register("reportedByPhone")}
            placeholder="+91 98765 43210"
          />
        </div>
        <Select label="Reason" required error={errors.reason?.message} {...register("reason")}>
          {REPORT_REASONS.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </Select>
        <Textarea
          label="Details"
          required
          rows={3}
          error={errors.details?.message}
          {...register("details")}
          placeholder="What did the reporter say?"
        />
      </form>
    </Modal>
  );
}
