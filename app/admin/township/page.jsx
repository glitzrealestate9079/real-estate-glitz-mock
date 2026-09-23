"use client";

import { useState } from "react";
import {
  ArrowDown,
  ArrowLeftRight,
  ArrowUp,
  Building2,
  Eye,
  FolderPlus,
  Landmark,
  Layers,
  MapPin,
  MousePointerClick,
  Pencil,
  Plus,
  Settings2,
  Star,
  Trash2,
} from "lucide-react";
import toast from "react-hot-toast";
import { cn } from "@/utils/cn";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Table from "@/components/ui/Table";
import Select from "@/components/ui/Select";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import Tooltip from "@/components/ui/Tooltip";
import TownshipFormModal from "@/components/township/TownshipFormModal";
import PhaseFormModal from "@/components/township/PhaseFormModal";
import ConversionRatesFormModal from "@/components/township/ConversionRatesFormModal";
import { useAppDispatch, useAppSelector } from "@/hooks/useReduxHooks";
import { addTownship, removeTownship, removeTownships, updateConversionRates, updateTownship } from "@/redux/slices/townshipSlice";
import { UNITS, UNIT_LABEL, convertArea, formatArea } from "@/lib/unitConversion";
import { formatCount } from "@/utils/format";

const TYPE_ICON = { Residential: Building2, Commercial: Landmark, "Mixed-Use": Layers };

const TOWNSHIP_STATUS_BADGE = {
  planning: { variant: "warning", label: "Planning" },
  active: { variant: "success", label: "Active" },
  completed: { variant: "neutral", label: "Completed" },
};

const PHASE_STATUS_BADGE = {
  planned: { variant: "warning", label: "Planned" },
  under_construction: { variant: "info", label: "Under Construction" },
  completed: { variant: "success", label: "Completed" },
};

const TABS = [
  { key: "townships", label: "Townships", icon: Building2 },
  { key: "conversion", label: "Unit Conversion", icon: ArrowLeftRight },
];

export default function TownshipPage() {
  const [tab, setTab] = useState("townships");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Township Management</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Master townships with linked sub-projects, and the unit-conversion master table.
        </p>
      </div>

      <div className="inline-flex flex-wrap gap-1.5 rounded-lg border border-gray-200 bg-gray-50 p-1 dark:border-gray-700 dark:bg-gray-900">
        {TABS.map((t) => {
          const Icon = t.icon;
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-md px-3.5 py-1.5 text-sm font-medium transition-colors",
                active
                  ? "bg-white text-primary-600 shadow-sm dark:bg-gray-800 dark:text-primary-400"
                  : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              )}
            >
              <Icon className="h-4 w-4" />
              {t.label}
            </button>
          );
        })}
      </div>

      {tab === "townships" && <TownshipsTab />}
      {tab === "conversion" && <ConversionTab />}
    </div>
  );
}

function TownshipsTab() {
  const dispatch = useAppDispatch();
  const items = useAppSelector((state) => state.township.townships);
  const conversionRates = useAppSelector((state) => state.township.conversionRates);

  const [displayUnit, setDisplayUnit] = useState("acre");
  const [displayState, setDisplayState] = useState("Haryana");
  const [selectedIds, setSelectedIds] = useState([]);

  const [townshipFormOpen, setTownshipFormOpen] = useState(false);
  const [editingTownship, setEditingTownship] = useState(null);
  const [viewingId, setViewingId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [busy, setBusy] = useState(false);

  const [phaseFormOpen, setPhaseFormOpen] = useState(false);
  const [phaseFormTownshipId, setPhaseFormTownshipId] = useState(null);
  const [editingPhase, setEditingPhase] = useState(null);
  const [deletePhaseTarget, setDeletePhaseTarget] = useState(null);

  const viewing = items.find((t) => t.id === viewingId) ?? null;

  function displayArea(value, unit) {
    const converted = convertArea(value, unit, displayUnit, conversionRates, displayState);
    return `${formatArea(converted, displayUnit)} ${UNIT_LABEL[displayUnit]}`;
  }

  function openAddTownship() {
    setEditingTownship(null);
    setTownshipFormOpen(true);
  }

  function handleTownshipSubmit(values) {
    setBusy(true);
    setTimeout(() => {
      if (editingTownship) {
        dispatch(updateTownship({ id: editingTownship.id, ...values }));
        toast.success(`${values.name} updated`);
      } else {
        const newId = `TWN-${Math.floor(100 + Math.random() * 899)}`;
        dispatch(addTownship({ id: newId, ...values, phases: [] }));
        toast.success(`${values.name} created`);
      }
      setBusy(false);
      setTownshipFormOpen(false);
      setEditingTownship(null);
    }, 400);
  }

  function handleDeleteTownship() {
    dispatch(removeTownship(deleteTarget.id));
    toast.success(`${deleteTarget.name} deleted`);
    setDeleteTarget(null);
  }

  function handleBulkDelete() {
    dispatch(removeTownships(selectedIds));
    toast.success(`${selectedIds.length} townships deleted`);
    setSelectedIds([]);
  }

  function openAddPhase(townshipId) {
    setPhaseFormTownshipId(townshipId);
    setEditingPhase(null);
    setPhaseFormOpen(true);
    setViewingId(null);
  }

  function openEditPhase(township, phase) {
    setPhaseFormTownshipId(township.id);
    setEditingPhase(phase);
    setPhaseFormOpen(true);
    setViewingId(null);
  }

  function handlePhaseSubmit(values) {
    setBusy(true);
    setTimeout(() => {
      const township = items.find((t) => t.id === phaseFormTownshipId);
      if (editingPhase) {
        const newPhases = township.phases.map((p) => (p.id === editingPhase.id ? { ...p, ...values } : p));
        dispatch(updateTownship({ id: township.id, phases: newPhases }));
        toast.success(`${values.name} updated`);
      } else {
        const newId = `PH-${Math.floor(10 + Math.random() * 89)}`;
        dispatch(updateTownship({ id: township.id, phases: [{ id: newId, ...values }, ...township.phases] }));
        toast.success(`${values.name} linked to ${township.name}`);
      }
      setBusy(false);
      setPhaseFormOpen(false);
      setEditingPhase(null);
      setPhaseFormTownshipId(null);
    }, 400);
  }

  function handleDeletePhase() {
    const { township, phase } = deletePhaseTarget;
    const newPhases = township.phases.filter((p) => p.id !== phase.id);
    dispatch(updateTownship({ id: township.id, phases: newPhases }));
    toast.success(`${phase.name} unlinked`);
    setDeletePhaseTarget(null);
  }

  function handleMovePhase(township, index, direction) {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= township.phases.length) return;
    const newPhases = [...township.phases];
    [newPhases[index], newPhases[newIndex]] = [newPhases[newIndex], newPhases[index]];
    dispatch(updateTownship({ id: township.id, phases: newPhases }));
  }

  function handleToggleFeature(township, phase) {
    const newPhases = township.phases.map((p) => (p.id === phase.id ? { ...p, featured: !p.featured } : p));
    dispatch(updateTownship({ id: township.id, phases: newPhases }));
    toast.success(`${phase.name} ${phase.featured ? "unfeatured" : "featured"}`);
  }

  const columns = [
    {
      key: "name",
      header: "Township",
      sortable: true,
      render: (row) => (
        <div className="min-w-0">
          <p className="max-w-[220px] truncate font-medium text-gray-900 dark:text-gray-100">{row.name}</p>
          <p className="text-xs text-gray-400">{row.id}</p>
        </div>
      ),
    },
    { key: "reraUmbrellaNo", header: "RERA Umbrella No." },
    { key: "location", header: "Location", sortable: true },
    { key: "totalAreaValue", header: "Total Area", render: (row) => displayArea(row.totalAreaValue, row.totalAreaUnit), searchable: false },
    { key: "phases", header: "Phases", render: (row) => formatCount(row.phases.length), searchable: false },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (row) => {
        const s = TOWNSHIP_STATUS_BADGE[row.status] ?? TOWNSHIP_STATUS_BADGE.planning;
        return <Badge variant={s.variant}>{s.label}</Badge>;
      },
    },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex flex-wrap items-end gap-3">
          <Select label="Display Unit (global)" className="w-48" containerClassName="w-48" value={displayUnit} onChange={(e) => setDisplayUnit(e.target.value)}>
            {UNITS.map((u) => (
              <option key={u.value} value={u.value}>
                {u.label}
              </option>
            ))}
          </Select>
          {displayUnit === "bigha" && (
            <Select label="Bigha State" className="w-44" containerClassName="w-44" value={displayState} onChange={(e) => setDisplayState(e.target.value)}>
              {Object.keys(conversionRates.bighaByState).map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </Select>
          )}
          <p className="text-xs text-gray-400">All area figures below are converted live into the selected unit.</p>
          <div className="ml-auto flex items-center gap-2">
            {selectedIds.length > 0 && (
              <div className="flex items-center gap-2 rounded-lg bg-primary-50 px-3 py-2 dark:bg-primary-500/10">
                <span className="text-xs font-medium text-primary-700 dark:text-primary-300">{selectedIds.length} selected</span>
                <Button size="sm" variant="outline" icon={Trash2} onClick={handleBulkDelete}>
                  Delete
                </Button>
              </div>
            )}
            <Button icon={Plus} onClick={openAddTownship}>
              Create Township
            </Button>
          </div>
        </div>
      </Card>

      <Table
        columns={columns}
        data={items}
        selectable
        selectedIds={selectedIds}
        onSelectedIdsChange={setSelectedIds}
        emptyTitle="No townships yet"
        rowActions={(row) => (
          <>
            <Tooltip content="View township" side="top">
              <button onClick={() => setViewingId(row.id)} className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800" aria-label="View township">
                <Eye className="h-3.5 w-3.5" />
              </button>
            </Tooltip>
            <Tooltip content="Edit township" side="top">
              <button
                onClick={() => {
                  setEditingTownship(row);
                  setTownshipFormOpen(true);
                }}
                className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-primary-600 dark:hover:bg-gray-800"
                aria-label="Edit township"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
            </Tooltip>
            <Tooltip content="Link phase" side="top">
              <button onClick={() => openAddPhase(row.id)} className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:bg-primary-50 hover:text-primary-600 dark:hover:bg-gray-800" aria-label="Link phase">
                <FolderPlus className="h-3.5 w-3.5" />
              </button>
            </Tooltip>
            <Tooltip content="Delete township" side="top">
              <button onClick={() => setDeleteTarget(row)} className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:bg-danger/10 hover:text-danger" aria-label="Delete township">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </Tooltip>
          </>
        )}
      />

      <TownshipFormModal isOpen={townshipFormOpen} onClose={() => setTownshipFormOpen(false)} onSubmit={handleTownshipSubmit} initialData={editingTownship} submitting={busy} />

      <PhaseFormModal
        isOpen={phaseFormOpen}
        onClose={() => {
          setPhaseFormOpen(false);
          setEditingPhase(null);
        }}
        onSubmit={handlePhaseSubmit}
        initialData={editingPhase}
        submitting={busy}
      />

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteTownship}
        title={`Delete ${deleteTarget?.name}?`}
        description="This will permanently remove the township and all linked phases."
        confirmLabel="Delete"
      />

      <ConfirmDialog
        isOpen={Boolean(deletePhaseTarget)}
        onClose={() => setDeletePhaseTarget(null)}
        onConfirm={handleDeletePhase}
        title={`Unlink ${deletePhaseTarget?.phase?.name}?`}
        description="This will remove the phase from the township."
        confirmLabel="Unlink"
      />

      <Modal isOpen={Boolean(viewing)} onClose={() => setViewingId(null)} size="xl" title={viewing?.name} description={viewing ? `${viewing.id} — ${viewing.reraUmbrellaNo}` : ""}>
        {viewing && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <InfoField label="Location" value={viewing.location} icon={MapPin} />
              <InfoField label="Total Area" value={displayArea(viewing.totalAreaValue, viewing.totalAreaUnit)} />
              <InfoField label="Phases" value={formatCount(viewing.phases.length)} />
              <InfoField label="Status" value={<Badge variant={TOWNSHIP_STATUS_BADGE[viewing.status]?.variant}>{TOWNSHIP_STATUS_BADGE[viewing.status]?.label}</Badge>} />
              <InfoField label="Combined Views" value={formatCount(viewing.phases.reduce((s, p) => s + (p.views ?? 0), 0))} icon={Eye} />
              <InfoField label="Combined Leads" value={formatCount(viewing.phases.reduce((s, p) => s + (p.leads ?? 0), 0))} icon={MousePointerClick} />
            </div>
            <InfoField label="Masterplan File" value={viewing.masterPlanLabel} />

            <div>
              <div className="mb-2 flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Linked Phases — combined {formatCount(viewing.phases.reduce((s, p) => s + p.totalUnits, 0))} units</p>
                <Button size="sm" variant="outline" icon={FolderPlus} onClick={() => openAddPhase(viewing.id)}>
                  Link Phase
                </Button>
              </div>

              {viewing.phases.length === 0 ? (
                <p className="rounded-lg bg-gray-50 p-4 text-center text-sm text-gray-500 dark:bg-gray-800 dark:text-gray-400">No phases linked yet.</p>
              ) : (
                <div className="space-y-2">
                  {viewing.phases.map((phase, index) => {
                    const Icon = TYPE_ICON[phase.type] ?? Building2;
                    const s = PHASE_STATUS_BADGE[phase.status] ?? PHASE_STATUS_BADGE.planned;
                    return (
                      <div key={phase.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-100 p-3 dark:border-gray-800">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400">
                            <Icon className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="flex items-center gap-1.5 font-medium text-gray-900 dark:text-gray-100">
                              {phase.featured && <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />}
                              {phase.name}
                            </p>
                            <p className="text-xs text-gray-400">
                              {phase.id} — {phase.type} — {displayArea(phase.areaValue, phase.areaUnit)} — {formatCount(phase.totalUnits)} units — Launch {phase.launchDate}
                            </p>
                            <p className="text-xs text-gray-400">
                              {formatCount(phase.views ?? 0)} views — {formatCount(phase.leads ?? 0)} leads
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Badge variant={s.variant}>{s.label}</Badge>
                          <Tooltip content="Move phase up" side="top">
                            <button
                              onClick={() => handleMovePhase(viewing, index, -1)}
                              disabled={index === 0}
                              className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-primary-600 disabled:opacity-30 dark:hover:bg-gray-800"
                              aria-label="Move phase up"
                            >
                              <ArrowUp className="h-3.5 w-3.5" />
                            </button>
                          </Tooltip>
                          <Tooltip content="Move phase down" side="top">
                            <button
                              onClick={() => handleMovePhase(viewing, index, 1)}
                              disabled={index === viewing.phases.length - 1}
                              className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-primary-600 disabled:opacity-30 dark:hover:bg-gray-800"
                              aria-label="Move phase down"
                            >
                              <ArrowDown className="h-3.5 w-3.5" />
                            </button>
                          </Tooltip>
                          <Tooltip content={phase.featured ? "Unfeature phase" : "Feature phase"} side="top">
                            <button
                              onClick={() => handleToggleFeature(viewing, phase)}
                              className={cn(
                                "flex h-7 w-7 items-center justify-center rounded-md hover:bg-gray-100 dark:hover:bg-gray-800",
                                phase.featured ? "text-amber-400" : "text-gray-400 hover:text-amber-400"
                              )}
                              aria-label={phase.featured ? "Unfeature phase" : "Feature phase"}
                            >
                              <Star className={cn("h-3.5 w-3.5", phase.featured && "fill-amber-400")} />
                            </button>
                          </Tooltip>
                          <Tooltip content="Edit phase" side="top">
                            <button onClick={() => openEditPhase(viewing, phase)} className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-primary-600 dark:hover:bg-gray-800" aria-label="Edit phase">
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                          </Tooltip>
                          <Tooltip content="Unlink phase" side="top">
                            <button
                              onClick={() => {
                                setDeletePhaseTarget({ township: viewing, phase });
                                setViewingId(null);
                              }}
                              className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:bg-danger/10 hover:text-danger"
                              aria-label="Unlink phase"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </Tooltip>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

function ConversionTab() {
  const dispatch = useAppDispatch();
  const conversionRates = useAppSelector((state) => state.township.conversionRates);
  const [ratesFormOpen, setRatesFormOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const [converterValue, setConverterValue] = useState("100");
  const [converterFrom, setConverterFrom] = useState("acre");
  const [converterState, setConverterState] = useState("Haryana");

  function handleSaveRates(values) {
    setBusy(true);
    setTimeout(() => {
      dispatch(updateConversionRates(values));
      toast.success("Conversion rates updated");
      setBusy(false);
      setRatesFormOpen(false);
    }, 400);
  }

  const numericValue = parseFloat(converterValue);

  return (
    <div className="space-y-6">
      <Card
        title="Unit Conversion Master Table"
        description="1 unit converted into Sq. Ft, the base unit"
        action={
          <Button size="sm" variant="outline" icon={Settings2} onClick={() => setRatesFormOpen(true)}>
            Edit Rates
          </Button>
        }
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {["sqyd_gaj", "sqm", "acre"].map((unit) => (
            <div key={unit} className="rounded-xl border border-gray-100 p-4 dark:border-gray-800">
              <p className="text-xs text-gray-400">1 {UNIT_LABEL[unit]}</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{formatArea(conversionRates.rates[unit], "sqft")} Sq. Ft</p>
            </div>
          ))}
        </div>

        <div className="mt-5 border-t border-gray-100 pt-4 dark:border-gray-800">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">Bigha, by State</p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {Object.entries(conversionRates.bighaByState).map(([state, sqft]) => (
              <div key={state} className="rounded-xl border border-gray-100 p-3 dark:border-gray-800">
                <p className="text-xs text-gray-400">{state}</p>
                <p className="font-semibold text-gray-900 dark:text-gray-100">{formatArea(sqft, "sqft")} Sq. Ft</p>
              </div>
            ))}
          </div>
        </div>
      </Card>

      <Card title="Live Unit Converter" description="Enter a value to see it converted into every unit instantly">
        <div className="flex flex-wrap items-end gap-3">
          <Input label="Value" type="number" className="w-32" containerClassName="w-32" value={converterValue} onChange={(e) => setConverterValue(e.target.value)} />
          <Select label="From Unit" className="w-44" containerClassName="w-44" value={converterFrom} onChange={(e) => setConverterFrom(e.target.value)}>
            {UNITS.map((u) => (
              <option key={u.value} value={u.value}>
                {u.label}
              </option>
            ))}
          </Select>
          {converterFrom === "bigha" && (
            <Select label="State" className="w-40" containerClassName="w-40" value={converterState} onChange={(e) => setConverterState(e.target.value)}>
              {Object.keys(conversionRates.bighaByState).map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </Select>
          )}
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-5">
          {UNITS.map((u) => {
            const converted = convertArea(numericValue, converterFrom, u.value, conversionRates, converterState);
            return (
              <div key={u.value} className={cn("rounded-xl border p-3", u.value === converterFrom ? "border-primary-200 bg-primary-50 dark:border-primary-500/30 dark:bg-primary-500/10" : "border-gray-100 dark:border-gray-800")}>
                <p className="text-xs text-gray-400">{u.label}</p>
                <p className="font-semibold text-gray-900 dark:text-gray-100">{formatArea(converted, u.value)}</p>
              </div>
            );
          })}
        </div>
        {converterFrom === "bigha" && <p className="mt-2 text-xs text-gray-400">Using the {converterState} Bigha rate.</p>}
      </Card>

      <ConversionRatesFormModal isOpen={ratesFormOpen} onClose={() => setRatesFormOpen(false)} onSubmit={handleSaveRates} conversionRates={conversionRates} submitting={busy} />
    </div>
  );
}

function InfoField({ label, value, icon: Icon }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wide text-gray-400">{label}</p>
      <p className="flex items-center gap-1 break-words text-sm font-medium text-gray-800 dark:text-gray-200">
        {Icon && <Icon className="h-3.5 w-3.5 text-gray-400" />}
        {value}
      </p>
    </div>
  );
}
