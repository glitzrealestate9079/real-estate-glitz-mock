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

const CATEGORIES = ["Market Trends", "Buying Guide", "Legal", "Investment", "News"];
const STATUSES = ["draft", "published", "archived"];

const schema = yup.object({
  title: yup.string().trim().required("Title is required").min(8, "Title is too short"),
  author: yup.string().trim().required("Author is required"),
  category: yup.string().oneOf(CATEGORIES).required("Select a category"),
  status: yup.string().oneOf(STATUSES).required("Select a status"),
  excerpt: yup.string().trim().required("Excerpt is required").max(200, "Keep it under 200 characters"),
  content: yup.string().trim().required("Article content is required").min(20, "Content is too short"),
  seoTitle: yup.string().trim().required("SEO title is required"),
  seoDescription: yup.string().trim().required("SEO description is required").max(160, "Keep it under 160 characters"),
});

const DEFAULT_VALUES = { title: "", author: "", category: "Market Trends", status: "draft", excerpt: "", content: "", seoTitle: "", seoDescription: "" };

function slugify(title) {
  return title.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

/** Add/Edit modal for a blog/news article, including its own SEO metadata (Section 4.9). */
export default function ArticleFormModal({ isOpen, onClose, onSubmit, initialData, submitting }) {
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
              author: initialData.author,
              category: initialData.category,
              status: initialData.status,
              excerpt: initialData.excerpt,
              content: initialData.content,
              seoTitle: initialData.seoTitle,
              seoDescription: initialData.seoDescription,
            }
          : DEFAULT_VALUES
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, initialData]);

  function submit(values) {
    onSubmit({ ...values, slug: slugify(values.title) });
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      title={isEdit ? `Edit Article — ${initialData?.id}` : "Add Article"}
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit(submit)} loading={submitting}>
            {isEdit ? "Save Changes" : "Add Article"}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit(submit)} className="space-y-4">
        <Input label="Title" required error={errors.title?.message} {...register("title")} />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Input label="Author" required error={errors.author?.message} {...register("author")} />
          <Select label="Category" required error={errors.category?.message} {...register("category")}>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
          <Select label="Status" required error={errors.status?.message} {...register("status")}>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </option>
            ))}
          </Select>
        </div>
        <Textarea label="Excerpt" required rows={2} hint="Shown in article listings" error={errors.excerpt?.message} {...register("excerpt")} />
        <Textarea label="Content" required rows={5} error={errors.content?.message} {...register("content")} />

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
