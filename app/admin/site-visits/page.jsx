"use client";

import { useMemo, useState } from "react";
import {
  Calendar,
  CalendarCheck2,
  CalendarClock,
  Check,
  ChevronLeft,
  ChevronRight,
  Eye,
  MapPin,
  Pencil,
  Phone,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Table from "@/components/ui/Table";
import Select from "@/components/ui/Select";
import Modal from "@/components/ui/Modal";
import StatCard from "@/components/ui/StatCard";
import SegmentedControl from "@/components/ui/SegmentedControl";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import ReasonModal from "@/components/ui/ReasonModal";
import SiteVisitFormModal from "@/components/site-visits/SiteVisitFormModal";
import Tooltip from "@/components/ui/Tooltip";
import { useAppDispatch, useAppSelector } from "@/hooks/useReduxHooks";
import { useQuickAddParam } from "@/hooks/useQuickAddParam";
import {
  addSiteVisit,
  removeSiteVisit,
  updateSiteVisit,
  updateSiteVisitStatus,
} from "@/redux/slices/siteVisitsSlice";
import { formatCount, toLocalISODate, todayISO } from "@/utils/format";

const STATUS_BADGE = {
  requested: { variant: "warning", label: "Requested" },
  confirmed: { variant: "info", label: "Confirmed" },
  rescheduled: { variant: "warning", label: "Rescheduled" },
  completed: { variant: "success", label: "Completed" },
  cancelled: { variant: "danger", label: "Cancelled" },
};

const STATUS_DOT = {
  requested: "bg-warning",
  confirmed: "bg-accent-500",
  rescheduled: "bg-warning",
  completed: "bg-success",
  cancelled: "bg-danger",
};

const VIEW_MODES = [
  { value: "table", label: "Table" },
  { value: "calendar", label: "Calendar" },
];

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function formatDate(iso) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

export default function SiteVisitsPage() {
  const dispatch = useAppDispatch();
  const items = useAppSelector((state) => state.siteVisits.items);
  const users = useAppSelector((state) => state.users.items);

  const [viewMode, setViewMode] = useState("table");
  const [statusFilter, setStatusFilter] = useState("all");
  const [agentFilter, setAgentFilter] = useState("all");
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });

  const [formOpen, setFormOpen] = useState(false);
  const [editingVisit, setEditingVisit] = useState(null);
  const [viewingId, setViewingId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [busy, setBusy] = useState(false);

  const agentsInUse = useMemo(() => {
    const ids = new Set(items.map((v) => v.agentId));
    return users.filter((u) => ids.has(u.id));
  }, [items, users]);

  const filtered = useMemo(() => {
    return items.filter((v) => {
      if (statusFilter !== "all" && v.status !== statusFilter) return false;
      if (agentFilter !== "all" && v.agentId !== agentFilter) return false;
      return true;
    });
  }, [items, statusFilter, agentFilter]);

  const viewingVisit = useMemo(() => items.find((v) => v.id === viewingId) ?? null, [items, viewingId]);

  // Month grid for the Calendar view — a flat array of 7-wide weeks so the JSX just maps over
  // cells; `null` entries are the leading/trailing blanks needed to align day 1 to its weekday.
  const calendarCells = useMemo(() => {
    const { year, month } = calendarMonth;
    const firstDay = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const visitsByDate = {};
    filtered.forEach((v) => {
      (visitsByDate[v.date] ??= []).push(v);
    });
    const cells = Array.from({ length: firstDay.getDay() }, () => null);
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = toLocalISODate(new Date(year, month, day));
      cells.push({ day, dateStr, visits: visitsByDate[dateStr] ?? [] });
    }
    return cells;
  }, [calendarMonth, filtered]);

  function goToMonth(delta) {
    setCalendarMonth(({ year, month }) => {
      const next = new Date(year, month + delta, 1);
      return { year: next.getFullYear(), month: next.getMonth() };
    });
  }

  const today = todayISO();
  const kpis = useMemo(() => {
    const weekAhead = new Date();
    weekAhead.setDate(weekAhead.getDate() + 7);
    const weekAheadISO = toLocalISODate(weekAhead);
    return {
      today: items.filter((v) => v.date === today && v.status !== "cancelled").length,
      thisWeek: items.filter((v) => v.date >= today && v.date <= weekAheadISO && v.status !== "cancelled").length,
      awaitingConfirmation: items.filter((v) => v.status === "requested").length,
      completed: items.filter((v) => v.status === "completed").length,
    };
  }, [items, today]);

  const upcoming = useMemo(() => {
    return items
      .filter((v) => v.date >= today && (v.status === "requested" || v.status === "confirmed" || v.status === "rescheduled"))
      .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))
      .slice(0, 5);
  }, [items, today]);

  function openAdd() {
    setEditingVisit(null);
    setFormOpen(true);
  }

  useQuickAddParam(openAdd);

  function openEdit(visit) {
    setEditingVisit(visit);
    setFormOpen(true);
  }

  function handleFormSubmit(values) {
    setBusy(true);
    setTimeout(() => {
      if (editingVisit) {
        dispatch(updateSiteVisit({ id: editingVisit.id, ...values }));
        toast.success(`Visit ${editingVisit.id} updated`);
      } else {
        const newId = `VIS-${Math.floor(40000 + Math.random() * 9999)}`;
        dispatch(addSiteVisit({ id: newId, ...values, createdDate: today }));
        toast.success(`Site visit scheduled for ${values.buyerName}`);
      }
      setBusy(false);
      setFormOpen(false);
      setEditingVisit(null);
    }, 400);
  }

  function handleConfirm(visit) {
    dispatch(updateSiteVisitStatus({ id: visit.id, status: "confirmed" }));
    toast.success(`${visit.id} confirmed`);
  }

  function handleComplete(visit) {
    dispatch(updateSiteVisitStatus({ id: visit.id, status: "completed" }));
    toast.success(`${visit.id} marked completed`);
  }

  function handleCancel(reason) {
    dispatch(updateSiteVisitStatus({ id: cancelTarget.id, status: "cancelled", notes: reason }));
    toast.success(`${cancelTarget.id} cancelled`);
    setCancelTarget(null);
  }

  function handleDelete() {
    dispatch(removeSiteVisit(deleteTarget.id));
    toast.success(`${deleteTarget.id} deleted`);
    setDeleteTarget(null);
  }

  const columns = [
    {
      key: "buyerName",
      header: "Visit",
      sortable: true,
      render: (row) => (
        <div className="min-w-0">
          <p className="max-w-[200px] truncate font-medium text-gray-900 dark:text-gray-100">{row.buyerName}</p>
          <p className="max-w-[200px] truncate text-xs text-gray-400">{row.listingTitle}</p>
        </div>
      ),
    },
    { key: "agentName", header: "Agent / Host", sortable: true },
    { key: "city", header: "City", sortable: true },
    {
      key: "date",
      header: "Date & Time",
      sortable: true,
      render: (row) => (
        <span>
          {formatDate(row.date)} · {row.time}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (row) => {
        const s = STATUS_BADGE[row.status] ?? STATUS_BADGE.requested;
        return <Badge variant={s.variant}>{s.label}</Badge>;
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Site Visits</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Schedule and track buyer/tenant walkthroughs across every listing.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:flex-nowrap">
          <SegmentedControl options={VIEW_MODES} value={viewMode} onChange={setViewMode} className="w-auto shrink-0" />
          <Button icon={Plus} onClick={openAdd} className="shrink-0">
            Schedule Visit
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={CalendarClock} label="Today's Visits" value={formatCount(kpis.today)} />
        <StatCard icon={Calendar} label="This Week" value={formatCount(kpis.thisWeek)} />
        <StatCard icon={CalendarClock} label="Awaiting Confirmation" value={formatCount(kpis.awaitingConfirmation)} />
        <StatCard icon={CalendarCheck2} label="Completed" value={formatCount(kpis.completed)} />
      </div>

      <Card title="Upcoming Visits" description="Next 5 confirmed or requested visits, soonest first">
        {upcoming.length === 0 ? (
          <p className="py-6 text-center text-sm text-gray-400">No upcoming visits scheduled.</p>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {upcoming.map((v) => {
              const s = STATUS_BADGE[v.status] ?? STATUS_BADGE.requested;
              return (
                <div key={v.id} className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <div className="flex h-10 w-14 shrink-0 flex-col items-center justify-center rounded-lg bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400">
                      <span className="text-[10px] font-semibold uppercase leading-tight">{formatDate(v.date).split(" ")[0]}</span>
                      <span className="text-xs font-bold leading-tight">{formatDate(v.date).split(" ")[1]}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">
                        {v.buyerName} — {v.listingTitle}
                      </p>
                      <p className="flex items-center gap-1 truncate text-xs text-gray-400">
                        <MapPin className="h-3 w-3 shrink-0" />
                        {v.city} · {v.time} · {v.agentName}
                      </p>
                    </div>
                  </div>
                  <Badge variant={s.variant}>{s.label}</Badge>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      <Card>
        <div className="flex flex-wrap items-end gap-3">
          <Select
            label="Status"
            className="w-44"
            containerClassName="w-44"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All statuses</option>
            <option value="requested">Requested</option>
            <option value="confirmed">Confirmed</option>
            <option value="rescheduled">Rescheduled</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </Select>
          <Select
            label="Agent / Host"
            className="w-52"
            containerClassName="w-52"
            value={agentFilter}
            onChange={(e) => setAgentFilter(e.target.value)}
          >
            <option value="all">All agents</option>
            {agentsInUse.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </Select>
        </div>
      </Card>

      {viewMode === "calendar" && (
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {new Date(calendarMonth.year, calendarMonth.month, 1).toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => goToMonth(-1)}
                className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                aria-label="Previous month"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => goToMonth(1)}
                className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                aria-label="Next month"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-px overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
            {WEEKDAY_LABELS.map((d) => (
              <div key={d} className="bg-gray-50 py-2 text-center text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:bg-gray-900 dark:text-gray-400">
                {d}
              </div>
            ))}
            {calendarCells.map((cell, i) => (
              <div
                key={i}
                className={`min-h-[92px] bg-white p-1.5 dark:bg-surface-dark-subtle ${cell?.dateStr === today ? "ring-2 ring-inset ring-accent-400" : ""}`}
              >
                {cell && (
                  <>
                    <p className="mb-1 text-xs font-medium text-gray-500 dark:text-gray-400">{cell.day}</p>
                    <div className="space-y-1">
                      {cell.visits.slice(0, 2).map((v) => (
                        <button
                          key={v.id}
                          onClick={() => setViewingId(v.id)}
                          className="flex w-full items-center gap-1 truncate rounded bg-gray-50 px-1 py-0.5 text-left text-[11px] text-gray-700 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                        >
                          <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${STATUS_DOT[v.status]}`} />
                          <span className="truncate">
                            {v.time} {v.buyerName}
                          </span>
                        </button>
                      ))}
                      {cell.visits.length > 2 && (
                        <p className="px-1 text-[10px] text-gray-400">+{cell.visits.length - 2} more</p>
                      )}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {viewMode === "table" && (
      <Table
        columns={columns}
        data={filtered}
        emptyTitle="No site visits match these filters"
        emptyDescription="Try a different status or agent."
        rowActions={(row) => (
          <>
            <Tooltip content="View visit" side="top">
              <button
                onClick={() => setViewingId(row.id)}
                className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800"
                aria-label="View visit"
              >
                <Eye className="h-3.5 w-3.5" />
              </button>
            </Tooltip>
            <Tooltip content="Edit visit" side="top">
              <button
                onClick={() => openEdit(row)}
                className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-primary-600 dark:hover:bg-gray-800"
                aria-label="Edit visit"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
            </Tooltip>
            {row.status === "requested" && (
              <Tooltip content="Confirm visit" side="top">
                <button
                  onClick={() => handleConfirm(row)}
                  className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:bg-success/10 hover:text-success"
                  aria-label="Confirm visit"
                >
                  <Check className="h-3.5 w-3.5" />
                </button>
              </Tooltip>
            )}
            {(row.status === "confirmed" || row.status === "rescheduled") && (
              <Tooltip content="Mark completed" side="top">
                <button
                  onClick={() => handleComplete(row)}
                  className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:bg-success/10 hover:text-success"
                  aria-label="Mark completed"
                >
                  <CalendarCheck2 className="h-3.5 w-3.5" />
                </button>
              </Tooltip>
            )}
            {(row.status === "requested" || row.status === "confirmed" || row.status === "rescheduled") && (
              <Tooltip content="Cancel visit" side="top">
                <button
                  onClick={() => setCancelTarget(row)}
                  className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:bg-danger/10 hover:text-danger"
                  aria-label="Cancel visit"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </Tooltip>
            )}
            <Tooltip content="Delete visit" side="top">
              <button
                onClick={() => setDeleteTarget(row)}
                className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:bg-danger/10 hover:text-danger"
                aria-label="Delete visit"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </Tooltip>
          </>
        )}
      />
      )}

      <SiteVisitFormModal
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={editingVisit}
        submitting={busy}
      />

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title={`Delete ${deleteTarget?.id}?`}
        description="This will permanently remove the scheduled visit. This action cannot be undone."
        confirmLabel="Delete"
      />

      <ReasonModal
        isOpen={Boolean(cancelTarget)}
        onClose={() => setCancelTarget(null)}
        onConfirm={handleCancel}
        title={`Cancel ${cancelTarget?.id}?`}
        description="Let the agent know why this visit is being cancelled."
        confirmLabel="Cancel Visit"
        placeholder="e.g. Buyer requested to postpone indefinitely"
      />

      <Modal
        isOpen={Boolean(viewingVisit)}
        onClose={() => setViewingId(null)}
        size="md"
        title={viewingVisit?.buyerName}
        description={viewingVisit ? `${viewingVisit.id} — ${viewingVisit.listingTitle}` : ""}
        footer={
          viewingVisit && (
            <>
              {viewingVisit.status === "requested" && (
                <Button
                  variant="success"
                  icon={Check}
                  onClick={() => {
                    handleConfirm(viewingVisit);
                    setViewingId(null);
                  }}
                >
                  Confirm
                </Button>
              )}
              {(viewingVisit.status === "confirmed" || viewingVisit.status === "rescheduled") && (
                <Button
                  variant="success"
                  icon={CalendarCheck2}
                  onClick={() => {
                    handleComplete(viewingVisit);
                    setViewingId(null);
                  }}
                >
                  Mark Completed
                </Button>
              )}
            </>
          )
        }
      >
        {viewingVisit && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <InfoField label="Phone" value={viewingVisit.buyerPhone} icon={Phone} />
              <InfoField label="City" value={viewingVisit.city} icon={MapPin} />
              <InfoField label="Agent / Host" value={viewingVisit.agentName} />
              <InfoField label="Date & Time" value={`${formatDate(viewingVisit.date)} · ${viewingVisit.time}`} />
              <InfoField
                label="Status"
                value={<Badge variant={STATUS_BADGE[viewingVisit.status]?.variant}>{STATUS_BADGE[viewingVisit.status]?.label}</Badge>}
              />
              <InfoField label="Requested On" value={viewingVisit.createdDate} />
            </div>
            {viewingVisit.notes && (
              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-400">Notes</p>
                <p className="text-sm text-gray-700 dark:text-gray-300">{viewingVisit.notes}</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

function InfoField({ label, value, icon: Icon }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wide text-gray-400">{label}</p>
      <p className="mt-0.5 flex items-center gap-1.5 break-words text-sm font-medium text-gray-800 dark:text-gray-200">
        {Icon && <Icon className="h-3.5 w-3.5 shrink-0 text-gray-400" />}
        {value}
      </p>
    </div>
  );
}
