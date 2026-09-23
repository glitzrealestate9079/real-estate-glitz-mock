"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import ListingForm from "@/components/listings/ListingForm";
import EmptyState from "@/components/ui/EmptyState";
import { useAppDispatch, useAppSelector } from "@/hooks/useReduxHooks";
import { updateListing } from "@/redux/slices/listingsSlice";

export default function EditListingPage() {
  const { id } = useParams();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const listing = useAppSelector((state) => state.listings.items.find((l) => l.id === id));
  const [submitting, setSubmitting] = useState(false);

  if (!listing) {
    return (
      <div className="space-y-6">
        <Link href="/admin/listings" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary-600 dark:text-gray-400">
          <ArrowLeft className="h-4 w-4" />
          Back to Listings
        </Link>
        <EmptyState title="Listing not found" description={`No listing with ID "${id}" exists.`} />
      </div>
    );
  }

  function handleSubmit(values) {
    setSubmitting(true);
    setTimeout(() => {
      dispatch(updateListing({ id: listing.id, ...values }));
      toast.success(`${values.title} updated`);
      router.push("/admin/listings");
    }, 400);
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/listings"
          className="mb-2 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary-600 dark:text-gray-400"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Listings
        </Link>
        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Edit Listing — {listing.id}</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Common fields apply to every property type; the fields below adapt to your selection.
        </p>
      </div>

      <ListingForm
        initialData={listing}
        onSubmit={handleSubmit}
        submitting={submitting}
        onCancel={() => router.push("/admin/listings")}
        submitLabel="Save Changes"
      />
    </div>
  );
}
