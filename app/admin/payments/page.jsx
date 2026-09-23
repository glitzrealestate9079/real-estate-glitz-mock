"use client";

import { useMemo, useState } from "react";
import {
  Eye,
  Package,
  Pencil,
  Plus,
  Power,
  Receipt,
  RotateCcw,
  Tag,
  Trash2,
} from "lucide-react";
import toast from "react-hot-toast";
import { cn } from "@/utils/cn";
import Tooltip from "@/components/ui/Tooltip";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Table from "@/components/ui/Table";
import Select from "@/components/ui/Select";
import Modal from "@/components/ui/Modal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import ReasonModal from "@/components/ui/ReasonModal";
import PlanFormModal from "@/components/payments/PlanFormModal";
import CouponFormModal from "@/components/payments/CouponFormModal";
import TransactionFormModal from "@/components/payments/TransactionFormModal";
import { useAppDispatch, useAppSelector } from "@/hooks/useReduxHooks";
import {
  addCoupon,
  addPlan,
  addTransaction,
  removeCoupon,
  removePlan,
  removeTransaction,
  removeTransactions,
  updateCoupon,
  updatePlan,
  updateTransaction,
} from "@/redux/slices/paymentsSlice";
import { formatINR } from "@/utils/format";

const TABS = [
  { key: "transactions", label: "Transactions", icon: Receipt },
  { key: "plans", label: "Pricing Plans", icon: Package },
  { key: "coupons", label: "Coupons", icon: Tag },
];

const TXN_STATUS_BADGE = {
  success: { variant: "success", label: "Success" },
  pending: { variant: "warning", label: "Pending" },
  failed: { variant: "danger", label: "Failed" },
  refunded: { variant: "neutral", label: "Refunded" },
};

const COUPON_STATUS_BADGE = {
  active: { variant: "success", label: "Active" },
  disabled: { variant: "danger", label: "Disabled" },
  expired: { variant: "neutral", label: "Expired" },
};

function planPriceLabel(plan) {
  return plan.price === 0 ? "Free" : formatINR(plan.price);
}

function couponDiscountLabel(c) {
  return c.discountType === "percentage" ? `${c.discountValue}%` : formatINR(c.discountValue);
}

export default function PaymentsPage() {
  const [tab, setTab] = useState("transactions");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Payments &amp; Subscriptions</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Pricing plans, the transaction ledger with refunds, and discount coupon codes.
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

      {tab === "transactions" && <TransactionsTab />}
      {tab === "plans" && <PlansTab />}
      {tab === "coupons" && <CouponsTab />}
    </div>
  );
}

function TransactionsTab() {
  const dispatch = useAppDispatch();
  const items = useAppSelector((state) => state.payments.transactions);

  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedIds, setSelectedIds] = useState([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [viewing, setViewing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [refundTarget, setRefundTarget] = useState(null);
  const [busy, setBusy] = useState(false);

  const filtered = useMemo(
    () => (statusFilter === "all" ? items : items.filter((t) => t.status === statusFilter)),
    [items, statusFilter]
  );

  function handleSubmit(values) {
    setBusy(true);
    setTimeout(() => {
      if (editing) {
        dispatch(updateTransaction({ id: editing.id, ...values }));
        toast.success(`Transaction ${editing.id} updated`);
      } else {
        const newId = `TXN-${Math.floor(50000 + Math.random() * 9999)}`;
        dispatch(addTransaction({ id: newId, invoiceId: `INV-${Math.floor(90000 + Math.random() * 9999)}`, ...values }));
        toast.success(`Transaction ${newId} recorded`);
      }
      setBusy(false);
      setFormOpen(false);
      setEditing(null);
    }, 400);
  }

  function handleRefund(reason) {
    dispatch(updateTransaction({ id: refundTarget.id, status: "refunded", refundReason: reason }));
    toast.success(`${refundTarget.id} refunded`);
    setRefundTarget(null);
  }

  function handleDelete() {
    dispatch(removeTransaction(deleteTarget.id));
    toast.success(`${deleteTarget.id} deleted`);
    setDeleteTarget(null);
  }

  function handleBulkDelete() {
    dispatch(removeTransactions(selectedIds));
    toast.success(`${selectedIds.length} transactions deleted`);
    setSelectedIds([]);
  }

  const columns = [
    {
      key: "id",
      header: "Transaction",
      sortable: true,
      render: (row) => (
        <div className="min-w-0">
          <p className="font-medium text-gray-900 dark:text-gray-100">{row.id}</p>
          <p className="text-xs text-gray-400">{row.invoiceId}</p>
        </div>
      ),
    },
    { key: "userName", header: "User", sortable: true },
    { key: "planName", header: "Plan", sortable: true },
    { key: "amount", header: "Amount", sortable: true, render: (row) => formatINR(row.amount) },
    { key: "method", header: "Method" },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (row) => {
        const s = TXN_STATUS_BADGE[row.status] ?? TXN_STATUS_BADGE.pending;
        return <Badge variant={s.variant}>{s.label}</Badge>;
      },
    },
    { key: "transactionDate", header: "Date", sortable: true },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Card className="flex-1">
          <div className="flex flex-wrap items-end gap-3">
            <Select label="Status" className="w-40" containerClassName="w-40" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">All statuses</option>
              {Object.entries(TXN_STATUS_BADGE).map(([k, v]) => (
                <option key={k} value={k}>
                  {v.label}
                </option>
              ))}
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
        <Button
          icon={Plus}
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
        >
          Add Transaction
        </Button>
      </div>

      <Table
        columns={columns}
        data={filtered}
        selectable
        selectedIds={selectedIds}
        onSelectedIdsChange={setSelectedIds}
        emptyTitle="No transactions match this filter"
        rowActions={(row) => (
          <>
            <Tooltip content="View transaction" side="top">
              <button onClick={() => setViewing(row)} className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800" aria-label="View transaction">
                <Eye className="h-3.5 w-3.5" />
              </button>
            </Tooltip>
            <Tooltip content="Edit transaction" side="top">
              <button
                onClick={() => {
                  setEditing(row);
                  setFormOpen(true);
                }}
                className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-primary-600 dark:hover:bg-gray-800"
                aria-label="Edit transaction"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
            </Tooltip>
            {row.status === "success" && (
              <Tooltip content="Refund transaction" side="top">
                <button onClick={() => setRefundTarget(row)} className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:bg-warning/10 hover:text-amber-600" aria-label="Refund transaction">
                  <RotateCcw className="h-3.5 w-3.5" />
                </button>
              </Tooltip>
            )}
            <Tooltip content="Delete transaction" side="top">
              <button onClick={() => setDeleteTarget(row)} className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:bg-danger/10 hover:text-danger" aria-label="Delete transaction">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </Tooltip>
          </>
        )}
      />

      <TransactionFormModal isOpen={formOpen} onClose={() => setFormOpen(false)} onSubmit={handleSubmit} initialData={editing} submitting={busy} />

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title={`Delete ${deleteTarget?.id}?`}
        description="This will permanently remove the transaction record."
        confirmLabel="Delete"
      />

      <ReasonModal
        isOpen={Boolean(refundTarget)}
        onClose={() => setRefundTarget(null)}
        onConfirm={handleRefund}
        title={`Refund ${refundTarget?.id}?`}
        description="This marks the transaction as refunded and logs the reason on the invoice."
        confirmLabel="Refund"
        placeholder="e.g. Duplicate charge — accidental double payment"
      />

      <Modal isOpen={Boolean(viewing)} onClose={() => setViewing(null)} size="sm" title={viewing?.id} description={viewing?.invoiceId}>
        {viewing && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <InfoField label="User" value={viewing.userName} />
              <InfoField label="Plan" value={viewing.planName} />
              <InfoField label="Amount" value={formatINR(viewing.amount)} />
              <InfoField label="Method" value={viewing.method} />
              <InfoField label="Date" value={viewing.transactionDate} />
              <InfoField label="Status" value={<Badge variant={TXN_STATUS_BADGE[viewing.status]?.variant}>{TXN_STATUS_BADGE[viewing.status]?.label}</Badge>} />
            </div>
            {viewing.refundReason && (
              <div className="rounded-lg bg-gray-50 p-3 text-sm text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                <span className="font-semibold">Refund reason: </span>
                {viewing.refundReason}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

function PlansTab() {
  const dispatch = useAppDispatch();
  const items = useAppSelector((state) => state.payments.plans);
  const [selectedIds, setSelectedIds] = useState([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [busy, setBusy] = useState(false);

  function handleSubmit(values) {
    setBusy(true);
    setTimeout(() => {
      if (editing) {
        dispatch(updatePlan({ id: editing.id, ...values }));
        toast.success(`${values.name} updated`);
      } else {
        const newId = `PLN-${Math.floor(100 + Math.random() * 899)}`;
        dispatch(addPlan({ id: newId, ...values }));
        toast.success(`${values.name} added`);
      }
      setBusy(false);
      setFormOpen(false);
      setEditing(null);
    }, 400);
  }

  function handleToggleActive(plan) {
    dispatch(updatePlan({ id: plan.id, active: !plan.active }));
    toast.success(`${plan.name} ${plan.active ? "deactivated" : "activated"}`);
  }

  function handleDelete() {
    dispatch(removePlan(deleteTarget.id));
    toast.success(`${deleteTarget.name} deleted`);
    setDeleteTarget(null);
  }

  function handleBulkDelete() {
    selectedIds.forEach((id) => dispatch(removePlan(id)));
    toast.success(`${selectedIds.length} plans deleted`);
    setSelectedIds([]);
  }

  const columns = [
    {
      key: "name",
      header: "Plan",
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-1.5">
          <span className="font-medium text-gray-900 dark:text-gray-100">{row.name}</span>
          {row.popular && <Badge variant="info">Popular</Badge>}
        </div>
      ),
    },
    { key: "price", header: "Price", sortable: true, render: (row) => planPriceLabel(row) },
    { key: "billingCycle", header: "Billing" },
    { key: "listingsIncluded", header: "Listings" },
    { key: "featuredCredits", header: "Featured Credits", sortable: true },
    {
      key: "active",
      header: "Status",
      sortable: true,
      render: (row) => <Badge variant={row.active ? "success" : "neutral"}>{row.active ? "Active" : "Inactive"}</Badge>,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
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
          Add Plan
        </Button>
      </div>

      <Table
        columns={columns}
        data={items}
        selectable
        selectedIds={selectedIds}
        onSelectedIdsChange={setSelectedIds}
        pageSize={10}
        emptyTitle="No pricing plans yet"
        rowActions={(row) => (
          <>
            <Tooltip content="Edit plan" side="top">
              <button
                onClick={() => {
                  setEditing(row);
                  setFormOpen(true);
                }}
                className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-primary-600 dark:hover:bg-gray-800"
                aria-label="Edit plan"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
            </Tooltip>
            <Tooltip content={row.active ? "Deactivate plan" : "Activate plan"} side="top">
              <button
                onClick={() => handleToggleActive(row)}
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800",
                  row.active ? "hover:text-danger" : "hover:text-success"
                )}
                aria-label={row.active ? "Deactivate plan" : "Activate plan"}
              >
                <Power className="h-3.5 w-3.5" />
              </button>
            </Tooltip>
            <Tooltip content="Delete plan" side="top">
              <button onClick={() => setDeleteTarget(row)} className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:bg-danger/10 hover:text-danger" aria-label="Delete plan">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </Tooltip>
          </>
        )}
      />

      <PlanFormModal isOpen={formOpen} onClose={() => setFormOpen(false)} onSubmit={handleSubmit} initialData={editing} submitting={busy} />

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title={`Delete ${deleteTarget?.name}?`}
        description="Sellers will no longer be able to purchase this plan."
        confirmLabel="Delete"
      />
    </div>
  );
}

function CouponsTab() {
  const dispatch = useAppDispatch();
  const items = useAppSelector((state) => state.payments.coupons);
  const [selectedIds, setSelectedIds] = useState([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [busy, setBusy] = useState(false);

  function handleSubmit(values) {
    setBusy(true);
    setTimeout(() => {
      if (editing) {
        dispatch(updateCoupon({ id: editing.id, ...values }));
        toast.success(`${values.code} updated`);
      } else {
        const newId = `CPN-${Math.floor(100 + Math.random() * 899)}`;
        dispatch(addCoupon({ id: newId, ...values, usedCount: 0 }));
        toast.success(`${values.code} added`);
      }
      setBusy(false);
      setFormOpen(false);
      setEditing(null);
    }, 400);
  }

  function handleToggle(coupon) {
    const next = coupon.status === "active" ? "disabled" : "active";
    dispatch(updateCoupon({ id: coupon.id, status: next }));
    toast.success(`${coupon.code} ${next === "active" ? "activated" : "disabled"}`);
  }

  function handleDelete() {
    dispatch(removeCoupon(deleteTarget.id));
    toast.success(`${deleteTarget.code} deleted`);
    setDeleteTarget(null);
  }

  function handleBulkDelete() {
    selectedIds.forEach((id) => dispatch(removeCoupon(id)));
    toast.success(`${selectedIds.length} coupons deleted`);
    setSelectedIds([]);
  }

  const columns = [
    { key: "code", header: "Code", sortable: true, render: (row) => <span className="font-mono font-medium text-gray-900 dark:text-gray-100">{row.code}</span> },
    { key: "discountValue", header: "Discount", sortable: true, render: (row) => couponDiscountLabel(row) },
    { key: "applicablePlans", header: "Applicable Plans" },
    { key: "usedCount", header: "Usage", render: (row) => `${row.usedCount} / ${row.maxUses === 0 ? "∞" : row.maxUses}` },
    { key: "expiryDate", header: "Expiry", sortable: true },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (row) => {
        const s = COUPON_STATUS_BADGE[row.status] ?? COUPON_STATUS_BADGE.active;
        return <Badge variant={s.variant}>{s.label}</Badge>;
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
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
          Add Coupon
        </Button>
      </div>

      <Table
        columns={columns}
        data={items}
        selectable
        selectedIds={selectedIds}
        onSelectedIdsChange={setSelectedIds}
        pageSize={10}
        emptyTitle="No coupons yet"
        rowActions={(row) => (
          <>
            <Tooltip content="Edit coupon" side="top">
              <button
                onClick={() => {
                  setEditing(row);
                  setFormOpen(true);
                }}
                className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-primary-600 dark:hover:bg-gray-800"
                aria-label="Edit coupon"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
            </Tooltip>
            {row.status !== "expired" && (
              <Tooltip content={row.status === "active" ? "Disable coupon" : "Activate coupon"} side="top">
                <button
                  onClick={() => handleToggle(row)}
                  className={cn(
                    "flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800",
                    row.status === "active" ? "hover:text-danger" : "hover:text-success"
                  )}
                  aria-label={row.status === "active" ? "Disable coupon" : "Activate coupon"}
                >
                  <Power className="h-3.5 w-3.5" />
                </button>
              </Tooltip>
            )}
            <Tooltip content="Delete coupon" side="top">
              <button onClick={() => setDeleteTarget(row)} className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:bg-danger/10 hover:text-danger" aria-label="Delete coupon">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </Tooltip>
          </>
        )}
      />

      <CouponFormModal isOpen={formOpen} onClose={() => setFormOpen(false)} onSubmit={handleSubmit} initialData={editing} submitting={busy} />

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title={`Delete ${deleteTarget?.code}?`}
        description="This coupon code will no longer work at checkout."
        confirmLabel="Delete"
      />
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
