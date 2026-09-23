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

const CATEGORIES = ["Listings", "Verification", "Payments", "Site Visits", "Trust & Safety", "Account"];

const schema = yup.object({
  question: yup.string().trim().required("Question is required").min(6, "Question is too short"),
  answer: yup.string().trim().required("Answer is required").min(10, "Answer is too short"),
  category: yup.string().required("Select a category"),
  order: yup.number().typeError("Enter a number").required("Display order is required").min(1, "Order must be at least 1"),
  status: yup.string().oneOf(["draft", "published"]).required("Select a status"),
});

const DEFAULT_VALUES = { question: "", answer: "", category: "Listings", order: 1, status: "draft" };

/** Add/Edit modal for a public-site FAQ entry — grouped by category, ordered within it. */
export default function FAQFormModal({ isOpen, onClose, onSubmit, initialData, submitting }) {
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
          ? { question: initialData.question, answer: initialData.answer, category: initialData.category, order: initialData.order, status: initialData.status }
          : DEFAULT_VALUES
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, initialData]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      title={isEdit ? `Edit FAQ — ${initialData?.id}` : "Add FAQ"}
      description="Shown on the public site's FAQ page, grouped by category and ordered within it."
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit(onSubmit)} loading={submitting}>
            {isEdit ? "Save Changes" : "Add FAQ"}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input label="Question" required error={errors.question?.message} {...register("question")} />
        <Textarea label="Answer" required rows={4} error={errors.answer?.message} {...register("answer")} />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Select label="Category" required error={errors.category?.message} {...register("category")} containerClassName="sm:col-span-1">
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
          <Input label="Display Order" required type="number" error={errors.order?.message} {...register("order")} />
          <Select label="Status" required error={errors.status?.message} {...register("status")}>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </Select>
        </div>
      </form>
    </Modal>
  );
}
