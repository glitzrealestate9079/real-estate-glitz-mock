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

const schema = yup.object({
  title: yup.string().trim().required("Page title is required"),
  slug: yup
    .string()
    .trim()
    .required("Slug is required")
    .matches(/^\/[a-z0-9-]*$/, "Must start with / and use lowercase letters, numbers, hyphens"),
  content: yup.string().trim().required("Page content is required").min(10, "Content is too short"),
  seoTitle: yup.string().trim().required("SEO title is required"),
  seoDescription: yup.string().trim().required("SEO description is required").max(160, "Keep it under 160 characters"),
  status: yup.string().oneOf(["draft", "published"]).required("Select a status"),
});

const DEFAULT_VALUES = { title: "", slug: "", content: "", seoTitle: "", seoDescription: "", status: "draft" };

/** Add/Edit modal for a static page (About, Terms, Privacy, FAQ, etc. — Section 4.9). */
export default function StaticPageFormModal({ isOpen, onClose, onSubmit, initialData, submitting }) {
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
              title: initialData.title,
              slug: initialData.slug,
              content: initialData.content,
              seoTitle: initialData.seoTitle,
              seoDescription: initialData.seoDescription,
              status: initialData.status,
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
      title={isEdit ? `Edit Page — ${initialData?.title}` : "Add Static Page"}
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit(onSubmit)} loading={submitting}>
            {isEdit ? "Save Changes" : "Add Page"}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input label="Page Title" required error={errors.title?.message} {...register("title")} />
          <Input label="URL Slug" required error={errors.slug?.message} {...register("slug")} placeholder="/about" />
        </div>
        <Textarea label="Content" required rows={5} error={errors.content?.message} {...register("content")} />
        <Select label="Status" required error={errors.status?.message} {...register("status")}>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
        </Select>

        <div className="border-t border-gray-100 pt-4 dark:border-gray-800">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">SEO Metadata</p>
          <div className="space-y-4">
            <Input label="SEO Title" required error={errors.seoTitle?.message} {...register("seoTitle")} />
            <Textarea label="SEO Description" required rows={2} error={errors.seoDescription?.message} {...register("seoDescription")} />
          </div>
        </div>
      </form>
    </Modal>
  );
}
