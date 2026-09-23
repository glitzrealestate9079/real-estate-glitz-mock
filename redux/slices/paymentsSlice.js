import { createSlice } from "@reduxjs/toolkit";

// This module covers three related entities from Section 4.5 — pricing plans, the transaction
// log (with refunds) and coupon codes — so unlike the single-table modules it doesn't use the
// createListSlice factory; each collection gets its own small set of CRUD reducers below.

const initialPlans = [
  {
    id: "PLN-001",
    name: "Free",
    price: 0,
    billingCycle: "One-time",
    validityDays: 30,
    listingsIncluded: "1",
    featuredCredits: 0,
    features: ["1 active listing", "Basic search visibility", "Email support"],
    active: true,
    popular: false,
  },
  {
    id: "PLN-002",
    name: "Basic",
    price: 999,
    billingCycle: "Monthly",
    validityDays: 30,
    listingsIncluded: "5",
    featuredCredits: 0,
    features: ["5 active listings", "Higher search ranking", "Phone + email support"],
    active: true,
    popular: false,
  },
  {
    id: "PLN-003",
    name: "Featured",
    price: 2499,
    billingCycle: "Monthly",
    validityDays: 30,
    listingsIncluded: "10",
    featuredCredits: 3,
    features: ["10 active listings", "3 featured placements", "Homepage rotation", "Priority support"],
    active: true,
    popular: true,
  },
  {
    id: "PLN-004",
    name: "Premium",
    price: 4999,
    billingCycle: "Monthly",
    validityDays: 30,
    listingsIncluded: "25",
    featuredCredits: 10,
    features: ["25 active listings", "10 featured placements", "Verified badge", "Dedicated account manager"],
    active: true,
    popular: false,
  },
  {
    id: "PLN-005",
    name: "Top / Builder Elite",
    price: 9999,
    billingCycle: "Quarterly",
    validityDays: 90,
    listingsIncluded: "Unlimited",
    featuredCredits: 25,
    features: ["Unlimited listings", "25 featured placements", "Micro-site for project", "Top search placement"],
    active: true,
    popular: false,
  },
];

const initialCoupons = [
  {
    id: "CPN-001",
    code: "WELCOME50",
    discountType: "percentage",
    discountValue: 50,
    applicablePlans: "All Plans",
    maxUses: 500,
    usedCount: 214,
    expiryDate: "2026-10-31",
    status: "active",
  },
  {
    id: "CPN-002",
    code: "FESTIVE20",
    discountType: "percentage",
    discountValue: 20,
    applicablePlans: "Featured, Premium",
    maxUses: 1000,
    usedCount: 892,
    expiryDate: "2026-09-30",
    status: "active",
  },
  {
    id: "CPN-003",
    code: "FLAT500",
    discountType: "flat",
    discountValue: 500,
    applicablePlans: "All Plans",
    maxUses: 200,
    usedCount: 200,
    expiryDate: "2026-08-15",
    status: "expired",
  },
  {
    id: "CPN-004",
    code: "AGENT10",
    discountType: "percentage",
    discountValue: 10,
    applicablePlans: "Basic, Featured",
    maxUses: 0,
    usedCount: 340,
    expiryDate: "2026-12-31",
    status: "active",
  },
  {
    id: "CPN-005",
    code: "OLDPROMO",
    discountType: "flat",
    discountValue: 200,
    applicablePlans: "All Plans",
    maxUses: 100,
    usedCount: 45,
    expiryDate: "2026-07-01",
    status: "disabled",
  },
];

const initialTransactions = [
  { id: "TXN-50001", invoiceId: "INV-90001", userName: "Ravi Mehta", planName: "Featured", amount: 2499, method: "UPI", status: "success", transactionDate: "2026-09-20" },
  { id: "TXN-50002", invoiceId: "INV-90002", userName: "Ankit Shah", planName: "Premium", amount: 4999, method: "Card", status: "success", transactionDate: "2026-09-19" },
  { id: "TXN-50003", invoiceId: "INV-90003", userName: "Cyberhub Developers Pvt Ltd", planName: "Top / Builder Elite", amount: 9999, method: "NetBanking", status: "pending", transactionDate: "2026-09-21" },
  { id: "TXN-50004", invoiceId: "INV-90004", userName: "Priya Desai", planName: "Basic", amount: 999, method: "Wallet", status: "failed", transactionDate: "2026-09-18" },
  {
    id: "TXN-50005",
    invoiceId: "INV-90005",
    userName: "Vikram Desai",
    planName: "Featured",
    amount: 2499,
    method: "UPI",
    status: "refunded",
    refundReason: "Duplicate charge — accidental double payment, confirmed with buyer.",
    transactionDate: "2026-09-05",
  },
  { id: "TXN-50006", invoiceId: "INV-90006", userName: "Meridian Properties", planName: "Premium", amount: 4999, method: "Card", status: "success", transactionDate: "2026-09-02" },
  { id: "TXN-50007", invoiceId: "INV-90007", userName: "Deepak Verma", planName: "Basic", amount: 999, method: "UPI", status: "success", transactionDate: "2026-09-15" },
  { id: "TXN-50008", invoiceId: "INV-90008", userName: "Arjun Nair", planName: "Free", amount: 0, method: "N/A", status: "success", transactionDate: "2026-09-01" },
  { id: "TXN-50009", invoiceId: "INV-90009", userName: "Neha Kapoor", planName: "Basic", amount: 999, method: "Card", status: "failed", transactionDate: "2026-09-12" },
  { id: "TXN-50010", invoiceId: "INV-90010", userName: "Ankit Shah", planName: "Featured", amount: 2499, method: "UPI", status: "success", transactionDate: "2026-08-25" },
];

const initialState = {
  transactions: initialTransactions,
  plans: initialPlans,
  coupons: initialCoupons,
  filters: { status: "all" },
};

const paymentsSlice = createSlice({
  name: "payments",
  initialState,
  reducers: {
    setFilters(state, action) {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFilters(state) {
      state.filters = {};
    },

    addTransaction(state, action) {
      state.transactions.unshift(action.payload);
    },
    updateTransaction(state, action) {
      const i = state.transactions.findIndex((t) => t.id === action.payload.id);
      if (i !== -1) state.transactions[i] = { ...state.transactions[i], ...action.payload };
    },
    removeTransaction(state, action) {
      state.transactions = state.transactions.filter((t) => t.id !== action.payload);
    },
    removeTransactions(state, action) {
      const ids = new Set(action.payload);
      state.transactions = state.transactions.filter((t) => !ids.has(t.id));
    },

    addPlan(state, action) {
      state.plans.unshift(action.payload);
    },
    updatePlan(state, action) {
      const i = state.plans.findIndex((p) => p.id === action.payload.id);
      if (i !== -1) state.plans[i] = { ...state.plans[i], ...action.payload };
    },
    removePlan(state, action) {
      state.plans = state.plans.filter((p) => p.id !== action.payload);
    },

    addCoupon(state, action) {
      state.coupons.unshift(action.payload);
    },
    updateCoupon(state, action) {
      const i = state.coupons.findIndex((c) => c.id === action.payload.id);
      if (i !== -1) state.coupons[i] = { ...state.coupons[i], ...action.payload };
    },
    removeCoupon(state, action) {
      state.coupons = state.coupons.filter((c) => c.id !== action.payload);
    },
  },
});

export const {
  setFilters: setPaymentsFilters,
  resetFilters: resetPaymentsFilters,
  addTransaction,
  updateTransaction,
  removeTransaction,
  removeTransactions,
  addPlan,
  updatePlan,
  removePlan,
  addCoupon,
  updateCoupon,
  removeCoupon,
} = paymentsSlice.actions;

export default paymentsSlice.reducer;
