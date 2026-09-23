"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";

const TYPE_LABEL = { country: "Country", state: "State", city: "City", locality: "Locality" };

const schema = yup.object({
  name: yup.string().trim().required("Name is required").min(2, "Name is too short"),
  status: yup.string().oneOf(["active", "inactive"]).required("Select a status"),
});

const DEFAULT_VALUES = { name: "", status: "active" };

/**
 * Add/Edit modal for one node in the Locations hierarchy. `levelType` and `parentLabel` are
 * supplied by the page based on where the admin is drilled into — the form itself only ever
 * asks for the node's own name + status, since the parent is fixed by context.
 */
export default function LocationFormModal({ isOpen, onClose, onSubmit, initialData, levelType, parentLabel, submitting }) {
  const isEdit = Boolean(initialData);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ resolver: yupResolver(schema), defaultValues: DEFAULT_VALUES });

  useEffect(() => {
    if (isOpen) {
      reset(initialData ? { name: initialData.name, status: initialData.status } : DEFAULT_VALUES);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, initialData]);

  const typeLabel = TYPE_LABEL[levelType] ?? "Location";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      title={isEdit ? `Edit ${typeLabel}` : `Add ${typeLabel}`}
      description={parentLabel ? `Under ${parentLabel}` : "Top-level entry"}
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit(onSubmit)} loading={submitting}>
            {isEdit ? "Save Changes" : `Add ${typeLabel}`}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input label={`${typeLabel} Name`} required autoFocus error={errors.name?.message} {...register("name")} />
        <Select label="Status" required error={errors.status?.message} {...register("status")}>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </Select>
      </form>
    </Modal>
  );
}
