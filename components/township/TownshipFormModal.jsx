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

const schema = yup.object({
  name: yup.string().trim().required("Township name is required"),
  reraUmbrellaNo: yup.string().trim().required("RERA umbrella registration number is required"),
  location: yup.string().trim().required("Location is required"),
  totalAreaValue: yup.number().typeError("Enter a valid area").positive("Must be positive").required("Total area is required"),
  totalAreaUnit: yup.string().oneOf(UNITS.map((u) => u.value)).required("Select a unit"),
  masterPlanLabel: yup.string().trim().required("Describe the masterplan file (e.g. filename)"),
  status: yup.string().oneOf(["planning", "active", "completed"]).required("Select a status"),
});

const DEFAULT_VALUES = { name: "", reraUmbrellaNo: "", location: "", totalAreaValue: "", totalAreaUnit: "acre", masterPlanLabel: "", status: "planning" };

/** Add/Edit modal for a master township entity (Section 4.11 / 9). */
export default function TownshipFormModal({ isOpen, onClose, onSubmit, initialData, submitting }) {
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
              reraUmbrellaNo: initialData.reraUmbrellaNo,
              location: initialData.location,
              totalAreaValue: initialData.totalAreaValue,
              totalAreaUnit: initialData.totalAreaUnit,
              masterPlanLabel: initialData.masterPlanLabel,
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
      size="md"
      title={isEdit ? `Edit Township — ${initialData?.id}` : "Create Township"}
      description="Sub-projects (phases) are linked separately after the township is created."
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit(onSubmit)} loading={submitting}>
            {isEdit ? "Save Changes" : "Create Township"}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input label="Township Name" required error={errors.name?.message} {...register("name")} />
        <Input label="RERA Umbrella No." required error={errors.reraUmbrellaNo?.message} {...register("reraUmbrellaNo")} placeholder="e.g. HR-RERA-TWN-2021-001" />
        <Input label="Location" required error={errors.location?.message} {...register("location")} />
        <div className="grid grid-cols-2 gap-4">
          <Input label="Total Area" type="number" required error={errors.totalAreaValue?.message} {...register("totalAreaValue")} />
          <Select label="Unit" required error={errors.totalAreaUnit?.message} {...register("totalAreaUnit")}>
            {UNITS.map((u) => (
              <option key={u.value} value={u.value}>
                {u.label}
              </option>
            ))}
          </Select>
        </div>
        <Input label="Masterplan File" required error={errors.masterPlanLabel?.message} {...register("masterPlanLabel")} placeholder="e.g. masterplan-v3.pdf" />
        <Select label="Status" required error={errors.status?.message} {...register("status")}>
          <option value="planning">Planning</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
        </Select>
      </form>
    </Modal>
  );
}
