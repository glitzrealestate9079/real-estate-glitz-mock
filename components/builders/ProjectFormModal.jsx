"use client";

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Checkbox from "@/components/ui/Checkbox";

const PROJECT_TYPES = ["Residential", "Commercial", "Township", "Mixed-Use"];
const STAGES = ["Foundation", "Structure", "Finishing", "Ready to Move"];
// Covers both residential-style amenities and the commercial/township ones (Food Court,
// School, Hospital, ...) since this one list serves every project type rather than switching
// options based on the selected Type.
const AMENITY_OPTIONS = [
  "Clubhouse",
  "Swimming Pool",
  "Gym",
  "Kids Play Area",
  "Landscaped Garden",
  "Private Garden",
  "24x7 Security",
  "Power Backup",
  "Covered Parking",
  "Cafeteria",
  "Conference Center",
  "Food Court",
  "Multiplex",
  "Escalators",
  "School",
  "Hospital",
  "Shopping Complex",
  "Parks",
];

const schema = yup.object({
  name: yup.string().trim().required("Project name is required"),
  type: yup.string().oneOf(PROJECT_TYPES).required("Select a project type"),
  location: yup.string().trim().required("Location is required"),
  launchDate: yup.string().required("Launch date is required"),
  possessionDate: yup.string().required("Possession date is required"),
  totalUnits: yup.number().typeError("Enter a number").positive("Must be positive").required("Total units is required"),
  unitsAvailable: yup
    .number()
    .typeError("Enter a number")
    .min(0, "Can't be negative")
    .required("Required (can be 0)")
    .max(yup.ref("totalUnits"), "Can't exceed total units"),
  priceRange: yup.string().trim().required("e.g. ₹85L - ₹3.2Cr"),
  constructionStage: yup.string().oneOf(STAGES).required("Select a construction stage"),
  progressPercent: yup.number().typeError("Enter a number").min(0).max(100, "0-100 only").required("Progress % is required"),
  brochureLabel: yup.string().trim().required("Describe the brochure/floor-plan file (e.g. filename)"),
  reraNumber: yup.string().trim().required("Project RERA number is required"),
  amenities: yup.array().of(yup.string()).min(1, "Select at least one amenity"),
});

const DEFAULT_VALUES = {
  name: "",
  type: "Residential",
  location: "",
  launchDate: "",
  possessionDate: "",
  totalUnits: "",
  unitsAvailable: "",
  priceRange: "",
  constructionStage: "Foundation",
  progressPercent: 0,
  brochureLabel: "",
  reraNumber: "",
  amenities: [],
};

/** Add/Edit modal for a project micro-site + construction timeline under a builder (Section 4.6). */
export default function ProjectFormModal({ isOpen, onClose, onSubmit, initialData, submitting }) {
  const isEdit = Boolean(initialData);
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
              name: initialData.name,
              type: initialData.type,
              location: initialData.location,
              launchDate: initialData.launchDate,
              possessionDate: initialData.possessionDate,
              totalUnits: initialData.totalUnits,
              unitsAvailable: initialData.unitsAvailable,
              priceRange: initialData.priceRange,
              constructionStage: initialData.constructionStage,
              progressPercent: initialData.progressPercent,
              brochureLabel: initialData.brochureLabel ?? "",
              reraNumber: initialData.reraNumber ?? "",
              amenities: initialData.amenities ?? [],
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
      title={isEdit ? `Edit Project — ${initialData?.id}` : "Add Project"}
      description={isEdit ? "Update the construction timeline and listing details." : "New projects are submitted for launch approval."}
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit(onSubmit)} loading={submitting}>
            {isEdit ? "Save Changes" : "Submit for Approval"}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input label="Project Name" required error={errors.name?.message} {...register("name")} containerClassName="sm:col-span-2" />
        <Select label="Type" required error={errors.type?.message} {...register("type")}>
          {PROJECT_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </Select>
        <Input label="Location" required error={errors.location?.message} {...register("location")} />
        <Input label="Launch Date" type="date" required error={errors.launchDate?.message} {...register("launchDate")} />
        <Input label="Possession Date" type="date" required error={errors.possessionDate?.message} {...register("possessionDate")} />
        <Input label="Total Units" type="number" required error={errors.totalUnits?.message} {...register("totalUnits")} />
        <Input label="Units Available" type="number" required error={errors.unitsAvailable?.message} {...register("unitsAvailable")} />
        <Input label="Price Range" required error={errors.priceRange?.message} {...register("priceRange")} placeholder="e.g. ₹85L - ₹3.2Cr" containerClassName="sm:col-span-2" />
        <Select label="Construction Stage" required error={errors.constructionStage?.message} {...register("constructionStage")}>
          {STAGES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </Select>
        <Input label="Progress (%)" type="number" required error={errors.progressPercent?.message} {...register("progressPercent")} />
        <Input
          label="RERA Number"
          required
          error={errors.reraNumber?.message}
          {...register("reraNumber")}
          placeholder="e.g. HR-RERA-99871-101"
        />
        <Input
          label="Brochure / Floor Plan File"
          required
          error={errors.brochureLabel?.message}
          {...register("brochureLabel")}
          placeholder="e.g. project-brochure.pdf"
        />

        <Controller
          name="amenities"
          control={control}
          render={({ field }) => (
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Amenities <span className="text-danger">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {AMENITY_OPTIONS.map((a) => (
                  <Checkbox
                    key={a}
                    label={a}
                    checked={field.value.includes(a)}
                    onChange={(e) => {
                      field.onChange(e.target.checked ? [...field.value, a] : field.value.filter((v) => v !== a));
                    }}
                  />
                ))}
              </div>
              {errors.amenities && <p className="mt-1 text-xs text-danger">{errors.amenities.message}</p>}
            </div>
          )}
        />
      </form>
    </Modal>
  );
}
