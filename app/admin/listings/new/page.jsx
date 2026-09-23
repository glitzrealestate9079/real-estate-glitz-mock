"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import ListingForm from "@/components/listings/ListingForm";
import { useAppDispatch } from "@/hooks/useReduxHooks";
import { addListing } from "@/redux/slices/listingsSlice";
import { todayISO } from "@/utils/format";

export default function AddListingPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  function handleSubmit(values) {
    setSubmitting(true);
    setTimeout(() => {
      const newId = `PRP-${Math.floor(10000 + Math.random() * 89999)}`;
      dispatch(
        addListing({
          id: newId,
          ...values,
          status: "pending",
          submittedDate: todayISO(),
          admin: { duplicateCheck: "passed", phoneVerified: false },
          views: 0,
          enquiries: 0,
        })
      );
      toast.success(`${values.title} submitted for review`);
      router.push("/admin/listings");
    }, 400);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Add Listing</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Common fields apply to every property type; the fields below adapt to your selection.
        </p>
      </div>

      <ListingForm
        onSubmit={handleSubmit}
        submitting={submitting}
        onCancel={() => router.push("/admin/listings")}
        submitLabel="Submit Listing"
      />
    </div>
  );
}
