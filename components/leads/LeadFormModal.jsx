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

const CHANNELS = ["Call", "Chat", "Callback Request", "Contact Form", "WhatsApp"];
// Full CRM funnel order — matches the Kanban board columns on the Leads page and the LEAD_STAGES
// used for the agent performance breakdown, so this is the single source of truth for the set.
export const STATUSES = ["new", "contacted", "follow_up", "interested", "site_visit", "negotiation", "converted", "lost"];
export const STATUS_LABELS = {
  new: "New",
  contacted: "Contacted",
  follow_up: "Follow-up",
  interested: "Interested",
  site_visit: "Site Visit",
  negotiation: "Negotiation",
  converted: "Converted",
  lost: "Lost",
};

const schema = yup.object({
  buyerName: yup.string().trim().required("Buyer name is required").min(2, "Name is too short"),
  buyerPhone: yup
    .string()
    .trim()
    .required("Phone number is required")
    .matches(/^[+]?[\d\s-]{10,15}$/, "Enter a valid phone number"),
  buyerEmail: yup.string().trim().email("Enter a valid email address").notRequired(),
  budget: yup.string().trim().required("Budget is required"),
  listingId: yup.string().required("Select the listing this enquiry is about"),
  channel: yup.string().oneOf(CHANNELS).required("Select a channel"),
  status: yup.string().oneOf(STATUSES).required("Select a status"),
  message: yup.string().trim().required("Enquiry message is required").min(5, "Message is too short"),
  assignedTo: yup.string().trim().required("Assign this lead to a username"),
  nextFollowUpDate: yup.string().trim().notRequired(),
});

const DEFAULT_VALUES = {
  buyerName: "",
  buyerPhone: "",
  buyerEmail: "",
  budget: "",
  listingId: "",
  channel: "Call",
  status: "new",
  message: "",
  assignedTo: "",
  nextFollowUpDate: "",
};

/** Add/Edit modal for a lead — links to a real listing from the Listings module (Section 4.4). */
export default function LeadFormModal({ isOpen, onClose, onSubmit, initialData, submitting }) {
  const isEdit = Boolean(initialData);
  const listings = useAppSelector((state) => state.listings.items);
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
              buyerName: initialData.buyerName,
              buyerPhone: initialData.buyerPhone,
              buyerEmail: initialData.buyerEmail ?? "",
              budget: initialData.budget ?? "",
              listingId: initialData.listingId,
              channel: initialData.channel,
              status: initialData.status,
              message: initialData.message,
              assignedTo: initialData.assignedTo,
              nextFollowUpDate: initialData.nextFollowUpDate ?? "",
            }
          : DEFAULT_VALUES
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, initialData]);

  function submit(values) {
    const listing = listings.find((l) => l.id === values.listingId);
    onSubmit({ ...values, listingTitle: listing?.title ?? initialData?.listingTitle ?? "" });
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      title={isEdit ? `Edit Lead — ${initialData?.id}` : "Add Lead"}
      description="Log a manual enquiry (phone call, walk-in, etc.) into the central leads register."
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit(submit)} loading={submitting}>
            {isEdit ? "Save Changes" : "Add Lead"}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit(submit)} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input label="Buyer Name" required error={errors.buyerName?.message} {...register("buyerName")} />
          <Input label="Phone" required error={errors.buyerPhone?.message} {...register("buyerPhone")} placeholder="+91 98765 43210" />
          <Input label="Email (optional)" type="email" error={errors.buyerEmail?.message} {...register("buyerEmail")} />
          <Input label="Budget" required error={errors.budget?.message} {...register("budget")} placeholder="e.g. ₹70L - ₹85L" />
          <Select label="Listing" required error={errors.listingId?.message} placeholder="Select a listing" {...register("listingId")}>
            {listings.map((l) => (
              <option key={l.id} value={l.id}>
                {l.id} — {l.title}
              </option>
            ))}
          </Select>
          <Select label="Channel" required error={errors.channel?.message} {...register("channel")}>
            {CHANNELS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
          <Select label="Status" required error={errors.status?.message} {...register("status")}>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s]}
              </option>
            ))}
          </Select>
          <Input
            label="Assigned To (username)"
            required
            error={errors.assignedTo?.message}
            {...register("assignedTo")}
            placeholder="e.g. agent_ravi"
          />
          <Input
            label="Next Follow-up (optional)"
            type="date"
            error={errors.nextFollowUpDate?.message}
            {...register("nextFollowUpDate")}
            hint="Leave blank once the lead is converted or lost"
          />
        </div>

        <Textarea
          label="Enquiry Message"
          required
          rows={3}
          error={errors.message?.message}
          {...register("message")}
          placeholder="What did the buyer ask about?"
        />
      </form>
    </Modal>
  );
}
