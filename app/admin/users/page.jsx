"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Ban,
  Briefcase,
  Building2,
  Check,
  Eye,
  Home,
  Pencil,
  Plus,
  RotateCcw,
  ShieldOff,
  Store,
  Trash2,
  User,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Table from "@/components/ui/Table";
import Select from "@/components/ui/Select";
import Modal from "@/components/ui/Modal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import ReasonModal from "@/components/ui/ReasonModal";
import Avatar from "@/components/ui/Avatar";
import Tooltip from "@/components/ui/Tooltip";
import UserFormModal from "@/components/users/UserFormModal";
import { useAppDispatch, useAppSelector } from "@/hooks/useReduxHooks";
import { useQuickAddParam } from "@/hooks/useQuickAddParam";
import {
  addUser,
  removeUser,
  removeUsers,
  updateUser,
  updateUserStatus,
  updateUsersStatus,
} from "@/redux/slices/usersSlice";
import { formatCount, todayISO } from "@/utils/format";
import { useAuditLog } from "@/hooks/useAuditLog";

const ROLE_ICON = { Buyer: User, Owner: Home, Agent: Briefcase, Dealer: Store, Builder: Building2 };
const VERIFIED_ROLES = ["Agent", "Dealer", "Builder"];

const STATUS_BADGE = {
  active: { variant: "success", label: "Active" },
  warned: { variant: "warning", label: "Warned" },
  suspended: { variant: "danger", label: "Suspended" },
  banned: { variant: "danger", label: "Banned" },
};

function verificationSummary(user) {
  const { kycStatus, reraStatus } = user.verification ?? {};
  if (kycStatus === "not_required") return { variant: "neutral", label: "N/A" };
  if (kycStatus === "rejected" || reraStatus === "rejected") return { variant: "danger", label: "Rejected" };
  if (kycStatus === "pending" || reraStatus === "pending") return { variant: "warning", label: "Pending" };
  return { variant: "success", label: "Verified" };
}

function needsVerificationReview(user) {
  if (!user || !VERIFIED_ROLES.includes(user.role)) return false;
  const { kycStatus, reraStatus } = user.verification ?? {};
  return kycStatus === "pending" || reraStatus === "pending";
}

export default function UsersPage() {
  const dispatch = useAppDispatch();
  const logAction = useAuditLog();
  const items = useAppSelector((state) => state.users.items);

  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [verificationFilter, setVerificationFilter] = useState("all");
  const [selectedIds, setSelectedIds] = useState([]);

  const [formOpen, setFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [viewingUser, setViewingUser] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [warnTarget, setWarnTarget] = useState(null);
  const [suspendTarget, setSuspendTarget] = useState(null);
  const [banTarget, setBanTarget] = useState(null);
  const [verifyRejectTarget, setVerifyRejectTarget] = useState(null);
  const [bulkSuspendOpen, setBulkSuspendOpen] = useState(false);
  const [bulkBanOpen, setBulkBanOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const filtered = useMemo(() => {
    return items.filter((u) => {
      if (roleFilter !== "all" && u.role !== roleFilter) return false;
      if (statusFilter !== "all" && u.status !== statusFilter) return false;
      if (verificationFilter !== "all" && verificationSummary(u).label !== verificationFilter) return false;
      return true;
    });
  }, [items, roleFilter, statusFilter, verificationFilter]);

  function openAdd() {
    setEditingUser(null);
    setFormOpen(true);
  }

  useQuickAddParam(openAdd);

  function openEdit(user) {
    setEditingUser(user);
    setFormOpen(true);
  }

  function handleFormSubmit(values) {
    setBusy(true);
    setTimeout(() => {
      if (editingUser) {
        dispatch(
          updateUser({
            id: editingUser.id,
            name: values.name,
            email: values.email,
            phone: values.phone,
            role: values.role,
            city: values.city,
            verification: {
              ...editingUser.verification,
              agencyName: values.agencyName ?? "",
              reraNumber: values.reraNumber ?? "",
            },
          })
        );
        toast.success(`${values.name} updated`);
      } else {
        const newId = `USR-${Math.floor(20000 + Math.random() * 9999)}`;
        const isVerifiedRole = VERIFIED_ROLES.includes(values.role);
        dispatch(
          addUser({
            id: newId,
            name: values.name,
            email: values.email,
            phone: values.phone,
            role: values.role,
            city: values.city,
            status: "active",
            joinedDate: todayISO(),
            lastActive: todayISO(),
            listingsCount: 0,
            warnings: [],
            verification: {
              kycStatus: isVerifiedRole ? "pending" : "not_required",
              reraStatus: isVerifiedRole ? "pending" : "not_applicable",
              reraNumber: values.reraNumber ?? "",
              agencyName: values.agencyName ?? "",
            },
          })
        );
        toast.success(`${values.name} added`);
      }
      setBusy(false);
      setFormOpen(false);
      setEditingUser(null);
    }, 400);
  }

  function handleApproveVerification(user) {
    dispatch(
      updateUser({
        id: user.id,
        verification: {
          ...user.verification,
          kycStatus: "verified",
          reraStatus: user.verification.reraStatus === "not_applicable" ? "not_applicable" : "verified",
        },
      })
    );
    logAction(`Approved verification for ${user.name}`, "Users");
    toast.success(`${user.name}'s verification approved`);
  }

  function handleRejectVerification(reason) {
    dispatch(
      updateUser({
        id: verifyRejectTarget.id,
        verification: {
          ...verifyRejectTarget.verification,
          kycStatus: "rejected",
          reraStatus: verifyRejectTarget.verification.reraStatus === "not_applicable" ? "not_applicable" : "rejected",
        },
        verificationRejectionReason: reason,
      })
    );
    logAction(`Rejected verification for ${verifyRejectTarget.name}`, "Users");
    toast.success(`${verifyRejectTarget.name}'s verification rejected`);
    setVerifyRejectTarget(null);
  }

  function handleWarn(reason) {
    dispatch(
      updateUser({
        id: warnTarget.id,
        status: "warned",
        warnings: [...(warnTarget.warnings ?? []), { date: todayISO(), reason }],
      })
    );
    logAction(`Warned ${warnTarget.name}`, "Users");
    toast.success(`${warnTarget.name} warned`);
    setWarnTarget(null);
  }

  function handleSuspend(reason) {
    dispatch(updateUserStatus({ id: suspendTarget.id, status: "suspended", suspensionReason: reason }));
    logAction(`Suspended ${suspendTarget.name}`, "Users");
    toast.success(`${suspendTarget.name} suspended`);
    setSuspendTarget(null);
  }

  function handleBan(reason) {
    dispatch(updateUserStatus({ id: banTarget.id, status: "banned", banReason: reason }));
    logAction(`Banned ${banTarget.name}`, "Users");
    toast.success(`${banTarget.name} banned`);
    setBanTarget(null);
  }

  function handleReactivate(user) {
    dispatch(updateUserStatus({ id: user.id, status: "active", suspensionReason: null, banReason: null }));
    logAction(`Reactivated ${user.name}`, "Users");
    toast.success(`${user.name} reactivated`);
  }

  function handleDelete() {
    dispatch(removeUser(deleteTarget.id));
    logAction(`Deleted user ${deleteTarget.name}`, "Users");
    toast.success(`${deleteTarget.name} deleted`);
    setDeleteTarget(null);
  }

  function handleBulkSuspend(reason) {
    dispatch(updateUsersStatus({ ids: selectedIds, status: "suspended", suspensionReason: reason }));
    logAction(`Bulk-suspended ${selectedIds.length} users`, "Users");
    toast.success(`${selectedIds.length} users suspended`);
    setSelectedIds([]);
    setBulkSuspendOpen(false);
  }

  function handleBulkBan(reason) {
    dispatch(updateUsersStatus({ ids: selectedIds, status: "banned", banReason: reason }));
    logAction(`Bulk-banned ${selectedIds.length} users`, "Users");
    toast.success(`${selectedIds.length} users banned`);
    setSelectedIds([]);
    setBulkBanOpen(false);
  }

  function handleBulkDelete() {
    dispatch(removeUsers(selectedIds));
    toast.success(`${selectedIds.length} users deleted`);
    setSelectedIds([]);
  }

  const columns = [
    {
      key: "name",
      header: "User",
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-2.5">
          <Avatar name={row.name} variant="flat" size="sm" />
          <div className="min-w-0">
            <p className="max-w-[200px] truncate font-medium text-gray-900 dark:text-gray-100">{row.name}</p>
            <p className="max-w-[200px] truncate text-xs text-gray-400">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "role",
      header: "Role",
      sortable: true,
      render: (row) => {
        const Icon = ROLE_ICON[row.role] ?? User;
        return (
          <span className="inline-flex items-center gap-1.5 text-gray-700 dark:text-gray-300">
            <Icon className="h-3.5 w-3.5 text-gray-400" />
            {row.role}
          </span>
        );
      },
    },
    { key: "city", header: "City", sortable: true },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (row) => {
        const s = STATUS_BADGE[row.status] ?? STATUS_BADGE.active;
        return <Badge variant={s.variant}>{s.label}</Badge>;
      },
    },
    {
      key: "verification",
      header: "Verification",
      searchable: false,
      render: (row) => {
        const v = verificationSummary(row);
        return <Badge variant={v.variant}>{v.label}</Badge>;
      },
    },
    {
      key: "listingsCount",
      header: "Listings",
      sortable: true,
      render: (row) => formatCount(row.listingsCount ?? 0),
    },
    { key: "joinedDate", header: "Joined", sortable: true },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Users &amp; Agents</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage buyers, owners, agents, dealers and builders — verification, warnings, suspensions and bans.
          </p>
        </div>
        <Button icon={Plus} onClick={openAdd}>
          Add User
        </Button>
      </div>

      <Card>
        <div className="flex flex-wrap items-end gap-3">
          <Select
            label="Role"
            className="w-40"
            containerClassName="w-40"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="all">All roles</option>
            <option value="Buyer">Buyer</option>
            <option value="Owner">Owner</option>
            <option value="Agent">Agent</option>
            <option value="Dealer">Dealer</option>
            <option value="Builder">Builder</option>
          </Select>
          <Select
            label="Status"
            className="w-40"
            containerClassName="w-40"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="warned">Warned</option>
            <option value="suspended">Suspended</option>
            <option value="banned">Banned</option>
          </Select>
          <Select
            label="Verification"
            className="w-40"
            containerClassName="w-40"
            value={verificationFilter}
            onChange={(e) => setVerificationFilter(e.target.value)}
          >
            <option value="all">All verification</option>
            <option value="Verified">Verified</option>
            <option value="Pending">Pending</option>
            <option value="Rejected">Rejected</option>
            <option value="N/A">N/A</option>
          </Select>

          {selectedIds.length > 0 && (
            <div className="ml-auto flex flex-wrap items-center gap-2 rounded-lg bg-primary-50 px-3 py-2 dark:bg-primary-500/10">
              <span className="text-xs font-medium text-primary-700 dark:text-primary-300">
                {selectedIds.length} selected
              </span>
              <Button size="sm" variant="outline" icon={Ban} onClick={() => setBulkSuspendOpen(true)}>
                Suspend
              </Button>
              <Button size="sm" variant="danger" icon={ShieldOff} onClick={() => setBulkBanOpen(true)}>
                Ban
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
        emptyTitle="No users match these filters"
        emptyDescription="Try a different role or status."
        rowActions={(row) => (
          <>
            <Tooltip content="View user" side="top">
              <button
                onClick={() => setViewingUser(row)}
                className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800"
                aria-label="View user"
              >
                <Eye className="h-3.5 w-3.5" />
              </button>
            </Tooltip>
            <Tooltip content="Edit user" side="top">
              <button
                onClick={() => openEdit(row)}
                className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-primary-600 dark:hover:bg-gray-800"
                aria-label="Edit user"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
            </Tooltip>
            {row.status === "active" && (
              <Tooltip content="Warn user" side="top">
                <button
                  onClick={() => setWarnTarget(row)}
                  className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:bg-warning/10 hover:text-amber-600"
                  aria-label="Warn user"
                >
                  <AlertTriangle className="h-3.5 w-3.5" />
                </button>
              </Tooltip>
            )}
            {(row.status === "active" || row.status === "warned") && (
              <Tooltip content="Suspend user" side="top">
                <button
                  onClick={() => setSuspendTarget(row)}
                  className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:bg-danger/10 hover:text-danger"
                  aria-label="Suspend user"
                >
                  <Ban className="h-3.5 w-3.5" />
                </button>
              </Tooltip>
            )}
            {(row.status === "suspended" || row.status === "banned") && (
              <Tooltip content="Reactivate user" side="top">
                <button
                  onClick={() => handleReactivate(row)}
                  className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:bg-success/10 hover:text-success"
                  aria-label="Reactivate user"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                </button>
              </Tooltip>
            )}
            <Tooltip content="Delete user" side="top">
              <button
                onClick={() => setDeleteTarget(row)}
                className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:bg-danger/10 hover:text-danger"
                aria-label="Delete user"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </Tooltip>
          </>
        )}
      />

      <UserFormModal
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={editingUser}
        submitting={busy}
      />

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title={`Delete ${deleteTarget?.name}?`}
        description="This will permanently remove the user account. This action cannot be undone."
        confirmLabel="Delete"
      />

      <ReasonModal
        isOpen={Boolean(warnTarget)}
        onClose={() => setWarnTarget(null)}
        onConfirm={handleWarn}
        title={`Warn ${warnTarget?.name}?`}
        description="This will be added to the user's warning history and is visible to other admins."
        confirmLabel="Warn User"
        placeholder="e.g. Misleading price in listing description"
      />

      <ReasonModal
        isOpen={Boolean(suspendTarget)}
        onClose={() => setSuspendTarget(null)}
        onConfirm={handleSuspend}
        title={`Suspend ${suspendTarget?.name}?`}
        description="The user will be temporarily unable to log in or post listings."
        confirmLabel="Suspend User"
        placeholder="e.g. Repeated policy violations after a prior warning"
      />

      <ReasonModal
        isOpen={Boolean(banTarget)}
        onClose={() => setBanTarget(null)}
        onConfirm={handleBan}
        title={`Ban ${banTarget?.name}?`}
        description="This is a permanent action. The user will lose access to their account."
        confirmLabel="Ban User"
        placeholder="e.g. Confirmed fraud reports from multiple buyers"
      />

      <ReasonModal
        isOpen={Boolean(verifyRejectTarget)}
        onClose={() => setVerifyRejectTarget(null)}
        onConfirm={handleRejectVerification}
        title={`Reject verification for ${verifyRejectTarget?.name}?`}
        description="The user will be asked to resubmit their KYC / RERA documents."
        confirmLabel="Reject Verification"
        placeholder="e.g. RERA registration number could not be verified"
      />

      <ReasonModal
        isOpen={bulkSuspendOpen}
        onClose={() => setBulkSuspendOpen(false)}
        onConfirm={handleBulkSuspend}
        title={`Suspend ${selectedIds.length} users?`}
        description="The same reason will be applied to every selected user."
        confirmLabel="Suspend All"
      />

      <ReasonModal
        isOpen={bulkBanOpen}
        onClose={() => setBulkBanOpen(false)}
        onConfirm={handleBulkBan}
        title={`Ban ${selectedIds.length} users?`}
        description="This is a permanent action applied to every selected user."
        confirmLabel="Ban All"
      />

      {/* User profile + KYC/RERA verification review panel, per spec Section 2.6 / 4.3 */}
      <Modal
        isOpen={Boolean(viewingUser)}
        onClose={() => setViewingUser(null)}
        size="lg"
        title={viewingUser?.name}
        description={viewingUser ? `${viewingUser.id} — ${viewingUser.role}` : ""}
        footer={
          viewingUser && (
            <>
              {needsVerificationReview(viewingUser) && (
                <>
                  <Button
                    variant="outline"
                    icon={X}
                    onClick={() => {
                      setVerifyRejectTarget(viewingUser);
                      setViewingUser(null);
                    }}
                  >
                    Reject Verification
                  </Button>
                  <Button
                    variant="success"
                    icon={Check}
                    onClick={() => {
                      handleApproveVerification(viewingUser);
                      setViewingUser(null);
                    }}
                  >
                    Approve Verification
                  </Button>
                </>
              )}
              {(viewingUser.status === "suspended" || viewingUser.status === "banned") && (
                <Button
                  variant="success"
                  icon={RotateCcw}
                  onClick={() => {
                    handleReactivate(viewingUser);
                    setViewingUser(null);
                  }}
                >
                  Reactivate
                </Button>
              )}
              {viewingUser.status !== "banned" && (
                <Button
                  variant="danger"
                  icon={ShieldOff}
                  onClick={() => {
                    setBanTarget(viewingUser);
                    setViewingUser(null);
                  }}
                >
                  Ban
                </Button>
              )}
            </>
          )
        }
      >
        {viewingUser && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <InfoField label="Email" value={viewingUser.email} />
              <InfoField label="Phone" value={viewingUser.phone} />
              <InfoField label="City" value={viewingUser.city} />
              <InfoField label="Joined" value={viewingUser.joinedDate} />
              <InfoField label="Last Active" value={viewingUser.lastActive} />
              <InfoField label="Listings" value={formatCount(viewingUser.listingsCount ?? 0)} />
              <InfoField
                label="Status"
                value={<Badge variant={STATUS_BADGE[viewingUser.status]?.variant}>{STATUS_BADGE[viewingUser.status]?.label}</Badge>}
              />
            </div>

            {viewingUser.banReason && (
              <div className="flex items-start gap-2 rounded-lg bg-danger/10 p-3 text-sm text-danger">
                <ShieldOff className="mt-0.5 h-4 w-4 shrink-0" />
                <p>
                  <span className="font-semibold">Banned: </span>
                  {viewingUser.banReason}
                </p>
              </div>
            )}
            {viewingUser.suspensionReason && (
              <div className="flex items-start gap-2 rounded-lg bg-danger/10 p-3 text-sm text-danger">
                <Ban className="mt-0.5 h-4 w-4 shrink-0" />
                <p>
                  <span className="font-semibold">Suspended: </span>
                  {viewingUser.suspensionReason}
                </p>
              </div>
            )}

            {(viewingUser.warnings ?? []).length > 0 && (
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">Warning History</p>
                <div className="space-y-2">
                  {viewingUser.warnings.map((w, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-2 rounded-lg bg-warning/10 p-2.5 text-sm text-amber-800 dark:text-amber-400"
                    >
                      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                      <p>
                        <span className="font-medium">{w.date}</span> — {w.reason}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {VERIFIED_ROLES.includes(viewingUser.role) && (
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Agent / Broker Verification
                </p>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  <InfoField label="Agency / Firm" value={viewingUser.verification?.agencyName || "—"} />
                  <InfoField label="RERA Number" value={viewingUser.verification?.reraNumber || "—"} />
                  <InfoField
                    label="KYC Status"
                    value={<StatusBadgeInline value={viewingUser.verification?.kycStatus} />}
                  />
                  <InfoField
                    label="RERA Status"
                    value={<StatusBadgeInline value={viewingUser.verification?.reraStatus} />}
                  />
                </div>
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

const VERIFICATION_TONE = {
  verified: "success",
  pending: "warning",
  rejected: "danger",
  not_applicable: "neutral",
  not_required: "neutral",
};

const VERIFICATION_LABEL = {
  verified: "Verified",
  pending: "Pending",
  rejected: "Rejected",
  not_applicable: "Not Applicable",
  not_required: "Not Required",
};

function StatusBadgeInline({ value }) {
  return <Badge variant={VERIFICATION_TONE[value] ?? "neutral"}>{VERIFICATION_LABEL[value] ?? value}</Badge>;
}
