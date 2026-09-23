"use client";

import { useMemo, useState } from "react";
import { BellOff, BellRing, Eye, Pause, Pencil, Play, Plus, Search, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Table from "@/components/ui/Table";
import Select from "@/components/ui/Select";
import Modal from "@/components/ui/Modal";
import StatCard from "@/components/ui/StatCard";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import Tooltip from "@/components/ui/Tooltip";
import SavedSearchFormModal from "@/components/saved-searches/SavedSearchFormModal";
import { useAppDispatch, useAppSelector } from "@/hooks/useReduxHooks";
import {
  addSavedSearch,
  removeSavedSearch,
  updateSavedSearch,
  updateSavedSearchStatus,
} from "@/redux/slices/savedSearchesSlice";
import { formatCount, formatINR, todayISO } from "@/utils/format";

const FREQUENCY_BADGE = {
  Instant: "success",
  Daily: "info",
  Weekly: "neutral",
  Off: "neutral",
};

export default function SavedSearchesPage() {
  const dispatch = useAppDispatch();
  const items = useAppSelector((state) => state.savedSearches.items);

  const [statusFilter, setStatusFilter] = useState("all");
  const [cityFilter, setCityFilter] = useState("all");

  const [formOpen, setFormOpen] = useState(false);
  const [editingSearch, setEditingSearch] = useState(null);
  const [viewingId, setViewingId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [busy, setBusy] = useState(false);

  const cities = useMemo(() => [...new Set(items.map((s) => s.city))].sort(), [items]);

  const filtered = useMemo(() => {
    return items.filter((s) => {
      if (statusFilter !== "all" && s.status !== statusFilter) return false;
      if (cityFilter !== "all" && s.city !== cityFilter) return false;
      return true;
    });
  }, [items, statusFilter, cityFilter]);

  const viewingSearch = useMemo(() => items.find((s) => s.id === viewingId) ?? null, [items, viewingId]);

  const kpis = useMemo(
    () => ({
      total: items.length,
      active: items.filter((s) => s.status === "active").length,
      instant: items.filter((s) => s.alertFrequency === "Instant").length,
      totalMatches: items.reduce((sum, s) => sum + (s.matchesCount ?? 0), 0),
    }),
    [items]
  );

  function openAdd() {
    setEditingSearch(null);
    setFormOpen(true);
  }

  function openEdit(search) {
    setEditingSearch(search);
    setFormOpen(true);
  }

  function handleFormSubmit(values) {
    setBusy(true);
    setTimeout(() => {
      if (editingSearch) {
        dispatch(updateSavedSearch({ id: editingSearch.id, ...values }));
        toast.success(`${values.userName}'s saved search updated`);
      } else {
        const newId = `SS-${Math.floor(50000 + Math.random() * 9999)}`;
        dispatch(
          addSavedSearch({
            id: newId,
            ...values,
            matchesCount: 0,
            status: "active",
            createdDate: todayISO(),
            lastAlertSent: "—",
          })
        );
        toast.success(`Saved search created for ${values.userName}`);
      }
      setBusy(false);
      setFormOpen(false);
      setEditingSearch(null);
    }, 400);
  }

  function handleToggleStatus(search) {
    const nextStatus = search.status === "active" ? "paused" : "active";
    dispatch(updateSavedSearchStatus({ id: search.id, status: nextStatus }));
    toast.success(`Alerts ${nextStatus === "active" ? "resumed" : "paused"} for ${search.userName}`);
  }

  function handleDelete() {
    dispatch(removeSavedSearch(deleteTarget.id));
    toast.success(`Saved search deleted`);
    setDeleteTarget(null);
  }

  const columns = [
    {
      key: "userName",
      header: "User",
      sortable: true,
      render: (row) => (
        <div className="min-w-0">
          <p className="max-w-[180px] truncate font-medium text-gray-900 dark:text-gray-100">{row.userName}</p>
          <p className="max-w-[180px] truncate text-xs text-gray-400">{row.userEmail}</p>
        </div>
      ),
    },
    {
      key: "city",
      header: "Criteria",
      render: (row) => (
        <div>
          <p className="text-gray-700 dark:text-gray-300">
            {row.propertyType} · {row.listingType} · {row.city}
          </p>
          <p className="text-xs text-gray-400">
            {formatINR(row.minBudget)} – {formatINR(row.maxBudget)} · {row.bedrooms} BHK
          </p>
        </div>
      ),
    },
    {
      key: "alertFrequency",
      header: "Alerts",
      sortable: true,
      render: (row) => <Badge variant={FREQUENCY_BADGE[row.alertFrequency] ?? "neutral"}>{row.alertFrequency}</Badge>,
    },
    {
      key: "matchesCount",
      header: "Matches",
      sortable: true,
      render: (row) => formatCount(row.matchesCount ?? 0),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (row) => <Badge variant={row.status === "active" ? "success" : "neutral"}>{row.status === "active" ? "Active" : "Paused"}</Badge>,
    },
    { key: "createdDate", header: "Created", sortable: true },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Saved Searches</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Buyer &amp; tenant search alerts — monitor match volume and manage alert delivery.
          </p>
        </div>
        <Button icon={Plus} onClick={openAdd}>
          Add Saved Search
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Search} label="Total Saved Searches" value={formatCount(kpis.total)} />
        <StatCard icon={BellRing} label="Active Alerts" value={formatCount(kpis.active)} />
        <StatCard icon={BellRing} label="Instant Alerts" value={formatCount(kpis.instant)} />
        <StatCard icon={Search} label="Total Matches Sent" value={formatCount(kpis.totalMatches)} />
      </div>

      <Card>
        <div className="flex flex-wrap items-end gap-3">
          <Select label="Status" className="w-40" containerClassName="w-40" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
          </Select>
          <Select label="City" className="w-44" containerClassName="w-44" value={cityFilter} onChange={(e) => setCityFilter(e.target.value)}>
            <option value="all">All cities</option>
            {cities.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
        </div>
      </Card>

      <Table
        columns={columns}
        data={filtered}
        emptyTitle="No saved searches match these filters"
        emptyDescription="Try a different status or city."
        rowActions={(row) => (
          <>
            <Tooltip content="View saved search" side="top">
              <button
                onClick={() => setViewingId(row.id)}
                className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800"
                aria-label="View saved search"
              >
                <Eye className="h-3.5 w-3.5" />
              </button>
            </Tooltip>
            <Tooltip content="Edit saved search" side="top">
              <button
                onClick={() => openEdit(row)}
                className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-primary-600 dark:hover:bg-gray-800"
                aria-label="Edit saved search"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
            </Tooltip>
            <Tooltip content={row.status === "active" ? "Pause alerts" : "Resume alerts"} side="top">
              <button
                onClick={() => handleToggleStatus(row)}
                className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:bg-warning/10 hover:text-amber-600"
                aria-label={row.status === "active" ? "Pause alerts" : "Resume alerts"}
              >
                {row.status === "active" ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
              </button>
            </Tooltip>
            <Tooltip content="Delete saved search" side="top">
              <button
                onClick={() => setDeleteTarget(row)}
                className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:bg-danger/10 hover:text-danger"
                aria-label="Delete saved search"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </Tooltip>
          </>
        )}
      />

      <SavedSearchFormModal
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={editingSearch}
        submitting={busy}
      />

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete this saved search?"
        description="The user will stop receiving alerts for this criteria. This action cannot be undone."
        confirmLabel="Delete"
      />

      <Modal
        isOpen={Boolean(viewingSearch)}
        onClose={() => setViewingId(null)}
        size="md"
        title={viewingSearch?.userName}
        description={viewingSearch?.userEmail}
        footer={
          viewingSearch && (
            <Button
              variant="outline"
              icon={viewingSearch.status === "active" ? BellOff : BellRing}
              onClick={() => {
                handleToggleStatus(viewingSearch);
                setViewingId(null);
              }}
            >
              {viewingSearch.status === "active" ? "Pause Alerts" : "Resume Alerts"}
            </Button>
          )
        }
      >
        {viewingSearch && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <InfoField label="City" value={viewingSearch.city} />
            <InfoField label="Property Type" value={viewingSearch.propertyType} />
            <InfoField label="Listing Type" value={viewingSearch.listingType} />
            <InfoField label="Bedrooms" value={viewingSearch.bedrooms} />
            <InfoField label="Budget" value={`${formatINR(viewingSearch.minBudget)} – ${formatINR(viewingSearch.maxBudget)}`} />
            <InfoField label="Alert Frequency" value={viewingSearch.alertFrequency} />
            <InfoField label="Matches Found" value={formatCount(viewingSearch.matchesCount ?? 0)} />
            <InfoField label="Created" value={viewingSearch.createdDate} />
            <InfoField label="Last Alert Sent" value={viewingSearch.lastAlertSent} />
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
