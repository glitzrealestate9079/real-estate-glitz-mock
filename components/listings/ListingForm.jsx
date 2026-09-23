"use client";

import { useEffect, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { AlertTriangle } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Textarea from "@/components/ui/Textarea";
import Checkbox from "@/components/ui/Checkbox";
import SegmentedControl from "@/components/ui/SegmentedControl";
import { useAppSelector } from "@/hooks/useReduxHooks";
import { findPossibleDuplicates } from "@/lib/duplicateCheck";
import { UNITS as AREA_UNITS } from "@/lib/unitConversion";

const PROPERTY_TYPES = ["Apartment", "Villa", "Plot", "Commercial", "PG"];
const TRANSACTION_TYPES = { Apartment: ["Sell", "Rent"], Villa: ["Sell", "Rent"], Plot: ["Sell"], Commercial: ["Sell", "Rent"], PG: ["PG"] };
const AMENITY_OPTIONS = ["Gym", "Pool", "Lift", "Security", "Clubhouse", "Power Backup", "Kids Play Area"];

// Common fields validate for every type; `details.*` fields are required only for the property
// type they apply to, via yup's when(propertyType) — matches the spec's "same base fields for
// every type, different type-specific fields" rule (Section 3.8.6 of the PDF).
const schema = yup.object({
  title: yup.string().trim().required("Title is required").min(6, "Title is too short"),
  propertyType: yup.string().oneOf(PROPERTY_TYPES).required("Select a property type"),
  transactionType: yup.string().required("Select a transaction type"),
  city: yup.string().trim().required("City / locality is required"),
  price: yup.number().typeError("Enter a valid amount").positive("Price must be positive").required("Price is required"),
  postedBy: yup.string().trim().required("Posted-by username is required"),
  postedByRole: yup.string().required("Select who's posting"),
  ownerPhone: yup
    .string()
    .trim()
    .required("Owner/agent phone number is required")
    .matches(/^[+]?[\d\s-]{10,15}$/, "Enter a valid phone number"),
  ownerEmail: yup.string().trim().email("Enter a valid email address").notRequired(),
  reraNumber: yup.string().trim().notRequired(),
  details: yup.object({
    bhk: yup.number().typeError("Enter a number").when("$propertyType", {
      is: "Apartment",
      then: (s) => s.required("BHK is required").min(1),
      otherwise: (s) => s.nullable().transform((v, o) => (o === "" ? null : v)),
    }),
    carpetArea: yup.number().typeError("Enter a number").when("$propertyType", {
      is: (v) => v === "Apartment" || v === "Commercial",
      then: (s) => s.required("Carpet area is required").positive(),
      otherwise: (s) => s.nullable().transform((v, o) => (o === "" ? null : v)),
    }),
    plotArea: yup.number().typeError("Enter a number").when("$propertyType", {
      is: (v) => v === "Villa" || v === "Plot",
      then: (s) => s.required("Plot area is required").positive(),
      otherwise: (s) => s.nullable().transform((v, o) => (o === "" ? null : v)),
    }),
    genderPreference: yup.string().when("$propertyType", {
      is: "PG",
      then: (s) => s.required("Select a gender preference"),
      otherwise: (s) => s.nullable(),
    }),
  }),
});

const DEFAULT_VALUES = {
  title: "",
  propertyType: "Apartment",
  transactionType: "Sell",
  city: "",
  price: "",
  postedBy: "",
  postedByRole: "Owner",
  ownerPhone: "",
  ownerEmail: "",
  reraNumber: "",
  details: {
    bhk: "", bathrooms: "", carpetArea: "", floor: "", totalFloors: "", furnishing: "Unfurnished",
    facing: "", age: "", maintenance: "", parking: "", amenities: [],
    plotArea: "", plotAreaUnit: "sqft", builtUpArea: "", floors: "", carParking: "", privateGarden: false,
    boundaryWall: false, dimensions: "", zoning: "Residential", cornerPlot: false, roadWidth: "", approvedBy: "",
    superBuiltUp: "", frontage: "", washrooms: "", powerBackup: "", suitableFor: [], leaseOrSale: "Lease",
    genderPreference: "Co-ed", mealsIncluded: "None", securityDeposit: "", noticePeriod: "",
  },
};

// The `when($propertyType)` conditionals in the schema need the *current* propertyType at
// validate time. Rather than threading react-hook-form's `context` prop through (which only
// updates on re-render, not necessarily by submit time), read it straight from the values
// being validated — always correct, no extra state to keep in sync.
const resolver = (values, _context, options) =>
  yupResolver(schema)(values, { propertyType: values.propertyType }, options);

/**
 * Add/Edit form for a listing, as a full page section rather than a modal — this form is by far
 * the biggest in the app (five completely different detail sections depending on property type),
 * and was cramped inside a modal's fixed height. Renders a different set of type-specific fields
 * depending on the selected Property Type (Section 3.8 — "different posting form per property
 * type"); common fields (title/city/price/posted-by) always show.
 *
 * Props mirror the old modal's (minus isOpen/onClose) so the two page routes that use this
 * (new/[id]/edit) stay thin — they just supply initialData/onSubmit/submitting and their own
 * page chrome (heading, back link).
 */
export default function ListingForm({ initialData, onSubmit, submitting, onCancel, submitLabel }) {
  const isEdit = Boolean(initialData);
  const {
    register,
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver,
    defaultValues: DEFAULT_VALUES,
  });

  const propertyType = watch("propertyType");
  const city = watch("city");
  const price = watch("price");

  const existingListings = useAppSelector((state) => state.listings.items);
  const possibleDuplicates = useMemo(
    () => findPossibleDuplicates(existingListings, { city, propertyType, price }, initialData?.id),
    [existingListings, city, propertyType, price, initialData?.id]
  );

  useEffect(() => {
    reset(
      initialData
        ? { ...DEFAULT_VALUES, ...initialData, details: { ...DEFAULT_VALUES.details, ...initialData.details } }
        : DEFAULT_VALUES
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData]);

  const transactionOptions = (TRANSACTION_TYPES[propertyType] ?? ["Sell"]).map((v) => ({ value: v, label: v }));

  function submit(values) {
    onSubmit(values);
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-6">
      <Card>
        <div className="space-y-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="Title" required error={errors.title?.message} {...register("title")} containerClassName="sm:col-span-2" />

            <Controller
              control={control}
              name="propertyType"
              render={({ field }) => (
                <SegmentedControl
                  label="Property Type"
                  required
                  options={PROPERTY_TYPES.map((v) => ({ value: v, label: v }))}
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.propertyType?.message}
                  className="sm:col-span-2"
                />
              )}
            />

            <Controller
              control={control}
              name="transactionType"
              render={({ field }) => (
                <SegmentedControl
                  label="Transaction Type"
                  required
                  options={transactionOptions}
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.transactionType?.message}
                />
              )}
            />
            <Select label="Posted By (role)" required error={errors.postedByRole?.message} {...register("postedByRole")}>
              <option value="Owner">Owner</option>
              <option value="Agent">Agent</option>
              <option value="Dealer">Dealer</option>
              <option value="Builder">Builder</option>
            </Select>

            <Input label="City / Locality" required error={errors.city?.message} {...register("city")} placeholder="e.g. Whitefield, Bangalore" />
            <Input
              label={propertyType === "PG" ? "Rent (per sharing, ₹/mo)" : "Price (₹)"}
              required
              type="number"
              error={errors.price?.message}
              {...register("price")}
            />
            <Input label="Posted-by Username" required error={errors.postedBy?.message} {...register("postedBy")} placeholder="e.g. agent_ravi" />
          </div>

          <div className="border-t border-gray-100 pt-4 dark:border-gray-800">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">Owner / Agent Contact &amp; Verification</p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Input
                label="Contact Phone"
                required
                error={errors.ownerPhone?.message}
                {...register("ownerPhone")}
                placeholder="+91 98765 43210"
              />
              <Input label="Contact Email (optional)" type="email" error={errors.ownerEmail?.message} {...register("ownerEmail")} />
              <Input
                label="RERA Number (optional)"
                error={errors.reraNumber?.message}
                {...register("reraNumber")}
                hint="Verified separately by an admin after submission"
              />
            </div>
          </div>

          <div className="border-t border-gray-100 pt-4 dark:border-gray-800">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
              {propertyType} Details
            </p>

            {propertyType === "Apartment" && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <Input label="BHK" required type="number" error={errors.details?.bhk?.message} {...register("details.bhk")} />
                <Input label="Bathrooms" type="number" {...register("details.bathrooms")} />
                <Input label="Carpet Area (sq.ft)" required type="number" error={errors.details?.carpetArea?.message} {...register("details.carpetArea")} />
                <Input label="Floor" type="number" {...register("details.floor")} />
                <Input label="Total Floors" type="number" {...register("details.totalFloors")} />
                <Select label="Furnishing" {...register("details.furnishing")}>
                  <option>Unfurnished</option>
                  <option>Semi-Furnished</option>
                  <option>Fully Furnished</option>
                </Select>
                <Input label="Facing" {...register("details.facing")} />
                <Input label="Age (years)" type="number" {...register("details.age")} />
                <Input label="Maintenance (₹/mo)" type="number" {...register("details.maintenance")} />
                <Input label="Covered Parking" type="number" {...register("details.parking")} />
                <div className="sm:col-span-3">
                  <p className="mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">Amenities</p>
                  <div className="flex flex-wrap gap-x-4 gap-y-2">
                    {AMENITY_OPTIONS.map((a) => (
                      <Checkbox key={a} label={a} value={a} {...register("details.amenities")} containerClassName="w-auto" />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {propertyType === "Villa" && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <Input label="Plot Area" required type="number" error={errors.details?.plotArea?.message} {...register("details.plotArea")} />
                <Select label="Unit" options={AREA_UNITS} {...register("details.plotAreaUnit")} />
                <Input label="Built-up Area (sq.ft)" type="number" {...register("details.builtUpArea")} />
                <Input label="Floors (e.g. G+2)" {...register("details.floors")} />
                <Input label="Car Parking" type="number" {...register("details.carParking")} />
                <Input label="Facing" {...register("details.facing")} />
                <Input label="Age (years)" type="number" {...register("details.age")} />
                <Checkbox label="Private Garden" {...register("details.privateGarden")} />
                <Checkbox label="Boundary Wall" {...register("details.boundaryWall")} />
              </div>
            )}

            {propertyType === "Plot" && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <Input label="Plot Area" required type="number" error={errors.details?.plotArea?.message} {...register("details.plotArea")} />
                <Select label="Unit" options={AREA_UNITS} {...register("details.plotAreaUnit")} />
                <Input label="Dimensions (L x W)" {...register("details.dimensions")} placeholder="e.g. 40 x 45 ft" />
                <Select label="Zoning" {...register("details.zoning")}>
                  <option>Residential</option>
                  <option>Commercial</option>
                  <option>Agricultural</option>
                </Select>
                <Input label="Facing" {...register("details.facing")} />
                <Input label="Road Width (ft)" type="number" {...register("details.roadWidth")} />
                <Input label="Approved By (Authority)" {...register("details.approvedBy")} containerClassName="sm:col-span-2" />
                <Checkbox label="Corner Plot" {...register("details.cornerPlot")} />
              </div>
            )}

            {propertyType === "Commercial" && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <Input label="Carpet Area (sq.ft)" required type="number" error={errors.details?.carpetArea?.message} {...register("details.carpetArea")} />
                <Input label="Super Built-up (sq.ft)" type="number" {...register("details.superBuiltUp")} />
                <Input label="Floor" type="number" {...register("details.floor")} />
                <Input label="Total Floors" type="number" {...register("details.totalFloors")} />
                <Input label="Frontage (ft)" type="number" {...register("details.frontage")} />
                <Input label="Washrooms" type="number" {...register("details.washrooms")} />
                <Input label="Power Backup (%)" type="number" {...register("details.powerBackup")} />
                <Select label="Lease / Sale" {...register("details.leaseOrSale")}>
                  <option>Lease</option>
                  <option>Sale</option>
                  <option>Both Available</option>
                </Select>
                <div className="sm:col-span-3">
                  <p className="mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">Suitable For</p>
                  <div className="flex flex-wrap gap-x-4 gap-y-2">
                    {["Office", "Retail", "F&B", "Warehouse", "IT/ITES"].map((a) => (
                      <Checkbox key={a} label={a} value={a} {...register("details.suitableFor")} containerClassName="w-auto" />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {propertyType === "PG" && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <Select
                  label="Gender Preference"
                  required
                  error={errors.details?.genderPreference?.message}
                  {...register("details.genderPreference")}
                >
                  <option>Male Only</option>
                  <option>Female Only</option>
                  <option>Co-ed</option>
                </Select>
                <Select label="Meals Included" {...register("details.mealsIncluded")}>
                  <option>None</option>
                  <option>Breakfast Only</option>
                  <option>Breakfast + Dinner</option>
                  <option>All Meals</option>
                </Select>
                <Select label="Furnishing" {...register("details.furnishing")}>
                  <option>Unfurnished</option>
                  <option>Semi-Furnished</option>
                  <option>Fully Furnished</option>
                </Select>
                <Input label="Security Deposit (₹)" type="number" {...register("details.securityDeposit")} />
                <Input label="Notice Period (days)" type="number" {...register("details.noticePeriod")} />
              </div>
            )}
          </div>

          <Textarea
            label="Internal Notes (optional)"
            hint="Visible to admins/moderators only"
            rows={2}
            {...register("notes")}
          />
        </div>
      </Card>

      {possibleDuplicates.length > 0 && (
        <div className="flex items-start gap-2 rounded-lg bg-warning/10 p-3 text-sm text-warning">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <div>
            <p className="font-medium">
              {possibleDuplicates.length} similar listing{possibleDuplicates.length > 1 ? "s" : ""} may already exist
            </p>
            <p className="mt-0.5 text-xs text-warning/90">
              Same city, property type and a close price match: {possibleDuplicates.map((l) => `${l.id} (${l.title})`).join(", ")}.
              This won&apos;t block submission — review before approving.
            </p>
          </div>
        </div>
      )}

      <div className="sticky bottom-0 -mx-4 flex items-center justify-end gap-2 border-t border-gray-100 bg-surface-subtle/95 px-4 py-4 backdrop-blur-sm dark:border-gray-800 dark:bg-surface-dark/95 sm:-mx-6 sm:px-6">
        <Button type="button" variant="outline" onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
        <Button type="submit" loading={submitting}>
          {submitLabel ?? (isEdit ? "Save Changes" : "Submit Listing")}
        </Button>
      </div>
    </form>
  );
}
