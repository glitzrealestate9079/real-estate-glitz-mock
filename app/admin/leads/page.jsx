"use client";

import { useMemo, useState } from "react";
import {
  BellRing,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  FileText,
  MessageCircle,
  Pencil,
  Phone,
  PhoneIncoming,
  Plus,
  Send,
  ShieldAlert,
  Trash2,
} from "lucide-react";
import toast from "react-hot-toast";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Table from "@/components/ui/Table";
import Select from "@/components/ui/Select";
import Modal from "@/components/ui/Modal";
import SegmentedControl from "@/components/ui/SegmentedControl";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import Tooltip from "@/components/ui/Tooltip";
import LeadFormModal, { STATUSES, STATUS_LABELS } from "@/components/leads/LeadFormModal";
import { useAppDispatch, useAppSelector } from "@/hooks/useReduxHooks";
import { useQuickAddParam } from "@/hooks/useQuickAddParam";
import { addLead, removeLead, removeLeads, updateLead } from "@/redux/slices/leadsSlice";
import { todayISO } from "@/utils/format";

const CHANNEL_ICON = {
  Call: Phone,
  Chat: MessageCircle,
  "Callback Request": PhoneIncoming,
  "Contact Form": FileText,
  WhatsApp: Send,
};

const STATUS_VARIANT = {
  new: "info",
  contacted: "warning",
  follow_up: "warning",
  interested: "info",
  site_visit: "info",
  negotiation: "warning",
  converted: "success",
  lost: "danger",
};
const STATUS_BADGE = Object.fromEntries(STATUSES.map((s) => [s, { variant: STATUS_VARIANT[s], label: STATUS_LABELS[s] }]));
const VIEW_MODES = [
  { value: "table", label: "Table" },
  { value: "kanban", label: "Kanban" },
];

const FLAG_BADGE = {
  genuine: { variant: "success", label: "Genuine" },
  spam: { variant: "danger", label: "Spam" },
  unreviewed: { variant: "neutral", label: "Unreviewed" },
};

function exportCSV(rows) {
  const headers = ["ID", "Buyer Name", "Phone", "Email", "Budget", "Listing ID", "Listing Title", "Channel", "Status", "Flag", "Assigned To", "Created", "Next Follow-up"];
  const csvRow = (vals) => vals.map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`).join(",");
  const lines = [csvRow(headers)];
  rows.forEach((r) => {
    lines.push(
      csvRow([r.id, r.buyerName, r.buyerPhone, r.buyerEmail, r.budget, r.listingId, r.listingTitle, r.channel, r.status, r.flag, r.assignedTo, r.createdDate, r.nextFollowUpDate])
    );
  });
  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `leads-export-${todayISO()}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function LeadsPage() {
  const dispatch = useAppDispatch();
  const items = useAppSelector((state) => state.leads.items);

  const [viewMode, setViewMode] = useState("table");
  const [channelFilter, setChannelFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [flagFilter, setFlagFilter] = useState("all");
  const [selectedIds, setSelectedIds] = useState([]);

  const [formOpen, setFormOpen] = useState(false);
  const [editingLead, setEditingLead] = useState(null);
  const [viewingLead, setViewingLead] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [busy, setBusy] = useState(false);

  const filtered = useMemo(() => {
    return items.filter((l) => {
      if (channelFilter !== "all" && l.channel !== channelFilter) return false;
      if (statusFilter !== "all" && l.status !== statusFilter) return false;
      if (flagFilter !== "all" && l.flag !== flagFilter) return false;
      return true;
    });
  }, [items, channelFilter, statusFilter, flagFilter]);

  function openAdd() {
    setEditingLead(null);
    setFormOpen(true);
  }

  useQuickAddParam(openAdd);

  function openEdit(lead) {
    setEditingLead(lead);
    setFormOpen(true);
  }

  function handleFormSubmit(values) {
    setBusy(true);
    setTimeout(() => {
      if (editingLead) {
        dispatch(updateLead({ id: editingLead.id, ...values, lastActivity: todayISO() }));
        toast.success(`Lead from ${values.buyerName} updated`);
      } else {
        const newId = `LED-${Math.floor(30000 + Math.random() * 9999)}`;
        dispatch(
          addLead({
            id: newId,
            ...values,
            flag: "unreviewed",
            createdDate: todayISO(),
            lastActivity: todayISO(),
          })
        );
        toast.success(`Lead from ${values.buyerName} added`);
      }
      setBusy(false);
      setFormOpen(false);
      setEditingLead(null);
    }, 400);
  }

  function handleMarkGenuine(lead) {
    dispatch(updateLead({ id: lead.id, flag: "genuine" }));
    toast.success(`${lead.buyerName}'s enquiry marked genuine`);
  }

  function handleMarkSpam(lead) {
    dispatch(updateLead({ id: lead.id, flag: "spam" }));
    toast.success(`${lead.buyerName}'s enquiry marked spam`);
  }

  function handleMoveStage(lead, direction) {
    const currentIndex = STATUSES.indexOf(lead.status);
    const nextIndex = currentIndex + direction;
    if (nextIndex < 0 || nextIndex >= STATUSES.length) return;
    const nextStatus = STATUSES[nextIndex];
    dispatch(updateLead({ id: lead.id, status: nextStatus, lastActivity: todayISO() }));
    toast.success(`${lead.buyerName} moved to ${STATUS_LABELS[nextStatus]}`);
  }

  function handleDelete() {
    dispatch(removeLead(deleteTarget.id));
    toast.success(`Lead ${deleteTarget.id} deleted`);
    setDeleteTarget(null);
  }

  function handleBulkMarkGenuine() {
    selectedIds.forEach((id) => dispatch(updateLead({ id, flag: "genuine" })));
    toast.success(`${selectedIds.length} leads marked genuine`);
    setSelectedIds([]);
  }

  function handleBulkMarkSpam() {
    selectedIds.forEach((id) => dispatch(updateLead({ id, flag: "spam" })));
    toast.success(`${selectedIds.length} leads marked spam`);
    setSelectedIds([]);
  }

  function handleBulkDelete() {
    dispatch(removeLeads(selectedIds));
    toast.success(`${selectedIds.length} leads deleted`);
    setSelectedIds([]);
  }

  function handleExport() {
    const rows = selectedIds.length > 0 ? filtered.filter((l) => selectedIds.includes(l.id)) : filtered;
    exportCSV(rows);
    toast.success(`Exported ${rows.length} leads to CSV`);
  }

  const columns = [
    {
      key: "buyerName",
      header: "Lead",
      sortable: true,
      render: (row) => (
        <div className="min-w-0">
          <p className="max-w-[180px] truncate font-medium text-gray-900 dark:text-gray-100">{row.buyerName}</p>
          <p className="text-xs text-gray-400">{row.buyerPhone}</p>
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
    { key: "budget", header: "Budget", sortable: true },
    {
      key: "channel",
      header: "Channel",
      sortable: true,
      render: (row) => {
        const Icon = CHANNEL_ICON[row.channel] ?? Phone;
        return (
          <span className="inline-flex items-center gap-1.5 text-gray-700 dark:text-gray-300">
            <Icon className="h-3.5 w-3.5 text-gray-400" />
            {row.channel}
          </span>
        );
      },
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (row) => {
        const s = STATUS_BADGE[row.status] ?? STATUS_BADGE.new;
        return <Badge variant={s.variant}>{s.label}</Badge>;
      },
    },
    {
      key: "flag",
      header: "Flag",
      sortable: true,
      render: (row) => {
        const f = FLAG_BADGE[row.flag] ?? FLAG_BADGE.unreviewed;
        return <Badge variant={f.variant}>{f.label}</Badge>;
      },
    },
    { key: "assignedTo", header: "Assigned To" },
    { key: "createdDate", header: "Created", sortable: true },
    {
      key: "nextFollowUpDate",
      header: "Next Follow-up",
      sortable: true,
      render: (row) => {
        if (!row.nextFollowUpDate) return <span className="text-gray-400">—</span>;
        const overdue = row.nextFollowUpDate < todayISO() && !["converted", "lost"].includes(row.status);
        return (
          <span className={overdue ? "inline-flex items-center gap-1 font-medium text-danger" : "text-gray-700 dark:text-gray-300"}>
            {overdue && <BellRing className="h-3.5 w-3.5" />}
            {row.nextFollowUpDate}
          </span>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Leads &amp; Enquiries</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Central log of every buyer enquiry — call, chat, callback, contact form and WhatsApp.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <SegmentedControl options={VIEW_MODES} value={viewMode} onChange={setViewMode} />
          <Button variant="outline" icon={Download} onClick={handleExport}>
            Export CSV
          </Button>
          <Button icon={Plus} onClick={openAdd}>
            Add Lead
          </Button>
        </div>
      </div>

      <Card>
        <div className="flex flex-wrap items-end gap-3">
          <Select
            label="Channel"
            className="w-44"
            containerClassName="w-44"
            value={channelFilter}
            onChange={(e) => setChannelFilter(e.target.value)}
          >
            <option value="all">All channels</option>
            {Object.keys(CHANNEL_ICON).map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
          <Select
            label="Status"
            className="w-40"
            containerClassName="w-40"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All statuses</option>
            {Object.entries(STATUS_BADGE).map(([k, v]) => (
              <option key={k} value={k}>
                {v.label}
              </option>
            ))}
          </Select>
          <Select
            label="Flag"
            className="w-40"
            containerClassName="w-40"
            value={flagFilter}
            onChange={(e) => setFlagFilter(e.target.value)}
          >
            <option value="all">All</option>
            {Object.entries(FLAG_BADGE).map(([k, v]) => (
              <option key={k} value={k}>
                {v.label}
              </option>
            ))}
          </Select>

          {selectedIds.length > 0 && (
            <div className="ml-auto flex flex-wrap items-center gap-2 rounded-lg bg-primary-50 px-3 py-2 dark:bg-primary-500/10">
              <span className="text-xs font-medium text-primary-700 dark:text-primary-300">
                {selectedIds.length} selected
              </span>
              <Button size="sm" variant="success" icon={CheckCircle2} onClick={handleBulkMarkGenuine}>
                Genuine
              </Button>
              <Button size="sm" variant="danger" icon={ShieldAlert} onClick={handleBulkMarkSpam}>
                Spam
              </Button>
              <Button size="sm" variant="outline" icon={Trash2} onClick={handleBulkDelete}>
                Delete
              </Button>
            </div>
          )}
        </div>
      </Card>

      {viewMode === "kanban" && (
        <div className="scrollbar-thin flex gap-4 overflow-x-auto pb-2">
          {STATUSES.map((stage) => {
            const stageLeads = filtered.filter((l) => l.status === stage);
            return (
              <div key={stage} className="w-72 shrink-0">
                <div className="mb-2 flex items-center justify-between px-1">
                  <span className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    <Badge variant={STATUS_VARIANT[stage]} dot={false} className="px-2 py-0.5">
                      {STATUS_LABELS[stage]}
                    </Badge>
                  </span>
                  <span className="text-xs text-gray-400">{stageLeads.length}</span>
                </div>
                <div className="space-y-2.5 rounded-xl bg-gray-50 p-2.5 dark:bg-gray-900/50" style={{ minHeight: 80 }}>
                  {stageLeads.length === 0 ? (
                    <p className="py-4 text-center text-xs text-gray-400">No leads</p>
                  ) : (
                    stageLeads.map((lead) => {
                      const stageIndex = STATUSES.indexOf(lead.status);
                      return (
                        <Card key={lead.id} className="p-3">
                          <div className="flex items-start justify-between gap-2">
                            <button onClick={() => setViewingLead(lead)} className="min-w-0 text-left">
                              <p className="truncate text-sm font-medium text-gray-900 hover:underline dark:text-gray-100">{lead.buyerName}</p>
                              <p className="truncate text-xs text-gray-400">{lead.listingTitle}</p>
                            </button>
                            {lead.flag === "spam" && <ShieldAlert className="h-3.5 w-3.5 shrink-0 text-danger" />}
                          </div>
                          <p className="mt-1.5 text-xs font-medium text-primary-600 dark:text-primary-400">{lead.budget}</p>
                          <div className="mt-2 flex items-center justify-between">
                            <span className="text-[11px] text-gray-400">{lead.assignedTo}</span>
                            <div className="flex items-center gap-1">
                              <Tooltip content="Move to previous stage" side="top">
                                <button
                                  onClick={() => handleMoveStage(lead, -1)}
                                  disabled={stageIndex === 0}
                                  className="flex h-6 w-6 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 disabled:opacity-30 dark:hover:bg-gray-800"
                                  aria-label="Move to previous stage"
                                >
                                  <ChevronLeft className="h-3.5 w-3.5" />
                                </button>
                              </Tooltip>
                              <Tooltip content="Move to next stage" side="top">
                                <button
                                  onClick={() => handleMoveStage(lead, 1)}
                                  disabled={stageIndex === STATUSES.length - 1}
                                  className="flex h-6 w-6 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 disabled:opacity-30 dark:hover:bg-gray-800"
                                  aria-label="Move to next stage"
                                >
                                  <ChevronRight className="h-3.5 w-3.5" />
                                </button>
                              </Tooltip>
                            </div>
                          </div>
                        </Card>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {viewMode === "table" && (
      <Table
        columns={columns}
        data={filtered}
        selectable
        selectedIds={selectedIds}
        onSelectedIdsChange={setSelectedIds}
        emptyTitle="No leads match these filters"
        emptyDescription="Try a different channel, status or flag."
        rowActions={(row) => (
          <>
            <Tooltip content="View lead" side="top">
              <button
                onClick={() => setViewingLead(row)}
                className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800"
                aria-label="View lead"
              >
                <Eye className="h-3.5 w-3.5" />
              </button>
            </Tooltip>
            <Tooltip content="Edit lead" side="top">
              <button
                onClick={() => openEdit(row)}
                className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-primary-600 dark:hover:bg-gray-800"
                aria-label="Edit lead"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
            </Tooltip>
            {row.flag !== "genuine" && (
              <Tooltip content="Mark genuine" side="top">
                <button
                  onClick={() => handleMarkGenuine(row)}
                  className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:bg-success/10 hover:text-success"
                  aria-label="Mark genuine"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                </button>
              </Tooltip>
            )}
            {row.flag !== "spam" && (
              <Tooltip content="Mark spam" side="top">
                <button
                  onClick={() => handleMarkSpam(row)}
                  className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:bg-danger/10 hover:text-danger"
                  aria-label="Mark spam"
                >
                  <ShieldAlert className="h-3.5 w-3.5" />
                </button>
              </Tooltip>
            )}
            <Tooltip content="Delete lead" side="top">
              <button
                onClick={() => setDeleteTarget(row)}
                className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:bg-danger/10 hover:text-danger"
                aria-label="Delete lead"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </Tooltip>
          </>
        )}
      />
      )}

      <LeadFormModal
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={editingLead}
        submitting={busy}
      />

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title={`Delete lead ${deleteTarget?.id}?`}
        description="This will permanently remove the enquiry from the leads log. This action cannot be undone."
        confirmLabel="Delete"
      />

      <Modal
        isOpen={Boolean(viewingLead)}
        onClose={() => setViewingLead(null)}
        size="md"
        title={viewingLead?.buyerName}
        description={viewingLead ? `${viewingLead.id} — ${viewingLead.channel}` : ""}
        footer={
          viewingLead && (
            <>
              {viewingLead.flag !== "genuine" && (
                <Button
                  variant="success"
                  icon={CheckCircle2}
                  onClick={() => {
                    handleMarkGenuine(viewingLead);
                    setViewingLead(null);
                  }}
                >
                  Mark Genuine
                </Button>
              )}
              {viewingLead.flag !== "spam" && (
                <Button
                  variant="danger"
                  icon={ShieldAlert}
                  onClick={() => {
                    handleMarkSpam(viewingLead);
                    setViewingLead(null);
                  }}
                >
                  Mark Spam
                </Button>
              )}
            </>
          )
        }
      >
        {viewingLead && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <InfoField label="Phone" value={viewingLead.buyerPhone} />
              <InfoField label="Email" value={viewingLead.buyerEmail || "—"} />
              <InfoField label="Budget" value={viewingLead.budget} />
              <InfoField label="Assigned To" value={viewingLead.assignedTo} />
              <InfoField label="Listing" value={`${viewingLead.listingTitle} (${viewingLead.listingId})`} />
              <InfoField label="Created" value={viewingLead.createdDate} />
              <InfoField label="Last Activity" value={viewingLead.lastActivity} />
              <InfoField label="Next Follow-up" value={viewingLead.nextFollowUpDate || "—"} />
              <InfoField
                label="Status"
                value={<Badge variant={STATUS_BADGE[viewingLead.status]?.variant}>{STATUS_BADGE[viewingLead.status]?.label}</Badge>}
              />
              <InfoField
                label="Flag"
                value={<Badge variant={FLAG_BADGE[viewingLead.flag]?.variant}>{FLAG_BADGE[viewingLead.flag]?.label}</Badge>}
              />
            </div>

            <div>
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-gray-400">Message</p>
              <p className="rounded-lg bg-gray-50 p-3 text-sm text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                {viewingLead.message}
              </p>
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
