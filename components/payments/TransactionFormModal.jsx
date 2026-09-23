"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { useAppSelector } from "@/hooks/useReduxHooks";
import { todayISO } from "@/utils/format";

const METHODS = ["UPI", "Card", "NetBanking", "Wallet", "N/A"];
const STATUSES = ["success", "pending", "failed", "refunded"];

const schema = yup.object({
  userName: yup.string().trim().required("User / buyer name is required"),
  planName: yup.string().required("Select a plan"),
  amount: yup.number().typeError("Enter a valid amount").min(0, "Can't be negative").required("Amount is required"),
  method: yup.string().oneOf(METHODS).required("Select a payment method"),
  status: yup.string().oneOf(STATUSES).required("Select a status"),
  transactionDate: yup.string().required("Date is required"),
});

const DEFAULT_VALUES = {
  userName: "",
  planName: "",
  amount: "",
  method: "UPI",
  status: "success",
  transactionDate: todayISO(),
};

/** Add/Edit modal for a manually-recorded transaction (e.g. an offline / bank-transfer payment). */
export default function TransactionFormModal({ isOpen, onClose, onSubmit, initialData, submitting }) {
  const isEdit = Boolean(initialData);
  const plans = useAppSelector((state) => state.payments.plans);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ resolver: yupResolver(schema), defaultValues: DEFAULT_VALUES });

  useEffect(() => {
    if (isOpen) {
      reset(
        initialData
          ? {
              userName: initialData.userName,
              planName: initialData.planName,
              amount: initialData.amount,
              method: initialData.method,
              status: initialData.status,
              transactionDate: initialData.transactionDate,
            }
          : DEFAULT_VALUES
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, initialData]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      title={isEdit ? `Edit Transaction — ${initialData?.id}` : "Add Transaction"}
      description="Use this to log an offline / bank-transfer payment into the ledger."
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit(onSubmit)} loading={submitting}>
            {isEdit ? "Save Changes" : "Add Transaction"}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input label="User / Buyer Name" required error={errors.userName?.message} {...register("userName")} containerClassName="sm:col-span-2" />
        <Select label="Plan" required error={errors.planName?.message} placeholder="Select a plan" {...register("planName")}>
          {plans.map((p) => (
            <option key={p.id} value={p.name}>
              {p.name}
            </option>
          ))}
        </Select>
        <Input label="Amount (₹)" type="number" required error={errors.amount?.message} {...register("amount")} />
        <Select label="Payment Method" required error={errors.method?.message} {...register("method")}>
          {METHODS.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </Select>
        <Select label="Status" required error={errors.status?.message} {...register("status")}>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </option>
          ))}
        </Select>
        <Input label="Transaction Date" type="date" required error={errors.transactionDate?.message} {...register("transactionDate")} containerClassName="sm:col-span-2" />
      </form>
    </Modal>
  );
}
