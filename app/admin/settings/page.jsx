"use client";

import { useState } from "react";
import {
  Bell,
  Building2,
  Copy,
  Database,
  FileClock,
  Key,
  Mail,
  MapPin,
  MessageCircle,
  MessageSquare,
  Pencil,
  Plus,
  Power,
  ShieldOff,
  Trash2,
  Users as UsersIcon,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import { cn } from "@/utils/cn";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Table from "@/components/ui/Table";
import Modal from "@/components/ui/Modal";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import AdminUserFormModal from "@/components/settings/AdminUserFormModal";
import TemplateFormModal from "@/components/settings/TemplateFormModal";
import ApiKeyFormModal from "@/components/settings/ApiKeyFormModal";
import { useAppDispatch, useAppSelector } from "@/hooks/useReduxHooks";
import {
  addAdminUser,
  addApiKey,
  addCity,
  addPropertyType,
  addTemplate,
  removeAdminUser,
  removeApiKey,
  removeCity,
  removePropertyType,
  removeTemplate,
  updateAdminUser,
  updateApiKey,
  updateTemplate,
} from "@/redux/slices/settingsSlice";
import { todayISO } from "@/utils/format";

const TABS = [
  { key: "admins", label: "Admin Users", icon: UsersIcon },
  { key: "templates", label: "Notification Templates", icon: Bell },
  { key: "keys", label: "API Keys", icon: Key },
  { key: "masterdata", label: "Master Data", icon: Database },
  { key: "audit", label: "Audit Log", icon: FileClock },
];

const CHANNEL_ICON = { Email: Mail, SMS: MessageSquare, WhatsApp: MessageCircle, Push: Bell };

function generateFakeKey(environment) {
  const chars = "abcdef0123456789";
  const random = Array.from({ length: 32 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  return `${environment === "Production" ? "sk_live" : "sk_test"}_${random}`;
}

function maskKey(fullKey) {
  return `${fullKey.slice(0, 12)}••••••••${fullKey.slice(-4)}`;
}

export default function SettingsPage() {
  const [tab, setTab] = useState("admins");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Settings</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Admin roles &amp; access control, notification templates, API keys and the audit log.
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

      {tab === "admins" && <AdminUsersTab />}
      {tab === "templates" && <TemplatesTab />}
      {tab === "keys" && <ApiKeysTab />}
      {tab === "masterdata" && <MasterDataTab />}
      {tab === "audit" && <AuditLogTab />}
    </div>
  );
}

function AdminUsersTab() {
  const dispatch = useAppDispatch();
  const items = useAppSelector((state) => state.settings.adminUsers);
  const currentUser = useAppSelector((state) => state.auth.user);
  const [selectedIds, setSelectedIds] = useState([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [busy, setBusy] = useState(false);

  function handleSubmit(values) {
    setBusy(true);
    setTimeout(() => {
      if (editing) {
        dispatch(updateAdminUser({ id: editing.id, ...values }));
        toast.success(`${values.name} updated`);
      } else {
        const newId = `ADM-${Math.floor(100 + Math.random() * 899)}`;
        dispatch(addAdminUser({ id: newId, ...values, status: "active", lastLogin: "—", createdDate: todayISO() }));
        toast.success(`${values.name} added`);
      }
      setBusy(false);
      setFormOpen(false);
      setEditing(null);
    }, 400);
  }

  function handleToggle(admin) {
    if (admin.email === currentUser?.email) {
      toast.error("You can't suspend your own account");
      return;
    }
    const next = admin.status === "active" ? "suspended" : "active";
    dispatch(updateAdminUser({ id: admin.id, status: next }));
    toast.success(`${admin.name} ${next === "active" ? "activated" : "suspended"}`);
  }

  function handleDelete() {
    if (deleteTarget.email === currentUser?.email) {
      toast.error("You can't remove your own account");
      setDeleteTarget(null);
      return;
    }
    dispatch(removeAdminUser(deleteTarget.id));
    toast.success(`${deleteTarget.name} removed`);
    setDeleteTarget(null);
  }

  function handleBulkDelete() {
    const selfId = items.find((a) => a.email === currentUser?.email)?.id;
    const ids = selectedIds.filter((id) => id !== selfId);
    ids.forEach((id) => dispatch(removeAdminUser(id)));
    if (selfId && selectedIds.includes(selfId)) toast.error("Your own account was kept — you can't remove it");
    if (ids.length) toast.success(`${ids.length} admin${ids.length === 1 ? "" : "s"} removed`);
    setSelectedIds([]);
  }

  const columns = [
    {
      key: "name",
      header: "Admin",
      sortable: true,
      render: (row) => (
        <div className="min-w-0">
          <p className="font-medium text-gray-900 dark:text-gray-100">{row.name}</p>
          <p className="text-xs text-gray-400">{row.email}</p>
        </div>
      ),
    },
    { key: "role", header: "Role", sortable: true },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (row) => <Badge variant={row.status === "active" ? "success" : "danger"}>{row.status === "active" ? "Active" : "Suspended"}</Badge>,
    },
    { key: "lastLogin", header: "Last Login", sortable: true },
    { key: "createdDate", header: "Created", sortable: true },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          {selectedIds.length > 0 && (
            <div className="flex items-center gap-2 rounded-lg bg-primary-50 px-3 py-2 dark:bg-primary-500/10">
              <span className="text-xs font-medium text-primary-700 dark:text-primary-300">{selectedIds.length} selected</span>
              <Button size="sm" variant="outline" icon={Trash2} onClick={handleBulkDelete}>
                Delete
              </Button>
            </div>
          )}
        </div>
        <Button
          icon={Plus}
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
        >
          Add Admin User
        </Button>
      </div>

      <Table
        columns={columns}
        data={items}
        selectable
        selectedIds={selectedIds}
        onSelectedIdsChange={setSelectedIds}
        pageSize={10}
        emptyTitle="No admin users yet"
        rowActions={(row) => (
          <>
            <button
              onClick={() => {
                setEditing(row);
                setFormOpen(true);
              }}
              className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-primary-600 dark:hover:bg-gray-800"
              aria-label="Edit admin"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => handleToggle(row)}
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800",
                row.status === "active" ? "hover:text-danger" : "hover:text-success"
              )}
              aria-label={row.status === "active" ? "Suspend admin" : "Activate admin"}
            >
              <Power className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => {
                if (row.email === currentUser?.email) {
                  toast.error("You can't remove your own account");
                  return;
                }
                setDeleteTarget(row);
              }}
              className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:bg-danger/10 hover:text-danger"
              aria-label="Delete admin"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </>
        )}
      />

      <AdminUserFormModal isOpen={formOpen} onClose={() => setFormOpen(false)} onSubmit={handleSubmit} initialData={editing} submitting={busy} />

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title={`Remove ${deleteTarget?.name}?`}
        description="This admin will lose access to the control panel immediately."
        confirmLabel="Remove"
      />
    </div>
  );
}

function TemplatesTab() {
  const dispatch = useAppDispatch();
  const items = useAppSelector((state) => state.settings.templates);
  const [selectedIds, setSelectedIds] = useState([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [busy, setBusy] = useState(false);

  function handleSubmit(values) {
    setBusy(true);
    setTimeout(() => {
      if (editing) {
        dispatch(updateTemplate({ id: editing.id, ...values, lastUpdated: todayISO() }));
        toast.success(`${values.name} updated`);
      } else {
        const newId = `TPL-${Math.floor(100 + Math.random() * 899)}`;
        dispatch(addTemplate({ id: newId, ...values, lastUpdated: todayISO() }));
        toast.success(`${values.name} added`);
      }
      setBusy(false);
      setFormOpen(false);
      setEditing(null);
    }, 400);
  }

  function handleToggle(tpl) {
    const next = tpl.status === "active" ? "inactive" : "active";
    dispatch(updateTemplate({ id: tpl.id, status: next }));
    toast.success(`${tpl.name} ${next === "active" ? "activated" : "deactivated"}`);
  }

  function handleDelete() {
    dispatch(removeTemplate(deleteTarget.id));
    toast.success(`${deleteTarget.name} deleted`);
    setDeleteTarget(null);
  }

  function handleBulkDelete() {
    selectedIds.forEach((id) => dispatch(removeTemplate(id)));
    toast.success(`${selectedIds.length} templates deleted`);
    setSelectedIds([]);
  }

  const columns = [
    { key: "name", header: "Template", sortable: true },
    {
      key: "channel",
      header: "Channel",
      sortable: true,
      render: (row) => {
        const Icon = CHANNEL_ICON[row.channel] ?? Mail;
        return (
          <span className="inline-flex items-center gap-1.5 text-gray-700 dark:text-gray-300">
            <Icon className="h-3.5 w-3.5 text-gray-400" />
            {row.channel}
          </span>
        );
      },
    },
    { key: "message", header: "Preview", render: (row) => <p className="max-w-[280px] truncate text-gray-500 dark:text-gray-400">{row.subject || row.message}</p> },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (row) => <Badge variant={row.status === "active" ? "success" : "neutral"}>{row.status === "active" ? "Active" : "Inactive"}</Badge>,
    },
    { key: "lastUpdated", header: "Updated", sortable: true },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          {selectedIds.length > 0 && (
            <div className="flex items-center gap-2 rounded-lg bg-primary-50 px-3 py-2 dark:bg-primary-500/10">
              <span className="text-xs font-medium text-primary-700 dark:text-primary-300">{selectedIds.length} selected</span>
              <Button size="sm" variant="outline" icon={Trash2} onClick={handleBulkDelete}>
                Delete
              </Button>
            </div>
          )}
        </div>
        <Button
          icon={Plus}
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
        >
          Add Template
        </Button>
      </div>

      <Table
        columns={columns}
        data={items}
        selectable
        selectedIds={selectedIds}
        onSelectedIdsChange={setSelectedIds}
        pageSize={10}
        emptyTitle="No notification templates yet"
        rowActions={(row) => (
          <>
            <button
              onClick={() => {
                setEditing(row);
                setFormOpen(true);
              }}
              className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-primary-600 dark:hover:bg-gray-800"
              aria-label="Edit template"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => handleToggle(row)}
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800",
                row.status === "active" ? "hover:text-danger" : "hover:text-success"
              )}
              aria-label={row.status === "active" ? "Deactivate template" : "Activate template"}
            >
              <Power className="h-3.5 w-3.5" />
            </button>
            <button onClick={() => setDeleteTarget(row)} className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:bg-danger/10 hover:text-danger" aria-label="Delete template">
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </>
        )}
      />

      <TemplateFormModal isOpen={formOpen} onClose={() => setFormOpen(false)} onSubmit={handleSubmit} initialData={editing} submitting={busy} />

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title={`Delete "${deleteTarget?.name}"?`}
        description="This template will no longer be available for sending notifications."
        confirmLabel="Delete"
      />
    </div>
  );
}

function ApiKeysTab() {
  const dispatch = useAppDispatch();
  const items = useAppSelector((state) => state.settings.apiKeys);
  const [selectedIds, setSelectedIds] = useState([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [revokeTarget, setRevokeTarget] = useState(null);
  const [revealedKey, setRevealedKey] = useState(null);
  const [busy, setBusy] = useState(false);

  function handleSubmit(values) {
    setBusy(true);
    setTimeout(() => {
      if (editing) {
        dispatch(updateApiKey({ id: editing.id, ...values }));
        toast.success(`${values.name} updated`);
      } else {
        const newId = `KEY-${Math.floor(100 + Math.random() * 899)}`;
        const fullKey = generateFakeKey(values.environment);
        dispatch(
          addApiKey({ id: newId, ...values, keyMasked: maskKey(fullKey), status: "active", createdDate: todayISO(), lastUsed: "—" })
        );
        setRevealedKey({ name: values.name, fullKey });
      }
      setBusy(false);
      setFormOpen(false);
      setEditing(null);
    }, 400);
  }

  function handleRevoke() {
    dispatch(updateApiKey({ id: revokeTarget.id, status: "revoked" }));
    toast.success(`${revokeTarget.name} revoked`);
    setRevokeTarget(null);
  }

  function handleDelete() {
    dispatch(removeApiKey(deleteTarget.id));
    toast.success(`${deleteTarget.name} deleted`);
    setDeleteTarget(null);
  }

  function handleBulkDelete() {
    selectedIds.forEach((id) => dispatch(removeApiKey(id)));
    toast.success(`${selectedIds.length} keys deleted`);
    setSelectedIds([]);
  }

  function copyKey() {
    navigator.clipboard?.writeText(revealedKey.fullKey);
    toast.success("Key copied to clipboard");
  }

  const columns = [
    { key: "name", header: "Key Name", sortable: true },
    { key: "keyMasked", header: "Key", render: (row) => <span className="font-mono text-xs text-gray-600 dark:text-gray-400">{row.keyMasked}</span> },
    { key: "environment", header: "Environment", sortable: true },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (row) => <Badge variant={row.status === "active" ? "success" : "danger"}>{row.status === "active" ? "Active" : "Revoked"}</Badge>,
    },
    { key: "lastUsed", header: "Last Used", sortable: true },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          {selectedIds.length > 0 && (
            <div className="flex items-center gap-2 rounded-lg bg-primary-50 px-3 py-2 dark:bg-primary-500/10">
              <span className="text-xs font-medium text-primary-700 dark:text-primary-300">{selectedIds.length} selected</span>
              <Button size="sm" variant="outline" icon={Trash2} onClick={handleBulkDelete}>
                Delete
              </Button>
            </div>
          )}
        </div>
        <Button
          icon={Plus}
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
        >
          Generate API Key
        </Button>
      </div>

      <Table
        columns={columns}
        data={items}
        selectable
        selectedIds={selectedIds}
        onSelectedIdsChange={setSelectedIds}
        pageSize={10}
        emptyTitle="No API keys yet"
        rowActions={(row) => (
          <>
            <button
              onClick={() => {
                setEditing(row);
                setFormOpen(true);
              }}
              className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-primary-600 dark:hover:bg-gray-800"
              aria-label="Edit key"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
            {row.status === "active" && (
              <button onClick={() => setRevokeTarget(row)} className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:bg-danger/10 hover:text-danger" aria-label="Revoke key">
                <ShieldOff className="h-3.5 w-3.5" />
              </button>
            )}
            <button onClick={() => setDeleteTarget(row)} className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:bg-danger/10 hover:text-danger" aria-label="Delete key">
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </>
        )}
      />

      <ApiKeyFormModal isOpen={formOpen} onClose={() => setFormOpen(false)} onSubmit={handleSubmit} initialData={editing} submitting={busy} />

      <ConfirmDialog
        isOpen={Boolean(revokeTarget)}
        onClose={() => setRevokeTarget(null)}
        onConfirm={handleRevoke}
        title={`Revoke ${revokeTarget?.name}?`}
        description="Any integration using this key will immediately stop working. This cannot be undone."
        confirmLabel="Revoke Key"
      />

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title={`Delete ${deleteTarget?.name}?`}
        description="This will permanently remove the key record."
        confirmLabel="Delete"
      />

      <Modal isOpen={Boolean(revealedKey)} onClose={() => setRevealedKey(null)} size="sm" title="API Key Generated" description="Copy this key now — it won't be shown again.">
        {revealedKey && (
          <div className="space-y-3">
            <p className="text-sm text-gray-600 dark:text-gray-400">{revealedKey.name}</p>
            <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-900">
              <code className="flex-1 overflow-x-auto whitespace-nowrap font-mono text-xs text-gray-800 dark:text-gray-200">{revealedKey.fullKey}</code>
              <button onClick={copyKey} className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-gray-400 hover:bg-gray-200 hover:text-primary-600 dark:hover:bg-gray-700" aria-label="Copy key">
                <Copy className="h-3.5 w-3.5" />
              </button>
            </div>
            <Button className="w-full" onClick={() => setRevealedKey(null)}>
              Done
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
}

function MasterDataTab() {
  const dispatch = useAppDispatch();
  const propertyTypes = useAppSelector((state) => state.settings.propertyTypes);
  const cities = useAppSelector((state) => state.settings.cities);
  const [newType, setNewType] = useState("");
  const [newCity, setNewCity] = useState("");

  function handleAddType(e) {
    e.preventDefault();
    const value = newType.trim();
    if (!value) return;
    if (propertyTypes.includes(value)) {
      toast.error(`"${value}" already exists`);
      return;
    }
    dispatch(addPropertyType(value));
    toast.success(`${value} added`);
    setNewType("");
  }

  function handleRemoveType(type) {
    dispatch(removePropertyType(type));
    toast.success(`${type} removed`);
  }

  function handleAddCity(e) {
    e.preventDefault();
    const value = newCity.trim();
    if (!value) return;
    if (cities.includes(value)) {
      toast.error(`"${value}" already exists`);
      return;
    }
    dispatch(addCity(value));
    toast.success(`${value} added`);
    setNewCity("");
  }

  function handleRemoveCity(city) {
    dispatch(removeCity(city));
    toast.success(`${city} removed`);
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <Card title="Property Types" description="Categories available across Listings and search filters">
        <form onSubmit={handleAddType} className="mb-4 flex items-end gap-2">
          <Input label="Add Property Type" containerClassName="flex-1" value={newType} onChange={(e) => setNewType(e.target.value)} placeholder="e.g. Farmhouse" />
          <Button type="submit" icon={Plus}>
            Add
          </Button>
        </form>
        <div className="flex flex-wrap gap-2">
          {propertyTypes.map((type) => (
            <span
              key={type}
              className="inline-flex items-center gap-1.5 rounded-full bg-primary-50 px-3 py-1.5 text-sm text-primary-700 dark:bg-primary-500/10 dark:text-primary-300"
            >
              <Building2 className="h-3.5 w-3.5" />
              {type}
              <button onClick={() => handleRemoveType(type)} className="ml-0.5 rounded-full p-0.5 hover:bg-primary-100 dark:hover:bg-primary-500/20" aria-label={`Remove ${type}`}>
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      </Card>

      <Card title="Cities" description="Localities available across search, listings and townships">
        <form onSubmit={handleAddCity} className="mb-4 flex items-end gap-2">
          <Input label="Add City" containerClassName="flex-1" value={newCity} onChange={(e) => setNewCity(e.target.value)} placeholder="e.g. Kolkata" />
          <Button type="submit" icon={Plus}>
            Add
          </Button>
        </form>
        <div className="flex flex-wrap gap-2">
          {cities.map((city) => (
            <span
              key={city}
              className="inline-flex items-center gap-1.5 rounded-full bg-accent-50 px-3 py-1.5 text-sm text-accent-700 dark:bg-accent-500/10 dark:text-accent-300"
            >
              <MapPin className="h-3.5 w-3.5" />
              {city}
              <button onClick={() => handleRemoveCity(city)} className="ml-0.5 rounded-full p-0.5 hover:bg-accent-100 dark:hover:bg-accent-500/20" aria-label={`Remove ${city}`}>
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      </Card>
    </div>
  );
}

function AuditLogTab() {
  const items = useAppSelector((state) => state.settings.auditLog);

  const columns = [
    { key: "timestamp", header: "Timestamp", sortable: true },
    { key: "admin", header: "Admin", sortable: true },
    { key: "action", header: "Action" },
    { key: "module", header: "Module", sortable: true },
  ];

  return (
    <Table columns={columns} data={items} pageSize={10} emptyTitle="No audit log entries yet" />
  );
}
