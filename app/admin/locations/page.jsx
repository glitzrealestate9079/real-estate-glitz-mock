"use client";

import { useMemo, useState } from "react";
import {
  Building,
  ChevronRight,
  Flag,
  Globe2,
  Landmark,
  MapPin,
  Pencil,
  Plus,
  Power,
  Trash2,
} from "lucide-react";
import toast from "react-hot-toast";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Table from "@/components/ui/Table";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import LocationFormModal from "@/components/locations/LocationFormModal";
import { useAppDispatch, useAppSelector } from "@/hooks/useReduxHooks";
import { addLocation, removeLocation, updateLocation, updateLocationStatus, TYPE_ORDER } from "@/redux/slices/locationsSlice";
import { formatCount } from "@/utils/format";

const TYPE_ICON = { country: Globe2, state: Flag, city: Landmark, locality: MapPin };
const TYPE_LABEL = { country: "Country", state: "State", city: "City", locality: "Locality" };
const TYPE_LABEL_PLURAL = { country: "countries", state: "states", city: "cities", locality: "localities" };

export default function LocationsPage() {
  const dispatch = useAppDispatch();
  const items = useAppSelector((state) => state.locations.items);

  const [path, setPath] = useState([]); // array of location objects from root to current level
  const [formOpen, setFormOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [busy, setBusy] = useState(false);

  const currentParent = path[path.length - 1] ?? null;
  const currentType = currentParent ? TYPE_ORDER[TYPE_ORDER.indexOf(currentParent.type) + 1] : "country";

  const children = useMemo(() => {
    const parentId = currentParent ? currentParent.id : null;
    return items.filter((i) => i.parentId === parentId);
  }, [items, currentParent]);

  function childCount(id) {
    return items.filter((i) => i.parentId === id).length;
  }

  function drillInto(location) {
    if (location.type === "locality") return;
    setPath((p) => [...p, location]);
  }

  function goToDepth(depth) {
    setPath((p) => p.slice(0, depth));
  }

  function openAdd() {
    setEditingLocation(null);
    setFormOpen(true);
  }

  function openEdit(location) {
    setEditingLocation(location);
    setFormOpen(true);
  }

  function handleFormSubmit(values) {
    setBusy(true);
    setTimeout(() => {
      if (editingLocation) {
        dispatch(updateLocation({ id: editingLocation.id, ...values }));
        toast.success(`${values.name} updated`);
      } else {
        const newId = `LOC-${currentType}-${Date.now()}`;
        dispatch(
          addLocation({
            id: newId,
            ...values,
            type: currentType,
            parentId: currentParent ? currentParent.id : null,
            propertiesCount: 0,
          })
        );
        toast.success(`${values.name} added`);
      }
      setBusy(false);
      setFormOpen(false);
      setEditingLocation(null);
    }, 300);
  }

  function handleToggleStatus(location) {
    const nextStatus = location.status === "active" ? "inactive" : "active";
    dispatch(updateLocationStatus({ id: location.id, status: nextStatus }));
    toast.success(`${location.name} marked ${nextStatus}`);
  }

  function handleDelete() {
    if (childCount(deleteTarget.id) > 0) {
      toast.error(`Remove ${deleteTarget.name}'s child entries first`);
      setDeleteTarget(null);
      return;
    }
    dispatch(removeLocation(deleteTarget.id));
    toast.success(`${deleteTarget.name} deleted`);
    setDeleteTarget(null);
  }

  const columns = [
    {
      key: "name",
      header: TYPE_LABEL[currentType] ?? "Name",
      sortable: true,
      render: (row) => {
        const Icon = TYPE_ICON[row.type] ?? MapPin;
        return (
          <button
            type="button"
            onClick={() => drillInto(row)}
            disabled={row.type === "locality"}
            className="flex items-center gap-2.5 text-left disabled:cursor-default"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400">
              <Icon className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="max-w-[220px] truncate font-medium text-gray-900 hover:text-primary-600 dark:text-gray-100 dark:hover:text-primary-400">
                {row.name}
              </p>
              {row.type !== "locality" && (
                <p className="text-xs text-gray-400">
                  {formatCount(childCount(row.id))}{" "}
                  {childCount(row.id) === 1
                    ? TYPE_LABEL[TYPE_ORDER[TYPE_ORDER.indexOf(row.type) + 1]]?.toLowerCase()
                    : TYPE_LABEL_PLURAL[TYPE_ORDER[TYPE_ORDER.indexOf(row.type) + 1]]}
                </p>
              )}
            </div>
          </button>
        );
      },
    },
    {
      key: "propertiesCount",
      header: "Properties",
      sortable: true,
      render: (row) => formatCount(row.propertiesCount ?? 0),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (row) => <Badge variant={row.status === "active" ? "success" : "neutral"}>{row.status === "active" ? "Active" : "Inactive"}</Badge>,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Locations</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage the Country → State → City → Locality hierarchy used across listings and filters.
          </p>
        </div>
        <Button icon={Plus} onClick={openAdd}>
          Add {TYPE_LABEL[currentType]}
        </Button>
      </div>

      <Card>
        <div className="flex flex-wrap items-center gap-1.5 text-sm">
          <button
            onClick={() => goToDepth(0)}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 font-medium transition-colors ${
              path.length === 0
                ? "bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400"
                : "text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
            }`}
          >
            <Building className="h-3.5 w-3.5" />
            All Locations
          </button>
          {path.map((p, idx) => (
            <span key={p.id} className="flex items-center gap-1.5">
              <ChevronRight className="h-3.5 w-3.5 text-gray-300 dark:text-gray-600" />
              <button
                onClick={() => goToDepth(idx + 1)}
                className={`rounded-lg px-2.5 py-1.5 font-medium transition-colors ${
                  idx === path.length - 1
                    ? "bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400"
                    : "text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                }`}
              >
                {p.name}
              </button>
            </span>
          ))}
        </div>
      </Card>

      <Table
        columns={columns}
        data={children}
        emptyTitle={`No ${TYPE_LABEL[currentType]?.toLowerCase()}s yet`}
        emptyDescription={`Add the first ${TYPE_LABEL[currentType]?.toLowerCase()} under ${currentParent ? currentParent.name : "the platform"}.`}
        rowActions={(row) => (
          <>
            <button
              onClick={() => openEdit(row)}
              className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-primary-600 dark:hover:bg-gray-800"
              aria-label={`Edit ${row.name}`}
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => handleToggleStatus(row)}
              className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:bg-warning/10 hover:text-amber-600"
              aria-label={`Toggle status for ${row.name}`}
            >
              <Power className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setDeleteTarget(row)}
              className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:bg-danger/10 hover:text-danger"
              aria-label={`Delete ${row.name}`}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </>
        )}
      />

      <LocationFormModal
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={editingLocation}
        levelType={editingLocation ? editingLocation.type : currentType}
        parentLabel={currentParent?.name}
        submitting={busy}
      />

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title={`Delete ${deleteTarget?.name}?`}
        description="This will permanently remove this entry. This action cannot be undone."
        confirmLabel="Delete"
      />
    </div>
  );
}
