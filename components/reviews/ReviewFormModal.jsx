"use client";

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Star } from "lucide-react";
import { cn } from "@/utils/cn";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Textarea from "@/components/ui/Textarea";
import { useAppSelector } from "@/hooks/useReduxHooks";

const schema = yup.object({
  listingId: yup.string().required("Select the listing this review is about"),
  reviewerName: yup.string().trim().required("Reviewer name is required"),
  reviewerEmail: yup.string().trim().email("Enter a valid email address").required("Reviewer email is required"),
  rating: yup.number().min(1, "Select a rating").max(5).required("Select a rating"),
  title: yup.string().trim().required("Review title is required"),
  comment: yup.string().trim().required("Review comment is required").min(5, "Comment is too short"),
});

const DEFAULT_VALUES = { listingId: "", reviewerName: "", reviewerEmail: "", rating: 0, title: "", comment: "" };

function StarPicker({ value, onChange, error }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
        Rating <span className="text-danger">*</span>
      </label>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className="rounded-md p-1 text-gray-300 hover:text-amber-400"
            aria-label={`${n} star${n > 1 ? "s" : ""}`}
          >
            <Star className={cn("h-6 w-6", n <= value && "fill-amber-400 text-amber-400")} />
          </button>
        ))}
      </div>
      {error && <p className="mt-1 text-xs text-danger">{error}</p>}
    </div>
  );
}

/** Add/Edit modal for a listing review (Section 4.7) — admins can log or correct a review here. */
export default function ReviewFormModal({ isOpen, onClose, onSubmit, initialData, submitting }) {
  const isEdit = Boolean(initialData);
  const listings = useAppSelector((state) => state.listings.items);
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ resolver: yupResolver(schema), defaultValues: DEFAULT_VALUES });

  useEffect(() => {
    if (isOpen) {
      reset(
        initialData
          ? {
              listingId: initialData.listingId,
              reviewerName: initialData.reviewerName,
              reviewerEmail: initialData.reviewerEmail,
              rating: initialData.rating,
              title: initialData.title,
              comment: initialData.comment,
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
      size="md"
      title={isEdit ? `Edit Review — ${initialData?.id}` : "Add Review"}
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit(submit)} loading={submitting}>
            {isEdit ? "Save Changes" : "Add Review"}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit(submit)} className="space-y-4">
        <Select label="Listing" required error={errors.listingId?.message} placeholder="Select a listing" {...register("listingId")}>
          {listings.map((l) => (
            <option key={l.id} value={l.id}>
              {l.id} — {l.title}
            </option>
          ))}
        </Select>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input label="Reviewer Name" required error={errors.reviewerName?.message} {...register("reviewerName")} />
          <Input label="Reviewer Email" type="email" required error={errors.reviewerEmail?.message} {...register("reviewerEmail")} />
        </div>

        <Controller control={control} name="rating" render={({ field }) => <StarPicker value={field.value} onChange={field.onChange} error={errors.rating?.message} />} />

        <Input label="Review Title" required error={errors.title?.message} {...register("title")} />
        <Textarea label="Comment" required rows={3} error={errors.comment?.message} {...register("comment")} />
      </form>
    </Modal>
  );
}
