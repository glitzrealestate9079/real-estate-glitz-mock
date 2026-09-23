"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";

const REPORT_TYPES = ["Traffic", "Conversion Funnel", "Revenue", "Lead Source", "City Performance"];

const schema = yup.object({
  name: yup.string().trim().required("Report name is required"),
  type: yup.string().oneOf(REPORT_TYPES).required("Select a report type"),
  rangeStart: yup.string().required("Start date is required"),
  rangeEnd: yup
    .string()
    .required("End date is required")
    .test("after-start", "End date can't be before the start date", function (value) {
      return !this.parent.rangeStart || !value || value >= this.parent.rangeStart;
    }),
  createdBy: yup.string().trim().required("Created-by username is required"),
});

const DEFAULT_VALUES = { name: "", type: "Traffic", rangeStart: "", rangeEnd: "", createdBy: "" };

/** Add/Edit modal for a saved analytics report configuration (Section 4.8). */
export default function ReportFormModal({ isOpen, onClose, onSubmit, initialData, submitting }) {
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
              name: initialData.name,
              type: initialData.type,
              rangeStart: initialData.rangeStart,
              rangeEnd: initialData.rangeEnd,
              createdBy: initialData.createdBy,
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
      title={isEdit ? `Edit Report — ${initialData?.id}` : "Save New Report"}
      description="Saved reports can be re-run later from the table below."
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit(onSubmit)} loading={submitting}>
            {isEdit ? "Save Changes" : "Save Report"}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input label="Report Name" required error={errors.name?.message} {...register("name")} placeholder="e.g. Monthly Traffic Overview" />
        <Select label="Report Type" required error={errors.type?.message} {...register("type")}>
          {REPORT_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </Select>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Range Start" type="date" required error={errors.rangeStart?.message} {...register("rangeStart")} />
          <Input label="Range End" type="date" required error={errors.rangeEnd?.message} {...register("rangeEnd")} />
        </div>
        <Input label="Created By (username)" required error={errors.createdBy?.message} {...register("createdBy")} placeholder="e.g. admin" />
      </form>
    </Modal>
  );
}
