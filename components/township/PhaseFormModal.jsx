"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { UNITS } from "@/lib/unitConversion";

const TYPES = ["Residential", "Commercial", "Mixed-Use"];
const STATUSES = ["planned", "under_construction", "completed"];

const schema = yup.object({
  name: yup.string().trim().required("Phase name is required"),
  type: yup.string().oneOf(TYPES).required("Select a type"),
  areaValue: yup.number().typeError("Enter a valid area").positive("Must be positive").required("Area is required"),
  areaUnit: yup.string().oneOf(UNITS.map((u) => u.value)).required("Select a unit"),
  status: yup.string().oneOf(STATUSES).required("Select a status"),
  totalUnits: yup.number().typeError("Enter a number").positive("Must be positive").required("Total units is required"),
  launchDate: yup.string().required("Launch date is required"),
});

const DEFAULT_VALUES = { name: "", type: "Residential", areaValue: "", areaUnit: "acre", status: "planned", totalUnits: "", launchDate: "" };

/** Add/Edit modal for a phase (sub-project) linked to a township (Section 4.11 / 9). */
export default function PhaseFormModal({ isOpen, onClose, onSubmit, initialData, submitting }) {
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
              areaValue: initialData.areaValue,
              areaUnit: initialData.areaUnit,
              status: initialData.status,
              totalUnits: initialData.totalUnits,
              launchDate: initialData.launchDate,
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
      title={isEdit ? `Edit Phase — ${initialData?.id}` : "Link New Phase"}
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit(onSubmit)} loading={submitting}>
            {isEdit ? "Save Changes" : "Link Phase"}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input label="Phase Name" required error={errors.name?.message} {...register("name")} containerClassName="sm:col-span-2" />
        <Select label="Type" required error={errors.type?.message} {...register("type")}>
          {TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </Select>
        <Select label="Status" required error={errors.status?.message} {...register("status")}>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())}
            </option>
          ))}
        </Select>
        <Input label="Area" type="number" required error={errors.areaValue?.message} {...register("areaValue")} />
        <Select label="Unit" required error={errors.areaUnit?.message} {...register("areaUnit")}>
          {UNITS.map((u) => (
            <option key={u.value} value={u.value}>
              {u.label}
            </option>
          ))}
        </Select>
        <Input label="Total Units" type="number" required error={errors.totalUnits?.message} {...register("totalUnits")} />
        <Input label="Launch Date" type="date" required error={errors.launchDate?.message} {...register("launchDate")} />
      </form>
    </Modal>
  );
}
