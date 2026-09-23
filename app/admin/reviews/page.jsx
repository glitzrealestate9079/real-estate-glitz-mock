"use client";

import { useMemo, useState } from "react";
import { Check, Eye, Flag, Pencil, Plus, Star, Trash2, X } from "lucide-react";
import toast from "react-hot-toast";
import { cn } from "@/utils/cn";
import Card from "@/components/ui/Card";
import Tooltip from "@/components/ui/Tooltip";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Table from "@/components/ui/Table";
import Select from "@/components/ui/Select";
import Modal from "@/components/ui/Modal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import ReasonModal from "@/components/ui/ReasonModal";
import ReviewFormModal from "@/components/reviews/ReviewFormModal";
import { useAppDispatch, useAppSelector } from "@/hooks/useReduxHooks";
import {
  addReview,
  removeReview,
  removeReviews,
  updateReview,
  updateReviewStatus,
  updateReviewsStatus,
} from "@/redux/slices/reviewsSlice";
import { todayISO } from "@/utils/format";
import { useAuditLog } from "@/hooks/useAuditLog";

const STATUS_BADGE = {
  pending: { variant: "warning", label: "Pending" },
  approved: { variant: "success", label: "Approved" },
  rejected: { variant: "danger", label: "Rejected" },
  flagged: { variant: "danger", label: "Flagged" },
};

function Stars({ rating, className }) {
  return (
    <div className={cn("flex items-center gap-0.5", className)}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} className={cn("h-3.5 w-3.5 text-gray-200 dark:text-gray-700", n <= rating && "fill-amber-400 text-amber-400")} />
      ))}
    </div>
  );
}

export default function ReviewsPage() {
  const dispatch = useAppDispatch();
  const logAction = useAuditLog();
  const items = useAppSelector((state) => state.reviews.items);

  const [statusFilter, setStatusFilter] = useState("all");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [selectedIds, setSelectedIds] = useState([]);

  const [formOpen, setFormOpen] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [viewingReviewId, setViewingReviewId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [flagTarget, setFlagTarget] = useState(null);
  const [bulkRejectOpen, setBulkRejectOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const filtered = useMemo(() => {
    return items.filter((r) => {
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (ratingFilter !== "all" && r.rating !== Number(ratingFilter)) return false;
      return true;
    });
  }, [items, statusFilter, ratingFilter]);

  // Derived from `items` so the still-open view modal reflects live updates (e.g. approving
  // from the modal footer updates the badge in place instead of showing stale data).
  const viewingReview = useMemo(() => items.find((r) => r.id === viewingReviewId) ?? null, [items, viewingReviewId]);

  function openAdd() {
    setEditingReview(null);
    setFormOpen(true);
  }

  function openEdit(review) {
    setEditingReview(review);
    setFormOpen(true);
  }

  function handleFormSubmit(values) {
    setBusy(true);
    setTimeout(() => {
      if (editingReview) {
        dispatch(updateReview({ id: editingReview.id, ...values }));
        toast.success(`Review by ${values.reviewerName} updated`);
      } else {
        const newId = `REV-${Math.floor(40000 + Math.random() * 9999)}`;
        dispatch(addReview({ id: newId, ...values, status: "pending", submittedDate: todayISO() }));
        toast.success(`Review by ${values.reviewerName} added`);
      }
      setBusy(false);
      setFormOpen(false);
      setEditingReview(null);
    }, 400);
  }

  function handleApprove(review) {
    dispatch(updateReviewStatus({ id: review.id, status: "approved" }));
    logAction(`Approved review ${review.id}`, "Reviews");
    toast.success(`Review ${review.id} approved`);
  }

  function handleReject(reason) {
    dispatch(updateReviewStatus({ id: rejectTarget.id, status: "rejected", moderationReason: reason }));
    logAction(`Rejected review ${rejectTarget.id}`, "Reviews");
    toast.success(`Review ${rejectTarget.id} rejected`);
    setRejectTarget(null);
  }

  function handleFlag(reason) {
    dispatch(updateReviewStatus({ id: flagTarget.id, status: "flagged", moderationReason: reason }));
    logAction(`Flagged review ${flagTarget.id}`, "Reviews");
    toast.success(`Review ${flagTarget.id} flagged for review`);
    setFlagTarget(null);
  }

  function handleDelete() {
    dispatch(removeReview(deleteTarget.id));
    toast.success(`Review ${deleteTarget.id} deleted`);
    setDeleteTarget(null);
  }

  function handleBulkApprove() {
    dispatch(updateReviewsStatus({ ids: selectedIds, status: "approved" }));
    toast.success(`${selectedIds.length} reviews approved`);
    setSelectedIds([]);
  }

  function handleBulkReject(reason) {
    dispatch(updateReviewsStatus({ ids: selectedIds, status: "rejected", moderationReason: reason }));
    toast.success(`${selectedIds.length} reviews rejected`);
    setSelectedIds([]);
    setBulkRejectOpen(false);
  }

  function handleBulkDelete() {
    dispatch(removeReviews(selectedIds));
    toast.success(`${selectedIds.length} reviews deleted`);
    setSelectedIds([]);
  }

  const columns = [
    {
      key: "title",
      header: "Review",
      sortable: true,
      render: (row) => <p className="max-w-[220px] truncate font-medium text-gray-900 dark:text-gray-100">{row.title}</p>,
    },
    {
      key: "reviewerName",
      header: "Reviewer",
      sortable: true,
      render: (row) => (
        <div className="min-w-0">
          <p className="max-w-[160px] truncate text-gray-700 dark:text-gray-300">{row.reviewerName}</p>
          <p className="max-w-[160px] truncate text-xs text-gray-400">{row.reviewerEmail}</p>
        </div>
      ),
    },
    {
      key: "listingTitle",
      header: "Listing",
      render: (row) => (
        <div className="min-w-0">
          <p className="max-w-[200px] truncate text-gray-700 dark:text-gray-300">{row.listingTitle}</p>
          <p className="text-xs text-gray-400">{row.listingId}</p>
        </div>
      ),
    },
    { key: "rating", header: "Rating", sortable: true, render: (row) => <Stars rating={row.rating} />, searchable: false },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (row) => {
        const s = STATUS_BADGE[row.status] ?? STATUS_BADGE.pending;
        return <Badge variant={s.variant}>{s.label}</Badge>;
      },
    },
    { key: "submittedDate", header: "Submitted", sortable: true },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Reviews &amp; Ratings Moderation</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Approve, reject and flag listing reviews before they go live.
          </p>
        </div>
        <Button icon={Plus} onClick={openAdd}>
          Add Review
        </Button>
      </div>

      <Card>
        <div className="flex flex-wrap items-end gap-3">
          <Select label="Status" className="w-40" containerClassName="w-40" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">All statuses</option>
            {Object.entries(STATUS_BADGE).map(([k, v]) => (
              <option key={k} value={k}>
                {v.label}
              </option>
            ))}
          </Select>
          <Select label="Rating" className="w-36" containerClassName="w-36" value={ratingFilter} onChange={(e) => setRatingFilter(e.target.value)}>
            <option value="all">All ratings</option>
            {[5, 4, 3, 2, 1].map((n) => (
              <option key={n} value={n}>
                {n} Star{n > 1 ? "s" : ""}
              </option>
            ))}
          </Select>

          {selectedIds.length > 0 && (
            <div className="ml-auto flex flex-wrap items-center gap-2 rounded-lg bg-primary-50 px-3 py-2 dark:bg-primary-500/10">
              <span className="text-xs font-medium text-primary-700 dark:text-primary-300">{selectedIds.length} selected</span>
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
        emptyTitle="No reviews match these filters"
        rowActions={(row) => (
          <>
            <Tooltip content="View review" side="top">
              <button onClick={() => setViewingReviewId(row.id)} className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800" aria-label="View review">
                <Eye className="h-3.5 w-3.5" />
              </button>
            </Tooltip>
            <Tooltip content="Edit review" side="top">
              <button onClick={() => openEdit(row)} className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-primary-600 dark:hover:bg-gray-800" aria-label="Edit review">
                <Pencil className="h-3.5 w-3.5" />
              </button>
            </Tooltip>
            {row.status === "pending" && (
              <>
                <Tooltip content="Approve review" side="top">
                  <button onClick={() => handleApprove(row)} className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:bg-success/10 hover:text-success" aria-label="Approve review">
                    <Check className="h-3.5 w-3.5" />
                  </button>
                </Tooltip>
                <Tooltip content="Reject review" side="top">
                  <button onClick={() => setRejectTarget(row)} className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:bg-danger/10 hover:text-danger" aria-label="Reject review">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </Tooltip>
              </>
            )}
            <Tooltip content="Delete review" side="top">
              <button onClick={() => setDeleteTarget(row)} className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:bg-danger/10 hover:text-danger" aria-label="Delete review">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </Tooltip>
          </>
        )}
      />

      <ReviewFormModal isOpen={formOpen} onClose={() => setFormOpen(false)} onSubmit={handleFormSubmit} initialData={editingReview} submitting={busy} />

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title={`Delete review ${deleteTarget?.id}?`}
        description="This will permanently remove the review. This action cannot be undone."
        confirmLabel="Delete"
      />

      <ReasonModal
        isOpen={Boolean(rejectTarget)}
        onClose={() => setRejectTarget(null)}
        onConfirm={handleReject}
        title={`Reject review ${rejectTarget?.id}?`}
        description="The review will not be shown publicly."
        confirmLabel="Reject Review"
        placeholder="e.g. Duplicate review from the same user"
      />

      <ReasonModal
        isOpen={Boolean(flagTarget)}
        onClose={() => setFlagTarget(null)}
        onConfirm={handleFlag}
        title={`Flag review ${flagTarget?.id}?`}
        description="Flag this review as abusive or fake for further investigation."
        confirmLabel="Flag Review"
        placeholder="e.g. Contains abusive language directed at the seller"
      />

      <ReasonModal
        isOpen={bulkRejectOpen}
        onClose={() => setBulkRejectOpen(false)}
        onConfirm={handleBulkReject}
        title={`Reject ${selectedIds.length} reviews?`}
        description="The same reason will be applied to every selected review."
        confirmLabel="Reject All"
      />

      <Modal
        isOpen={Boolean(viewingReview)}
        onClose={() => setViewingReviewId(null)}
        size="md"
        title={viewingReview?.title}
        description={viewingReview ? `${viewingReview.id} — ${viewingReview.reviewerName}` : ""}
        footer={
          viewingReview && (
            <>
              {viewingReview.status !== "flagged" && (
                <Button
                  variant="outline"
                  icon={Flag}
                  onClick={() => {
                    setFlagTarget(viewingReview);
                    setViewingReviewId(null);
                  }}
                >
                  Flag
                </Button>
              )}
              {viewingReview.status === "pending" && (
                <>
                  <Button
                    variant="danger"
                    icon={X}
                    onClick={() => {
                      setRejectTarget(viewingReview);
                      setViewingReviewId(null);
                    }}
                  >
                    Reject
                  </Button>
                  <Button variant="success" icon={Check} onClick={() => handleApprove(viewingReview)}>
                    Approve
                  </Button>
                </>
              )}
            </>
          )
        }
      >
        {viewingReview && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <InfoField label="Listing" value={`${viewingReview.listingTitle} (${viewingReview.listingId})`} />
              <InfoField label="Reviewer" value={viewingReview.reviewerEmail} />
              <InfoField label="Rating" value={<Stars rating={viewingReview.rating} />} />
              <InfoField label="Status" value={<Badge variant={STATUS_BADGE[viewingReview.status]?.variant}>{STATUS_BADGE[viewingReview.status]?.label}</Badge>} />
            </div>
            <div className="rounded-lg bg-gray-50 p-3 text-sm text-gray-700 dark:bg-gray-800 dark:text-gray-300">{viewingReview.comment}</div>
            {viewingReview.moderationReason && (
              <div className="flex items-start gap-2 rounded-lg bg-danger/10 p-3 text-sm text-danger">
                <Flag className="mt-0.5 h-4 w-4 shrink-0" />
                <p>{viewingReview.moderationReason}</p>
              </div>
            )}
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
