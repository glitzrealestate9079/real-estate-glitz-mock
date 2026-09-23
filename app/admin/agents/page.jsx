"use client";

import { useMemo, useState } from "react";
import {
  Building2,
  Calendar,
  Mail,
  MapPin,
  MessageSquareText,
  Pencil,
  Phone,
  Plus,
  Star,
  Target,
  Trash2,
  TrendingUp,
} from "lucide-react";
import toast from "react-hot-toast";
import Tooltip from "@/components/ui/Tooltip";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Modal from "@/components/ui/Modal";
import SegmentedControl from "@/components/ui/SegmentedControl";
import Avatar from "@/components/ui/Avatar";
import EmptyState from "@/components/ui/EmptyState";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import AgentFormModal from "@/components/agents/AgentFormModal";
import { STATUSES as LEAD_STAGES, STATUS_LABELS } from "@/components/leads/LeadFormModal";
import { useAppDispatch, useAppSelector } from "@/hooks/useReduxHooks";
import { useQuickAddParam } from "@/hooks/useQuickAddParam";
import { addAgent, removeAgent, updateAgent } from "@/redux/slices/agentsSlice";
import { formatCount, formatINR, todayISO } from "@/utils/format";

const TABS = [
  { value: "overview", label: "Overview" },
  { value: "properties", label: "Properties" },
  { value: "leads", label: "Leads" },
  { value: "visits", label: "Site Visits" },
  { value: "performance", label: "Performance" },
];

export default function AgentsPage() {
  const dispatch = useAppDispatch();
  const agents = useAppSelector((state) => state.agents.items);
  const listings = useAppSelector((state) => state.listings.items);
  const leads = useAppSelector((state) => state.leads.items);
  const siteVisits = useAppSelector((state) => state.siteVisits.items);

  const [query, setQuery] = useState("");
  const [cityFilter, setCityFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("overview");

  const [formOpen, setFormOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState(null);
  const [viewingId, setViewingId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [busy, setBusy] = useState(false);

  const cities = useMemo(() => [...new Set(agents.map((a) => a.city))].sort(), [agents]);

  const enriched = useMemo(() => {
    return agents.map((agent) => {
      const properties = agent.slug ? listings.filter((l) => l.postedBy === agent.slug) : [];
      const visits = siteVisits.filter((v) => v.agentId === agent.userId);
      const agentLeads = agent.slug ? leads.filter((l) => l.assignedTo === agent.slug) : [];
      const conversions = agentLeads.filter((l) => l.status === "converted").length;
      const conversionRate = agentLeads.length ? Math.round((conversions / agentLeads.length) * 100) : 0;
      return { ...agent, properties, visits, leads: agentLeads, conversions, conversionRate };
    });
  }, [agents, listings, leads, siteVisits]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return enriched.filter((a) => {
      if (cityFilter !== "all" && a.city !== cityFilter) return false;
      if (statusFilter !== "all" && a.status !== statusFilter) return false;
      if (q && !a.name.toLowerCase().includes(q) && !a.agency.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [enriched, query, cityFilter, statusFilter]);

  const viewingAgent = useMemo(() => enriched.find((a) => a.id === viewingId) ?? null, [enriched, viewingId]);

  function openAdd() {
    setEditingAgent(null);
    setFormOpen(true);
  }

  useQuickAddParam(openAdd);

  function openEdit(agent) {
    setEditingAgent(agent);
    setFormOpen(true);
  }

  function openProfile(agent) {
    setActiveTab("overview");
    setViewingId(agent.id);
  }

  function handleFormSubmit(values) {
    setBusy(true);
    setTimeout(() => {
      if (editingAgent) {
        dispatch(updateAgent({ id: editingAgent.id, ...values }));
        toast.success(`${values.name} updated`);
      } else {
        const newId = `AGT-${Math.floor(1000 + Math.random() * 8999)}`;
        dispatch(
          addAgent({
            id: newId,
            userId: null,
            slug: null,
            rating: 0,
            joinedDate: todayISO(),
            ...values,
          })
        );
        toast.success(`${values.name} added`);
      }
      setBusy(false);
      setFormOpen(false);
      setEditingAgent(null);
    }, 400);
  }

  function handleDelete() {
    dispatch(removeAgent(deleteTarget.id));
    toast.success(`${deleteTarget.name} removed`);
    setDeleteTarget(null);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Agents</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Business performance view — properties listed, leads worked and conversion rate per agent.
          </p>
        </div>
        <Button icon={Plus} onClick={openAdd}>
          Add Agent
        </Button>
      </div>

      <Card>
        <div className="flex flex-wrap items-end gap-3">
          <Input
            label="Search"
            placeholder="Agent or agency name"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            containerClassName="w-56"
          />
          <Select label="City" className="w-40" containerClassName="w-40" value={cityFilter} onChange={(e) => setCityFilter(e.target.value)}>
            <option value="all">All cities</option>
            {cities.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
          <Select label="Status" className="w-40" containerClassName="w-40" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </Select>
        </div>
      </Card>

      {filtered.length === 0 ? (
        <Card>
          <EmptyState title="No agents match these filters" description="Try a different city or status." />
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((agent) => (
            <Card key={agent.id} hover className="flex flex-col">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Avatar name={agent.name} size="lg" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-gray-900 dark:text-gray-100">{agent.name}</p>
                    <p className="truncate text-xs text-gray-500 dark:text-gray-400">{agent.agency}</p>
                  </div>
                </div>
                <Badge variant={agent.status === "active" ? "success" : "neutral"}>
                  {agent.status === "active" ? "Active" : "Inactive"}
                </Badge>
              </div>

              <p className="mt-3 flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                <MapPin className="h-3.5 w-3.5 shrink-0" />
                {agent.city}
                <span className="mx-1 text-gray-300 dark:text-gray-700">·</span>
                <Star className="h-3.5 w-3.5 shrink-0 fill-warning text-warning" />
                {agent.rating || "—"}
              </p>

              <div className="mt-2 flex flex-wrap gap-1.5">
                {agent.specializations.map((s) => (
                  <Badge key={s} variant="info" dot={false}>
                    {s}
                  </Badge>
                ))}
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2 rounded-xl bg-gray-50 p-3 text-center dark:bg-gray-900">
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{formatCount(agent.properties.length)}</p>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">Properties</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{formatCount(agent.leads.length)}</p>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">Leads</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{agent.conversionRate}%</p>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">Conversion</p>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2">
                <Button size="sm" variant="outline" className="flex-1" onClick={() => openProfile(agent)}>
                  View Profile
                </Button>
                <Tooltip content={`Edit ${agent.name}`} side="top">
                  <button
                    onClick={() => openEdit(agent)}
                    className="flex h-8 w-8 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-primary-600 dark:hover:bg-gray-800"
                    aria-label={`Edit ${agent.name}`}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                </Tooltip>
                <Tooltip content={`Remove ${agent.name}`} side="top">
                  <button
                    onClick={() => setDeleteTarget(agent)}
                    className="flex h-8 w-8 items-center justify-center rounded-md text-gray-400 hover:bg-danger/10 hover:text-danger"
                    aria-label={`Remove ${agent.name}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </Tooltip>
              </div>
            </Card>
          ))}
        </div>
      )}

      <AgentFormModal
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={editingAgent}
        submitting={busy}
      />

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title={`Remove ${deleteTarget?.name}?`}
        description="This removes the agent's business profile from this module. Their user account is unaffected."
        confirmLabel="Remove"
      />

      <Modal
        isOpen={Boolean(viewingAgent)}
        onClose={() => setViewingId(null)}
        size="lg"
        title={viewingAgent?.name}
        description={viewingAgent ? `${viewingAgent.agency} — ${viewingAgent.city}` : ""}
      >
        {viewingAgent && (
          <div className="space-y-4">
            <SegmentedControl options={TABS} value={activeTab} onChange={setActiveTab} />

            {activeTab === "overview" && (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <InfoField label="Email" value={viewingAgent.email} icon={Mail} />
                <InfoField label="Phone" value={viewingAgent.phone} icon={Phone} />
                <InfoField label="RERA / License Number" value={viewingAgent.reraNumber || "—"} />
                <InfoField label="Agency" value={viewingAgent.agency} />
                <InfoField label="Location" value={viewingAgent.city} icon={MapPin} />
                <InfoField label="Joined" value={viewingAgent.joinedDate} icon={Calendar} />
                <InfoField label="Rating" value={`${viewingAgent.rating || "—"} / 5`} icon={Star} />
                <InfoField
                  label="Status"
                  value={<Badge variant={viewingAgent.status === "active" ? "success" : "neutral"}>{viewingAgent.status === "active" ? "Active" : "Inactive"}</Badge>}
                />
              </div>
            )}

            {activeTab === "properties" &&
              (viewingAgent.properties.length === 0 ? (
                <EmptyState icon={Building2} title="No properties yet" description="Listings posted by this agent will appear here." />
              ) : (
                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                  {viewingAgent.properties.map((l) => (
                    <div key={l.id} className="flex items-center justify-between gap-3 py-2.5">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">{l.title}</p>
                        <p className="text-xs text-gray-400">{l.city}</p>
                      </div>
                      <span className="shrink-0 text-sm font-medium text-primary-600 dark:text-primary-400">{formatINR(l.price)}</span>
                    </div>
                  ))}
                </div>
              ))}

            {activeTab === "leads" &&
              (viewingAgent.leads.length === 0 ? (
                <EmptyState icon={MessageSquareText} title="No leads assigned" description="Leads assigned to this agent will appear here." />
              ) : (
                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                  {viewingAgent.leads.map((l) => (
                    <div key={l.id} className="flex items-center justify-between gap-3 py-2.5">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">{l.buyerName}</p>
                        <p className="truncate text-xs text-gray-400">{l.listingTitle}</p>
                      </div>
                      <Badge variant={l.status === "converted" ? "success" : l.status === "lost" ? "danger" : "neutral"}>
                        {STATUS_LABELS[l.status]}
                      </Badge>
                    </div>
                  ))}
                </div>
              ))}

            {activeTab === "visits" &&
              (viewingAgent.visits.length === 0 ? (
                <EmptyState icon={Target} title="No site visits" description="Scheduled walkthroughs for this agent will appear here." />
              ) : (
                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                  {viewingAgent.visits.map((v) => (
                    <div key={v.id} className="flex items-center justify-between gap-3 py-2.5">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">{v.buyerName}</p>
                        <p className="truncate text-xs text-gray-400">
                          {v.listingTitle} · {v.date} {v.time}
                        </p>
                      </div>
                      <Badge variant={v.status === "completed" ? "success" : "neutral"}>{v.status}</Badge>
                    </div>
                  ))}
                </div>
              ))}

            {activeTab === "performance" && (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-3 rounded-xl bg-gray-50 p-4 text-center dark:bg-gray-900">
                  <div>
                    <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{formatCount(viewingAgent.properties.length)}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Properties</p>
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{formatCount(viewingAgent.leads.length)}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Leads</p>
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{formatCount(viewingAgent.visits.length)}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Site Visits</p>
                  </div>
                </div>

                <div>
                  <div className="mb-1.5 flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1.5 font-medium text-gray-700 dark:text-gray-300">
                      <TrendingUp className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                      Conversion Rate
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">{viewingAgent.conversionRate}%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                    <div className="h-full rounded-full bg-primary-500" style={{ width: `${viewingAgent.conversionRate}%` }} />
                  </div>
                </div>

                {viewingAgent.leads.length > 0 && (
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">Lead Pipeline</p>
                    <div className="space-y-2">
                      {LEAD_STAGES.map((stage) => {
                        const count = viewingAgent.leads.filter((l) => l.status === stage).length;
                        const pct = Math.round((count / viewingAgent.leads.length) * 100);
                        return (
                          <div key={stage} className="flex items-center gap-3 text-sm">
                            <span className="w-20 shrink-0 truncate text-gray-500 dark:text-gray-400" title={STATUS_LABELS[stage]}>
                              {STATUS_LABELS[stage]}
                            </span>
                            <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                              <div className="h-full rounded-full bg-accent-500" style={{ width: `${pct}%` }} />
                            </div>
                            <span className="w-6 shrink-0 text-right font-medium text-gray-700 dark:text-gray-300">{count}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
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
