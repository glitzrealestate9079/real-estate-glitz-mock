"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import {
  Building2,
  Check,
  Eye,
  FileCheck,
  FileX,
  FolderKanban,
  FolderPlus,
  Home,
  Layers,
  MessageSquareText,
  Pencil,
  Plus,
  Power,
  Trees,
  Trash2,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import { cn } from "@/utils/cn";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Table from "@/components/ui/Table";
import Select from "@/components/ui/Select";
import Modal from "@/components/ui/Modal";
import StatCard from "@/components/ui/StatCard";
import Avatar from "@/components/ui/Avatar";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import ReasonModal from "@/components/ui/ReasonModal";
import BuilderFormModal from "@/components/builders/BuilderFormModal";
import ProjectFormModal from "@/components/builders/ProjectFormModal";
import { useAppDispatch, useAppSelector } from "@/hooks/useReduxHooks";
import { addBuilder, removeBuilder, removeBuilders, updateBuilder } from "@/redux/slices/buildersSlice";
import { formatCount } from "@/utils/format";

const LIVE_PROJECT_STATUSES = ["approved", "under_construction", "completed"];

const TYPE_ICON = { Residential: Home, Commercial: Building2, Township: Trees, "Mixed-Use": Layers };

const BUILDER_STATUS_BADGE = {
  active: { variant: "success", label: "Active" },
  suspended: { variant: "danger", label: "Suspended" },
};

const PROJECT_STATUS_BADGE = {
  pending_approval: { variant: "warning", label: "Pending Approval" },
  approved: { variant: "info", label: "Approved" },
  under_construction: { variant: "info", label: "Under Construction" },
  completed: { variant: "success", label: "Completed" },
  rejected: { variant: "danger", label: "Rejected" },
};

export default function BuildersPage() {
  const dispatch = useAppDispatch();
  const items = useAppSelector((state) => state.builders.items);
  const leads = useAppSelector((state) => state.leads.items);

  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedIds, setSelectedIds] = useState([]);

  const [builderFormOpen, setBuilderFormOpen] = useState(false);
  const [editingBuilder, setEditingBuilder] = useState(null);
  const [viewingBuilderId, setViewingBuilderId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [busy, setBusy] = useState(false);

  const [projectFormOpen, setProjectFormOpen] = useState(false);
  const [projectFormBuilderId, setProjectFormBuilderId] = useState(null);
  const [editingProject, setEditingProject] = useState(null);
  const [rejectProjectTarget, setRejectProjectTarget] = useState(null);
  const [deleteProjectTarget, setDeleteProjectTarget] = useState(null);

  // `slug` is the same postedBy/assignedTo username convention Listings and Leads already use
  // (see agentsSlice for the same pattern) — only builders that actually posted something under
  // that slug show non-zero leads/units-sold-via-leads, which is honest for mock data rather than
  // a stored count that could drift.
  const enriched = useMemo(() => {
    return items.map((builder) => {
      const builderLeads = builder.slug ? leads.filter((l) => l.assignedTo === builder.slug) : [];
      const totalUnits = builder.projects.reduce((sum, p) => sum + p.totalUnits, 0);
      return { ...builder, builderLeads, totalUnits };
    });
  }, [items, leads]);

  const filtered = useMemo(
    () => (statusFilter === "all" ? enriched : enriched.filter((b) => b.status === statusFilter)),
    [enriched, statusFilter]
  );

  const allProjects = useMemo(() => items.flatMap((b) => b.projects), [items]);
  const projectStats = useMemo(() => {
    const live = allProjects.filter((p) => LIVE_PROJECT_STATUSES.includes(p.status));
    const unitsAvailable = live.reduce((sum, p) => sum + p.unitsAvailable, 0);
    const unitsSold = live.reduce((sum, p) => sum + (p.totalUnits - p.unitsAvailable), 0);
    return {
      total: allProjects.length,
      active: allProjects.filter((p) => p.status === "approved" || p.status === "under_construction").length,
      unitsAvailable,
      unitsSold,
    };
  }, [allProjects]);

  // Derived from `enriched` (not a snapshot) so the still-open modal reflects live updates —
  // e.g. approving a project updates its badge in place instead of showing stale data.
  const viewingBuilder = useMemo(() => enriched.find((b) => b.id === viewingBuilderId) ?? null, [enriched, viewingBuilderId]);

  function openAddBuilder() {
    setEditingBuilder(null);
    setBuilderFormOpen(true);
  }

  function openEditBuilder(builder) {
    setEditingBuilder(builder);
    setBuilderFormOpen(true);
  }

  function handleBuilderSubmit(values) {
    setBusy(true);
    setTimeout(() => {
      if (editingBuilder) {
        dispatch(updateBuilder({ id: editingBuilder.id, ...values }));
        toast.success(`${values.name} updated`);
      } else {
        const newId = `BLD-${Math.floor(100 + Math.random() * 899)}`;
        dispatch(addBuilder({ id: newId, ...values, status: "active", projects: [] }));
        toast.success(`${values.name} added`);
      }
      setBusy(false);
      setBuilderFormOpen(false);
      setEditingBuilder(null);
    }, 400);
  }

  function handleToggleBuilderStatus(builder) {
    const next = builder.status === "active" ? "suspended" : "active";
    dispatch(updateBuilder({ id: builder.id, status: next }));
    toast.success(`${builder.name} ${next === "active" ? "activated" : "suspended"}`);
  }

  function handleDeleteBuilder() {
    dispatch(removeBuilder(deleteTarget.id));
    toast.success(`${deleteTarget.name} deleted`);
    setDeleteTarget(null);
  }

  function handleBulkDelete() {
    dispatch(removeBuilders(selectedIds));
    toast.success(`${selectedIds.length} builders deleted`);
    setSelectedIds([]);
  }

  function openAddProject(builderId) {
    setProjectFormBuilderId(builderId);
    setEditingProject(null);
    setProjectFormOpen(true);
    setViewingBuilderId(null);
  }

  function openEditProject(builder, project) {
    setProjectFormBuilderId(builder.id);
    setEditingProject(project);
    setProjectFormOpen(true);
    setViewingBuilderId(null);
  }

  function handleProjectSubmit(values) {
    setBusy(true);
    setTimeout(() => {
      const builder = items.find((b) => b.id === projectFormBuilderId);
      if (editingProject) {
        const newProjects = builder.projects.map((p) => (p.id === editingProject.id ? { ...p, ...values } : p));
        dispatch(updateBuilder({ id: builder.id, projects: newProjects }));
        toast.success(`${values.name} updated`);
      } else {
        const newId = `PRJ-${Math.floor(100 + Math.random() * 899)}`;
        const newProject = { id: newId, ...values, status: "pending_approval" };
        dispatch(updateBuilder({ id: builder.id, projects: [newProject, ...builder.projects] }));
        toast.success(`${values.name} submitted for launch approval`);
      }
      setBusy(false);
      setProjectFormOpen(false);
      setEditingProject(null);
      setProjectFormBuilderId(null);
    }, 400);
  }

  function handleApproveProject(builder, project) {
    const newProjects = builder.projects.map((p) => (p.id === project.id ? { ...p, status: "approved" } : p));
    dispatch(updateBuilder({ id: builder.id, projects: newProjects }));
    toast.success(`${project.name} approved for launch`);
  }

  function handleRejectProject(reason) {
    const { builder, project } = rejectProjectTarget;
    const newProjects = builder.projects.map((p) => (p.id === project.id ? { ...p, status: "rejected", rejectionReason: reason } : p));
    dispatch(updateBuilder({ id: builder.id, projects: newProjects }));
    toast.success(`${project.name} rejected`);
    setRejectProjectTarget(null);
  }

  function handleDeleteProject() {
    const { builder, project } = deleteProjectTarget;
    const newProjects = builder.projects.filter((p) => p.id !== project.id);
    dispatch(updateBuilder({ id: builder.id, projects: newProjects }));
    toast.success(`${project.name} deleted`);
    setDeleteProjectTarget(null);
  }

  const columns = [
    {
      key: "name",
      header: "Builder",
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-2.5">
          <Avatar name={row.name} variant="flat" size="sm" />
          <div className="min-w-0">
            <p className="max-w-[220px] truncate font-medium text-gray-900 dark:text-gray-100">{row.name}</p>
            <p className="text-xs text-gray-400">{row.id}</p>
          </div>
        </div>
      ),
    },
    { key: "reraNumber", header: "RERA Number" },
    { key: "city", header: "City", sortable: true },
    { key: "projects", header: "Projects", render: (row) => formatCount(row.projects.length), searchable: false },
    { key: "totalUnits", header: "Total Units", sortable: true, searchable: false, render: (row) => formatCount(row.totalUnits) },
    {
      key: "builderLeads",
      header: "Leads",
      searchable: false,
      render: (row) => (
        <span className="inline-flex items-center gap-1 text-gray-500 dark:text-gray-400">
          <MessageSquareText className="h-3.5 w-3.5" />
          {formatCount(row.builderLeads.length)}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (row) => {
        const s = BUILDER_STATUS_BADGE[row.status] ?? BUILDER_STATUS_BADGE.active;
        return <Badge variant={s.variant}>{s.label}</Badge>;
      },
    },
    { key: "createdDate", header: "Created", sortable: true },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Builder / Project Management</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Builder profiles, project micro-sites, construction timelines and new-launch approval.
          </p>
        </div>
        <Button icon={Plus} onClick={openAddBuilder}>
          Add Builder
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={FolderKanban} label="Total Projects" value={formatCount(projectStats.total)} />
        <StatCard icon={Building2} label="Active Projects" value={formatCount(projectStats.active)} />
        <StatCard icon={Home} label="Units Available" value={formatCount(projectStats.unitsAvailable)} />
        <StatCard icon={Check} label="Units Sold" value={formatCount(projectStats.unitsSold)} />
      </div>

      <Card>
        <div className="flex flex-wrap items-end gap-3">
          <Select label="Status" className="w-40" containerClassName="w-40" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
          </Select>
          {selectedIds.length > 0 && (
            <div className="ml-auto flex items-center gap-2 rounded-lg bg-primary-50 px-3 py-2 dark:bg-primary-500/10">
              <span className="text-xs font-medium text-primary-700 dark:text-primary-300">{selectedIds.length} selected</span>
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
        emptyTitle="No builders match this filter"
        rowActions={(row) => (
          <>
            <button onClick={() => setViewingBuilderId(row.id)} className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800" aria-label="View builder">
              <Eye className="h-3.5 w-3.5" />
            </button>
            <button onClick={() => openEditBuilder(row)} className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-primary-600 dark:hover:bg-gray-800" aria-label="Edit builder">
              <Pencil className="h-3.5 w-3.5" />
            </button>
            <button onClick={() => openAddProject(row.id)} className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:bg-primary-50 hover:text-primary-600 dark:hover:bg-gray-800" aria-label="Add project">
              <FolderPlus className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => handleToggleBuilderStatus(row)}
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800",
                row.status === "active" ? "hover:text-danger" : "hover:text-success"
              )}
              aria-label={row.status === "active" ? "Suspend builder" : "Activate builder"}
            >
              <Power className="h-3.5 w-3.5" />
            </button>
            <button onClick={() => setDeleteTarget(row)} className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:bg-danger/10 hover:text-danger" aria-label="Delete builder">
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </>
        )}
      />

      <BuilderFormModal isOpen={builderFormOpen} onClose={() => setBuilderFormOpen(false)} onSubmit={handleBuilderSubmit} initialData={editingBuilder} submitting={busy} />

      <ProjectFormModal
        isOpen={projectFormOpen}
        onClose={() => {
          setProjectFormOpen(false);
          setEditingProject(null);
        }}
        onSubmit={handleProjectSubmit}
        initialData={editingProject}
        submitting={busy}
      />

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteBuilder}
        title={`Delete ${deleteTarget?.name}?`}
        description="This will permanently remove the builder profile and all of its projects."
        confirmLabel="Delete"
      />

      <ConfirmDialog
        isOpen={Boolean(deleteProjectTarget)}
        onClose={() => setDeleteProjectTarget(null)}
        onConfirm={handleDeleteProject}
        title={`Delete ${deleteProjectTarget?.project?.name}?`}
        description="This will permanently remove the project from the builder's profile."
        confirmLabel="Delete"
      />

      <ReasonModal
        isOpen={Boolean(rejectProjectTarget)}
        onClose={() => setRejectProjectTarget(null)}
        onConfirm={handleRejectProject}
        title={`Reject ${rejectProjectTarget?.project?.name}?`}
        description="The builder will see this reason and can resubmit the project for approval."
        confirmLabel="Reject Project"
        placeholder="e.g. RERA registration for this phase has expired"
      />

      {/* Builder profile + nested projects / construction timeline / launch approval, per Section 4.6 */}
      <Modal
        isOpen={Boolean(viewingBuilder)}
        onClose={() => setViewingBuilderId(null)}
        size="xl"
        title={viewingBuilder?.name}
        description={viewingBuilder ? `${viewingBuilder.id} — ${viewingBuilder.reraNumber}` : ""}
      >
        {viewingBuilder && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <InfoField label="City" value={viewingBuilder.city} />
              <InfoField label="Established" value={viewingBuilder.establishedYear} />
              <InfoField label="Onboarded" value={viewingBuilder.createdDate} />
              <InfoField
                label="Status"
                value={<Badge variant={BUILDER_STATUS_BADGE[viewingBuilder.status]?.variant}>{BUILDER_STATUS_BADGE[viewingBuilder.status]?.label}</Badge>}
              />
              <InfoField label="Total Units" value={formatCount(viewingBuilder.totalUnits)} />
              <InfoField label="Leads" value={formatCount(viewingBuilder.builderLeads.length)} />
            </div>

            {viewingBuilder.documents?.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">Documents</p>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {viewingBuilder.documents.map((doc) => (
                    <div
                      key={doc.label}
                      className="flex items-center gap-2 rounded-lg border border-gray-100 px-3 py-2 text-sm dark:border-gray-800"
                    >
                      {doc.verified ? (
                        <FileCheck className="h-4 w-4 shrink-0 text-success" />
                      ) : (
                        <FileX className="h-4 w-4 shrink-0 text-warning" />
                      )}
                      <span className="min-w-0 flex-1 truncate text-gray-700 dark:text-gray-300">{doc.label}</span>
                      <Badge variant={doc.verified ? "success" : "warning"} dot={false}>
                        {doc.verified ? "Verified" : "Pending"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <div className="mb-2 flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Projects</p>
                <Button size="sm" variant="outline" icon={FolderPlus} onClick={() => openAddProject(viewingBuilder.id)}>
                  Add Project
                </Button>
              </div>

              {viewingBuilder.projects.length === 0 ? (
                <p className="rounded-lg bg-gray-50 p-4 text-center text-sm text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                  No projects yet for this builder.
                </p>
              ) : (
                <div className="space-y-3">
                  {viewingBuilder.projects.map((project) => {
                    const Icon = TYPE_ICON[project.type] ?? Building2;
                    const s = PROJECT_STATUS_BADGE[project.status] ?? PROJECT_STATUS_BADGE.pending_approval;
                    return (
                      <div key={project.id} className="rounded-xl border border-gray-100 p-4 dark:border-gray-800">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="flex items-start gap-2.5">
                            <div className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400">
                              {project.image ? (
                                <Image src={project.image} alt="" fill sizes="36px" className="object-cover" />
                              ) : (
                                <Icon className="h-4 w-4" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 dark:text-gray-100">{project.name}</p>
                              <p className="text-xs text-gray-400">
                                {project.id} — {project.type} — {project.location}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <Badge variant={s.variant}>{s.label}</Badge>
                            <button onClick={() => openEditProject(viewingBuilder, project)} className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-primary-600 dark:hover:bg-gray-800" aria-label="Edit project">
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                            {project.status === "pending_approval" && (
                              <>
                                <button
                                  onClick={() => handleApproveProject(viewingBuilder, project)}
                                  className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:bg-success/10 hover:text-success"
                                  aria-label="Approve project"
                                >
                                  <Check className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  onClick={() => {
                                    setRejectProjectTarget({ builder: viewingBuilder, project });
                                    setViewingBuilderId(null);
                                  }}
                                  className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:bg-danger/10 hover:text-danger"
                                  aria-label="Reject project"
                                >
                                  <X className="h-3.5 w-3.5" />
                                </button>
                              </>
                            )}
                            <button
                              onClick={() => {
                                setDeleteProjectTarget({ builder: viewingBuilder, project });
                                setViewingBuilderId(null);
                              }}
                              className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:bg-danger/10 hover:text-danger"
                              aria-label="Delete project"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>

                        {project.rejectionReason && (
                          <p className="mt-2 rounded-lg bg-danger/10 p-2 text-xs text-danger">{project.rejectionReason}</p>
                        )}

                        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                          <InfoField label="Launch" value={project.launchDate} />
                          <InfoField label="Possession" value={project.possessionDate} />
                          <InfoField label="Units" value={`${project.unitsAvailable} / ${project.totalUnits} available`} />
                          <InfoField label="Price Range" value={project.priceRange} />
                          <InfoField label="RERA Number" value={project.reraNumber ?? "—"} />
                          <InfoField label="Brochure / Floor Plan" value={project.brochureLabel} />
                        </div>

                        {project.amenities?.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-1.5">
                            {project.amenities.map((a) => (
                              <Badge key={a} variant="neutral" dot={false}>
                                {a}
                              </Badge>
                            ))}
                          </div>
                        )}

                        <div className="mt-3">
                          <div className="mb-1 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                            <span>{project.constructionStage}</span>
                            <span>{project.progressPercent}%</span>
                          </div>
                          <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                            <div className="h-full rounded-full bg-primary-500" style={{ width: `${project.progressPercent}%` }} />
                          </div>
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

function InfoField({ label, value }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wide text-gray-400">{label}</p>
      <p className="break-words text-sm font-medium text-gray-800 dark:text-gray-200">{value}</p>
    </div>
  );
}
