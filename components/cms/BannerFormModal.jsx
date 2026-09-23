"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Checkbox from "@/components/ui/Checkbox";

const POSITIONS = ["Homepage Hero", "Homepage Secondary", "Search Results Top", "Listing Sidebar"];

const schema = yup.object({
  title: yup.string().trim().required("Internal title is required"),
  imageLabel: yup.string().trim().required("Describe the banner image (e.g. dimensions)"),
  linkUrl: yup.string().trim().required("Link URL is required"),
  position: yup.string().oneOf(POSITIONS).required("Select a placement"),
  startDate: yup.string().required("Start date is required"),
  endDate: yup
    .string()
    .required("End date is required")
    .test("after-start", "End date can't be before the start date", function (value) {
      return !this.parent.startDate || !value || value >= this.parent.startDate;
    }),
  active: yup.boolean(),
});

const DEFAULT_VALUES = { title: "", imageLabel: "", linkUrl: "", position: "Homepage Hero", startDate: "", endDate: "", active: true };

/** Add/Edit modal for a homepage/listing banner slot (Section 4.9). */
export default function BannerFormModal({ isOpen, onClose, onSubmit, initialData, submitting }) {
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
              imageLabel: initialData.imageLabel,
              linkUrl: initialData.linkUrl,
              position: initialData.position,
              startDate: initialData.startDate,
              endDate: initialData.endDate,
              active: initialData.active,
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
      size="md"
      title={isEdit ? `Edit Banner — ${initialData?.id}` : "Add Banner"}
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit(onSubmit)} loading={submitting}>
            {isEdit ? "Save Changes" : "Add Banner"}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input label="Internal Title" required error={errors.title?.message} {...register("title")} placeholder="e.g. Diwali Mega Sale Hero Banner" />
        <Input label="Image Description" required error={errors.imageLabel?.message} {...register("imageLabel")} placeholder="e.g. 1920x600 hero image" />
        <Input label="Link URL" required error={errors.linkUrl?.message} {...register("linkUrl")} placeholder="/offers/diwali" />
        <Select label="Placement" required error={errors.position?.message} {...register("position")}>
          {POSITIONS.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </Select>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Start Date" type="date" required error={errors.startDate?.message} {...register("startDate")} />
          <Input label="End Date" type="date" required error={errors.endDate?.message} {...register("endDate")} />
        </div>
        <Checkbox label="Active (visible on the site)" {...register("active")} />
      </form>
    </Modal>
  );
}
