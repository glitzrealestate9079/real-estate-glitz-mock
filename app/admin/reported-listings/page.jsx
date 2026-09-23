"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, Eye, Flag, Plus, ShieldX, Trash2, XCircle } from "lucide-react";
import toast from "react-hot-toast";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Table from "@/components/ui/Table";
import Select from "@/components/ui/Select";
import Modal from "@/components/ui/Modal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import ReasonModal from "@/components/ui/ReasonModal";
import Tooltip from "@/components/ui/Tooltip";
import ReportedListingFormModal from "@/components/reported-listings/ReportedListingFormModal";
import { useAppDispatch, useAppSelector } from "@/hooks/useReduxHooks";
import {
  addReportedListing,
  REPORT_REASONS,
  removeReportedListing,
  updateReportedListing,
} from "@/redux/slices/reportedListingsSlice";
import { removeListing } from "@/redux/slices/listingsSlice";
import { todayISO } from "@/utils/format";
import { useAuditLog } from "@/hooks/useAuditLog";

const STATUS_BADGE = {
  open: { variant: "danger", label: "Open" },
  reviewing: { variant: "warning", label: "Reviewing" },
  resolved: { variant: "success", label: "Resolved" },
  dismissed: { variant: "neutral", label: "Dismissed" },
};

export default function ReportedListingsPage() {
  const dispatch = useAppDispatch();
  const logAction = useAuditLog();
  const items = useAppSelector((state) => state.reportedListings.items);

  const [statusFilter, setStatusFilter] = useState("all");
  const [reasonFilter, setReasonFilter] = useState("all");

  const [formOpen, setFormOpen] = useState(false);
  const [viewingId, setViewingId] = useState(null);
  const [resolveTarget, setResolveTarget] = useState(null);
  const [dismissTarget, setDismissTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [busy, setBusy] = useState(false);

  const filtered = useMemo(() => {
    return items.filter((r) => {
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (reasonFilter !== "all" && r.reason !== reasonFilter) return false;
      return true;
    });
  }, [items, statusFilter, reasonFilter]);

  const viewingReport = useMemo(() => items.find((r) => r.id === viewingId) ?? null, [items, viewingId]);

  function handleAddSubmit(values) {
    setBusy(true);
    setTimeout(() => {
      const newId = `RPT-${Math.floor(50000 + Math.random() * 9999)}`;
      dispatch(addReportedListing({ id: newId, ...values, status: "open", reportedDate: todayISO(), resolutionNotes: "", resolvedDate: null }));
      toast.success("Report logged");
      setBusy(false);
      setFormOpen(false);
    }, 400);
  }

  function handleMarkReviewing(report) {
    dispatch(updateReportedListing({ id: report.id, status: "reviewing" }));
    toast.success(`${report.id} marked as reviewing`);
  }

  function handleResolve(notes) {
    dispatch(updateReportedListing({ id: resolveTarget.id, status: "resolved", resolutionNotes: notes, resolvedDate: todayISO() }));
    logAction(`Resolved report ${resolveTarget.id} (${resolveTarget.listingId})`, "Reported Listings");
    toast.success(`${resolveTarget.id} resolved`);
    setResolveTarget(null);
  }

  function handleDismiss(notes) {
    dispatch(updateReportedListing({ id: dismissTarget.id, status: "dismissed", resolutionNotes: notes, resolvedDate: todayISO() }));
    logAction(`Dismissed report ${dismissTarget.id} (${dismissTarget.listingId})`, "Reported Listings");
    toast.success(`${dismissTarget.id} dismissed`);
    setDismissTarget(null);
  }

  function handleRemoveListing(report) {
    dispatch(removeListing(report.listingId));
    dispatch(updateReportedListing({ id: report.id, status: "resolved", resolutionNotes: "Listing removed from the platform.", resolvedDate: todayISO() }));
    logAction(`Removed listing ${report.listingId} following report ${report.id}`, "Reported Listings");
    toast.success(`${report.listingId} removed and report resolved`);
    setViewingId(null);
  }

  function handleDelete() {
    dispatch(removeReportedListing(deleteTarget.id));
    toast.success(`${deleteTarget.id} deleted`);
    setDeleteTarget(null);
  }

  const columns = [
    {
      key: "listingTitle",
      header: "Listing",
      sortable: true,
      render: (row) => (
        <div className="min-w-0">
          <p className="max-w-[220px] truncate font-medium text-gray-900 dark:text-gray-100">{row.listingTitle}</p>
          <p className="text-xs text-gray-400">{row.listingId}</p>
        </div>
      ),
    },
    {
      key: "reason",
      header: "Reason",
      sortable: true,
      render: (row) => (
        <span className="inline-flex items-center gap-1.5 text-gray-700 dark:text-gray-300">
          <Flag className="h-3.5 w-3.5 text-gray-400" />
          {row.reason}
        </span>
      ),
    },
    { key: "reportedByName", header: "Reported By" },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (row) => {
        const s = STATUS_BADGE[row.status] ?? STATUS_BADGE.open;
        return <Badge variant={s.variant}>{s.label}</Badge>;
      },
    },
    { key: "reportedDate", header: "Reported", sortable: true },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Reported Listings</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Buyer-reported complaints about live listings — fake, duplicate, mispriced or otherwise.
          </p>
        </div>
        <Button icon={Plus} onClick={() => setFormOpen(true)}>
          Log Report
        </Button>
      </div>

      <Card>
        <div className="flex flex-wrap items-end gap-3">
          <Select label="Status" className="w-40" containerClassName="w-40" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">All statuses</option>
            <option value="open">Open</option>
            <option value="reviewing">Reviewing</option>
            <option value="resolved">Resolved</option>
            <option value="dismissed">Dismissed</option>
          </Select>
          <Select label="Reason" className="w-48" containerClassName="w-48" value={reasonFilter} onChange={(e) => setReasonFilter(e.target.value)}>
            <option value="all">All reasons</option>
            {REPORT_REASONS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </Select>
        </div>
      </Card>

      <Table
        columns={columns}
        data={filtered}
        emptyTitle="No reported listings match these filters"
        emptyDescription="Try a different status or reason filter."
        rowActions={(row) => (
          <>
            <Tooltip content="View report" side="top">
              <button
                onClick={() => setViewingId(row.id)}
                className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800"
                aria-label="View report"
              >
                <Eye className="h-3.5 w-3.5" />
              </button>
            </Tooltip>
            {row.status === "open" && (
              <Tooltip content="Mark as reviewing" side="top">
                <button
                  onClick={() => handleMarkReviewing(row)}
                  className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:bg-warning/10 hover:text-warning"
                  aria-label="Mark as reviewing"
                >
                  <ShieldX className="h-3.5 w-3.5" />
                </button>
              </Tooltip>
            )}
            {(row.status === "open" || row.status === "reviewing") && (
              <>
                <Tooltip content="Resolve" side="top">
                  <button
                    onClick={() => setResolveTarget(row)}
                    className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:bg-success/10 hover:text-success"
                    aria-label="Resolve report"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  </button>
                </Tooltip>
                <Tooltip content="Dismiss" side="top">
                  <button
                    onClick={() => setDismissTarget(row)}
                    className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:bg-danger/10 hover:text-danger"
                    aria-label="Dismiss report"
                  >
                    <XCircle className="h-3.5 w-3.5" />
                  </button>
                </Tooltip>
              </>
            )}
            <Tooltip content="Delete report" side="top">
              <button
                onClick={() => setDeleteTarget(row)}
                className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:bg-danger/10 hover:text-danger"
                aria-label="Delete report"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </Tooltip>
          </>
        )}
      />

      <ReportedListingFormModal isOpen={formOpen} onClose={() => setFormOpen(false)} onSubmit={handleAddSubmit} submitting={busy} />

      <ReasonModal
        isOpen={Boolean(resolveTarget)}
        onClose={() => setResolveTarget(null)}
        onConfirm={handleResolve}
        title={`Resolve ${resolveTarget?.id}?`}
        description="Note what action was taken — this is kept on the report for future reference."
        confirmLabel="Mark Resolved"
        placeholder="e.g. Confirmed fake, listing removed"
      />

      <ReasonModal
        isOpen={Boolean(dismissTarget)}
        onClose={() => setDismissTarget(null)}
        onConfirm={handleDismiss}
        title={`Dismiss ${dismissTarget?.id}?`}
        description="Note why this report didn't hold up — e.g. listing checked out fine."
        confirmLabel="Dismiss Report"
      />

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title={`Delete ${deleteTarget?.id}?`}
        description="This will permanently remove the report record. This action cannot be undone."
        confirmLabel="Delete"
      />

      <Modal
        isOpen={Boolean(viewingReport)}
        onClose={() => setViewingId(null)}
        size="md"
        title={viewingReport?.listingTitle}
        description={viewingReport ? `${viewingReport.id} — ${viewingReport.listingId}` : ""}
        footer={
          viewingReport &&
          (viewingReport.status === "open" || viewingReport.status === "reviewing") && (
            <Button variant="danger" icon={Trash2} onClick={() => handleRemoveListing(viewingReport)}>
              Remove Listing &amp; Resolve
            </Button>
          )
        }
      >
        {viewingReport && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <InfoField label="Reason" value={viewingReport.reason} />
              <InfoField label="Reported By" value={viewingReport.reportedByName} />
              <InfoField label="Phone" value={viewingReport.reportedByPhone} />
              <InfoField label="Reported On" value={viewingReport.reportedDate} />
              <InfoField
                label="Status"
                value={<Badge variant={STATUS_BADGE[viewingReport.status]?.variant}>{STATUS_BADGE[viewingReport.status]?.label}</Badge>}
              />
              {viewingReport.resolvedDate && <InfoField label="Resolved On" value={viewingReport.resolvedDate} />}
            </div>

            <div>
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-gray-400">Complaint Details</p>
              <p className="rounded-lg bg-gray-50 p-3 text-sm text-gray-700 dark:bg-gray-800 dark:text-gray-300">{viewingReport.details}</p>
            </div>

            {viewingReport.resolutionNotes && (
              <div>
                <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-gray-400">Resolution Notes</p>
                <p className="rounded-lg bg-gray-50 p-3 text-sm text-gray-700 dark:bg-gray-800 dark:text-gray-300">{viewingReport.resolutionNotes}</p>
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
