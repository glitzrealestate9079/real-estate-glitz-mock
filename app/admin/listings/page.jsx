"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  AlertTriangle,
  Building2,
  Check,
  Eye,
  Flag,
  Home,
  Landmark,
  MessageSquareText,
  Pencil,
  Plus,
  RefreshCw,
  ShieldCheck,
  ShieldOff,
  Store,
  Trash2,
  Users2,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import Tooltip from "@/components/ui/Tooltip";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Table from "@/components/ui/Table";
import Select from "@/components/ui/Select";
import Modal from "@/components/ui/Modal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import ReasonModal from "@/components/ui/ReasonModal";
import { useAppDispatch, useAppSelector } from "@/hooks/useReduxHooks";
import {
  removeListing,
  removeListings,
  updateListing,
  updateListingStatus,
  updateListingsStatus,
} from "@/redux/slices/listingsSlice";
import { cityOf, formatCount, formatINR, toLocalISODate } from "@/utils/format";
import { daysSincePosted, isStaleListing } from "@/lib/listingFreshness";
import { useAuditLog } from "@/hooks/useAuditLog";

const TYPE_ICON = { Apartment: Building2, Villa: Home, Plot: Landmark, Commercial: Store, PG: Users2 };

const STATUS_BADGE = {
  pending: { variant: "warning", label: "Pending" },
  approved: { variant: "success", label: "Approved" },
  rejected: { variant: "danger", label: "Rejected" },
  flagged: { variant: "danger", label: "Flagged" },
};

function priceLabel(listing) {
  const suffix = listing.transactionType === "Sell" ? "" : "/mo";
  return `${formatINR(listing.price)}${suffix}`;
}

export default function ListingsPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const logAction = useAuditLog();
  const items = useAppSelector((state) => state.listings.items);

  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [listingTypeFilter, setListingTypeFilter] = useState("all");
  const [cityFilter, setCityFilter] = useState("all");
  const [verificationFilter, setVerificationFilter] = useState("all");
  const [selectedIds, setSelectedIds] = useState([]);

  const [viewingId, setViewingId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [bulkRejectOpen, setBulkRejectOpen] = useState(false);

  const cities = useMemo(() => [...new Set(items.map((l) => cityOf(l.city)))].sort(), [items]);

  const filtered = useMemo(() => {
    return items.filter((l) => {
      if (statusFilter !== "all" && l.status !== statusFilter) return false;
      if (typeFilter !== "all" && l.propertyType !== typeFilter) return false;
      if (listingTypeFilter !== "all" && l.transactionType !== listingTypeFilter) return false;
      if (cityFilter !== "all" && cityOf(l.city) !== cityFilter) return false;
      if (verificationFilter !== "all" && (verificationFilter === "verified") !== l.reraVerified) return false;
      return true;
    });
  }, [items, statusFilter, typeFilter, listingTypeFilter, cityFilter, verificationFilter]);

  // Derived from `items` (not a snapshot) so the still-open modal reflects live updates — e.g.
  // Renew/Force-Verify RERA update the badge in place instead of showing stale data.
  const viewingListing = useMemo(() => items.find((l) => l.id === viewingId) ?? null, [items, viewingId]);

  function handleApprove(listing) {
    dispatch(updateListingStatus({ id: listing.id, status: "approved" }));
    logAction(`Approved listing ${listing.id}`, "Listings");
    toast.success(`${listing.id} approved`);
  }

  function handleReject(reason) {
    dispatch(updateListingStatus({ id: rejectTarget.id, status: "rejected", rejectionReason: reason }));
    logAction(`Rejected listing ${rejectTarget.id}`, "Listings");
    toast.success(`${rejectTarget.id} rejected`);
    setRejectTarget(null);
  }

  function handleToggleRera(listing) {
    dispatch(updateListing({ id: listing.id, reraVerified: !listing.reraVerified }));
    toast.success(`${listing.id} RERA badge ${listing.reraVerified ? "unverified" : "force-verified"}`);
  }

  function handleRenew(listing) {
    const nextExpiry = new Date();
    nextExpiry.setDate(nextExpiry.getDate() + 30);
    const expiryDate = toLocalISODate(nextExpiry);
    dispatch(updateListing({ id: listing.id, expiryDate }));
    toast.success(`${listing.id} renewed until ${expiryDate}`);
  }

  function handleConfirmAvailable(listing) {
    dispatch(updateListing({ id: listing.id, lastConfirmedDate: toLocalISODate(new Date()) }));
    toast.success(`${listing.id} marked as still available`);
  }

  function handleDelete() {
    dispatch(removeListing(deleteTarget.id));
    logAction(`Deleted listing ${deleteTarget.id}`, "Listings");
    toast.success(`${deleteTarget.id} deleted`);
    setDeleteTarget(null);
  }

  function handleBulkApprove() {
    dispatch(updateListingsStatus({ ids: selectedIds, status: "approved" }));
    logAction(`Bulk-approved ${selectedIds.length} listings`, "Listings");
    toast.success(`${selectedIds.length} listings approved`);
    setSelectedIds([]);
  }

  function handleBulkReject(reason) {
    dispatch(updateListingsStatus({ ids: selectedIds, status: "rejected", rejectionReason: reason }));
    logAction(`Bulk-rejected ${selectedIds.length} listings`, "Listings");
    toast.success(`${selectedIds.length} listings rejected`);
    setSelectedIds([]);
    setBulkRejectOpen(false);
  }

  function handleBulkDelete() {
    dispatch(removeListings(selectedIds));
    logAction(`Bulk-deleted ${selectedIds.length} listings`, "Listings");
    toast.success(`${selectedIds.length} listings deleted`);
    setSelectedIds([]);
  }

  const columns = [
    {
      key: "title",
      header: "Listing",
      sortable: true,
      render: (row) => {
        const Icon = TYPE_ICON[row.propertyType] ?? Building2;
        return (
          <div className="flex items-center gap-2.5">
            <div className="relative flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400">
              {row.image ? (
                <Image src={row.image} alt="" fill sizes="32px" className="object-cover" />
              ) : (
                <Icon className="h-4 w-4" />
              )}
            </div>
            <div className="min-w-0">
              <p className="max-w-[220px] truncate font-medium text-gray-900 dark:text-gray-100">{row.title}</p>
              <p className="text-xs text-gray-400">{row.id}</p>
            </div>
          </div>
        );
      },
    },
    { key: "propertyType", header: "Type", sortable: true },
    { key: "city", header: "City", sortable: true },
    { key: "postedBy", header: "Posted By", render: (row) => `${row.postedBy} (${row.postedByRole})` },
    { key: "price", header: "Price", sortable: true, render: (row) => priceLabel(row) },
    {
      key: "views",
      header: "Views",
      sortable: true,
      searchable: false,
      render: (row) => (
        <span className="inline-flex items-center gap-1 text-gray-500 dark:text-gray-400">
          <Eye className="h-3.5 w-3.5" />
          {formatCount(row.views)}
        </span>
      ),
    },
    {
      key: "enquiries",
      header: "Leads",
      sortable: true,
      searchable: false,
      render: (row) => (
        <span className="inline-flex items-center gap-1 text-gray-500 dark:text-gray-400">
          <MessageSquareText className="h-3.5 w-3.5" />
          {formatCount(row.enquiries)}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (row) => {
        const s = STATUS_BADGE[row.status] ?? STATUS_BADGE.pending;
        return <Badge variant={s.variant}>{s.label}</Badge>;
      },
    },
    {
      key: "submittedDate",
      header: "Submitted",
      sortable: true,
      render: (row) =>
        isStaleListing(row) ? (
          <Tooltip content={`No availability confirmation in ${daysSincePosted(row)} days`} side="top">
            <span className="inline-flex items-center gap-1 text-warning">
              {row.submittedDate}
              <AlertTriangle className="h-3.5 w-3.5" />
            </span>
          </Tooltip>
        ) : (
          row.submittedDate
        ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Listings Moderation</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Review, approve, reject and manage property listings across all types.
          </p>
        </div>
        <Button icon={Plus} onClick={() => router.push("/admin/listings/new")}>
          Add Listing
        </Button>
      </div>

      <Card>
        <div className="flex flex-wrap items-end gap-3">
          <Select
            label="Status"
            className="w-40"
            containerClassName="w-40"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="flagged">Flagged</option>
          </Select>
          <Select
            label="Property Type"
            className="w-44"
            containerClassName="w-44"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="all">All types</option>
            <option value="Apartment">Apartment</option>
            <option value="Villa">Villa</option>
            <option value="Plot">Plot</option>
            <option value="Commercial">Commercial</option>
            <option value="PG">PG</option>
          </Select>
          <Select
            label="Listing Type"
            className="w-36"
            containerClassName="w-36"
            value={listingTypeFilter}
            onChange={(e) => setListingTypeFilter(e.target.value)}
          >
            <option value="all">Sell &amp; Rent</option>
            <option value="Sell">Sell</option>
            <option value="Rent">Rent</option>
            <option value="PG">PG</option>
          </Select>
          <Select
            label="Location"
            className="w-40"
            containerClassName="w-40"
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
          >
            <option value="all">All cities</option>
            {cities.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
          <Select
            label="Verification"
            className="w-40"
            containerClassName="w-40"
            value={verificationFilter}
            onChange={(e) => setVerificationFilter(e.target.value)}
          >
            <option value="all">Any RERA status</option>
            <option value="verified">RERA Verified</option>
            <option value="unverified">Not Verified</option>
          </Select>

          {selectedIds.length > 0 && (
            <div className="ml-auto flex flex-wrap items-center gap-2 rounded-lg bg-primary-50 px-3 py-2 dark:bg-primary-500/10">
              <span className="text-xs font-medium text-primary-700 dark:text-primary-300">
                {selectedIds.length} selected
              </span>
              <Button size="sm" variant="success" icon={Check} onClick={handleBulkApprove}>
                Approve
              </Button>
              <Button size="sm" variant="danger" icon={X} onClick={() => setBulkRejectOpen(true)}>
                Reject
              </Button>
              <Button size="sm" variant="outline" icon={Trash2} onClick={handleBulkDelete}>
                Delete
              </Button>
            </div>
          )}
        </div>
      </Card>

      <Table
        columns={columns}
        data={filtered}
        selectable
        selectedIds={selectedIds}
        onSelectedIdsChange={setSelectedIds}
        emptyTitle="No listings match these filters"
        emptyDescription="Try a different status, type, location or verification filter."
        rowActions={(row) => (
          <>
            <Tooltip content="View listing" side="top">
              <button
                onClick={() => setViewingId(row.id)}
                className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800"
                aria-label="View listing"
              >
                <Eye className="h-3.5 w-3.5" />
              </button>
            </Tooltip>
            <Tooltip content="Edit listing" side="top">
              <button
                onClick={() => router.push(`/admin/listings/${row.id}/edit`)}
                className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-primary-600 dark:hover:bg-gray-800"
                aria-label="Edit listing"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
            </Tooltip>
            {row.status === "pending" || row.status === "flagged" ? (
              <>
                <Tooltip content="Approve listing" side="top">
                  <button
                    onClick={() => handleApprove(row)}
                    className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:bg-success/10 hover:text-success"
                    aria-label="Approve listing"
                  >
                    <Check className="h-3.5 w-3.5" />
                  </button>
                </Tooltip>
                <Tooltip content="Reject listing" side="top">
                  <button
                    onClick={() => setRejectTarget(row)}
                    className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:bg-danger/10 hover:text-danger"
                    aria-label="Reject listing"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </Tooltip>
              </>
            ) : null}
            <Tooltip content="Delete listing" side="top">
              <button
                onClick={() => setDeleteTarget(row)}
                className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:bg-danger/10 hover:text-danger"
                aria-label="Delete listing"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </Tooltip>
          </>
        )}
      />

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title={`Delete ${deleteTarget?.id}?`}
        description="This will permanently remove the listing. This action cannot be undone."
        confirmLabel="Delete"
      />

      <ReasonModal
        isOpen={Boolean(rejectTarget)}
        onClose={() => setRejectTarget(null)}
        onConfirm={handleReject}
        title={`Reject ${rejectTarget?.id}?`}
        description="The submitter will see this reason on their listing dashboard."
        confirmLabel="Reject Listing"
        placeholder="e.g. Ownership documents don't match the RERA filing"
      />

      <ReasonModal
        isOpen={bulkRejectOpen}
        onClose={() => setBulkRejectOpen(false)}
        onConfirm={handleBulkReject}
        title={`Reject ${selectedIds.length} listings?`}
        description="The same reason will be applied to every selected listing."
        confirmLabel="Reject All"
      />

      {/* Admin review panel — read-only verification checklist + moderator actions, per spec 3.8 */}
      <Modal
        isOpen={Boolean(viewingListing)}
        onClose={() => setViewingId(null)}
        size="lg"
        title={viewingListing?.title}
        description={viewingListing ? `${viewingListing.id} — ${viewingListing.propertyType}` : ""}
        footer={
          viewingListing && (
            <>
              <Button variant="outline" icon={RefreshCw} onClick={() => handleRenew(viewingListing)}>
                Renew +30d
              </Button>
              {isStaleListing(viewingListing) && (
                <Button variant="outline" icon={Check} onClick={() => handleConfirmAvailable(viewingListing)}>
                  Mark Still Available
                </Button>
              )}
              <Button
                variant="outline"
                icon={viewingListing.reraVerified ? ShieldOff : ShieldCheck}
                onClick={() => handleToggleRera(viewingListing)}
              >
                {viewingListing.reraVerified ? "Unverify RERA" : "Force-Verify RERA"}
              </Button>
              {(viewingListing.status === "pending" || viewingListing.status === "flagged") && (
                <>
                  <Button
                    variant="danger"
                    icon={X}
                    onClick={() => {
                      setRejectTarget(viewingListing);
                      setViewingId(null);
                    }}
                  >
                    Reject
                  </Button>
                  <Button
                    variant="success"
                    icon={Check}
                    onClick={() => {
                      handleApprove(viewingListing);
                      setViewingId(null);
                    }}
                  >
                    Approve
                  </Button>
                </>
              )}
            </>
          )
        }
      >
        {viewingListing && (
          <div className="space-y-5">
            {viewingListing.image && (
              <div className="relative h-40 w-full overflow-hidden rounded-xl bg-primary-50 dark:bg-primary-500/10">
                <Image src={viewingListing.image} alt={viewingListing.title} fill sizes="600px" className="object-cover" />
              </div>
            )}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <InfoField label="City" value={viewingListing.city} />
              <InfoField label="Price" value={priceLabel(viewingListing)} />
              <InfoField label="Views / Leads" value={`${formatCount(viewingListing.views)} / ${formatCount(viewingListing.enquiries)}`} />
              <InfoField label="Posted By" value={`${viewingListing.postedBy} (${viewingListing.postedByRole})`} />
              <InfoField label="Contact" value={viewingListing.ownerPhone || "—"} />
              <InfoField label="RERA Number" value={viewingListing.reraNumber || "—"} />
              <InfoField label="Transaction" value={viewingListing.transactionType} />
              <InfoField label="Submitted" value={viewingListing.submittedDate} />
              <InfoField
                label="Status"
                value={<Badge variant={STATUS_BADGE[viewingListing.status]?.variant}>{STATUS_BADGE[viewingListing.status]?.label}</Badge>}
              />
              <InfoField label="Expires" value={viewingListing.expiryDate} />
              <InfoField label="Auto-Renew" value={<Badge variant={viewingListing.autoRenew ? "success" : "neutral"}>{viewingListing.autoRenew ? "On" : "Off"}</Badge>} />
              <InfoField label="RERA Badge" value={<Badge variant={viewingListing.reraVerified ? "success" : "neutral"}>{viewingListing.reraVerified ? "Verified" : "Not Verified"}</Badge>} />
              <InfoField
                label="Availability Confirmed"
                value={
                  <Badge variant={isStaleListing(viewingListing) ? "warning" : "success"}>
                    {daysSincePosted(viewingListing)}d ago{isStaleListing(viewingListing) ? " — stale" : ""}
                  </Badge>
                }
              />
            </div>

            {viewingListing.rejectionReason && (
              <div className="flex items-start gap-2 rounded-lg bg-danger/10 p-3 text-sm text-danger">
                <Flag className="mt-0.5 h-4 w-4 shrink-0" />
                <p>{viewingListing.rejectionReason}</p>
              </div>
            )}

            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
                Admin Review — Verification Checklist
              </p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {Object.entries(viewingListing.admin ?? {}).map(([key, value]) => (
                  <AdminCheckBadge key={key} label={key} value={value} />
                ))}
              </div>
            </div>

            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">Property Details</p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {Object.entries(viewingListing.details ?? {})
                  .filter(([, v]) => v !== "" && v !== null && !(Array.isArray(v) && v.length === 0))
                  .map(([key, value]) => (
                    <InfoField
                      key={key}
                      label={humanizeKey(key)}
                      value={Array.isArray(value) ? value.join(", ") : String(value)}
                    />
                  ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

function InfoField({ label, value }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wide text-gray-400">{label}</p>
      <p className="break-words text-sm font-medium text-gray-800 dark:text-gray-200">{value}</p>
    </div>
  );
}

const CHECK_TONE = {
  passed: "success",
  verified: "success",
  matches: "success",
  clear: "success",
  confirmed: "success",
  pending: "warning",
  pending_upload: "warning",
  pending_inspection: "warning",
  not_verified: "warning",
  uploaded: "warning",
  flagged: "danger",
  mismatch: "danger",
};

function AdminCheckBadge({ label, value }) {
  if (typeof value === "boolean") {
    return (
      <Badge variant={value ? "success" : "warning"} className="justify-start">
        {humanizeKey(label)}: {value ? "Yes" : "No"}
      </Badge>
    );
  }
  const tone = CHECK_TONE[value] ?? "neutral";
  return (
    <Badge variant={tone} className="justify-start">
      {humanizeKey(label)}: {humanizeKey(String(value))}
    </Badge>
  );
}

function humanizeKey(key) {
  return key
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/_/g, " ")
    .replace(/^./, (c) => c.toUpperCase());
}
