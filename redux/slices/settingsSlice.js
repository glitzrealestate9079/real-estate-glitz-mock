import { createSlice } from "@reduxjs/toolkit";

// Section 4.10 — four related entities: staff/admin accounts with roles, notification message
// templates, API key management, and a read-only audit log. Same custom-reducer shape as
// paymentsSlice/cmsSlice rather than forcing everything through the single-list factory.

const initialAdminUsers = [
  { id: "ADM-001", name: "Krishna Singh", email: "krishna.singh@example.com", role: "Super Admin", status: "active", lastLogin: "2026-09-22", createdDate: "2025-01-10" },
  { id: "ADM-002", name: "Anjali Verma", email: "anjali.verma@example.com", role: "Moderator", status: "active", lastLogin: "2026-09-21", createdDate: "2025-03-15" },
  { id: "ADM-003", name: "Rohit Malhotra", email: "rohit.malhotra@example.com", role: "Support", status: "active", lastLogin: "2026-09-20", createdDate: "2025-06-01" },
  { id: "ADM-004", name: "Sneha Kulkarni", email: "sneha.kulkarni@example.com", role: "Finance", status: "active", lastLogin: "2026-09-19", createdDate: "2025-08-20" },
  { id: "ADM-005", name: "Former Employee", email: "former.employee@example.com", role: "Moderator", status: "suspended", lastLogin: "2026-07-01", createdDate: "2024-11-05" },
];

const initialTemplates = [
  { id: "TPL-001", name: "Welcome Email", channel: "Email", subject: "Welcome to Real Estate Admin!", message: "Hi {{name}}, thanks for joining — start browsing verified listings today.", status: "active", lastUpdated: "2026-08-01" },
  { id: "TPL-002", name: "OTP Verification", channel: "SMS", subject: "", message: "Your OTP is {{otp}}. Valid for 10 minutes. Do not share this with anyone.", status: "active", lastUpdated: "2026-07-10" },
  { id: "TPL-003", name: "Listing Approved", channel: "WhatsApp", subject: "", message: "Great news! Your listing {{listingTitle}} has been approved and is now live.", status: "active", lastUpdated: "2026-08-15" },
  { id: "TPL-004", name: "New Lead Alert", channel: "Push", subject: "", message: "You have a new enquiry for {{listingTitle}}.", status: "active", lastUpdated: "2026-09-01" },
  { id: "TPL-005", name: "Payment Receipt", channel: "Email", subject: "Your payment receipt", message: "Hi {{name}}, we've received your payment of {{amount}}. Thank you!", status: "active", lastUpdated: "2026-08-20" },
  { id: "TPL-006", name: "Account Suspended", channel: "Email", subject: "Your account has been suspended", message: "Hi {{name}}, your account has been suspended. Contact support for details.", status: "inactive", lastUpdated: "2026-06-01" },
];

const initialApiKeys = [
  { id: "KEY-001", name: "Payment Gateway (Razorpay)", keyMasked: "rzp_live_••••••••wXyz", environment: "Production", status: "active", createdDate: "2025-02-01", lastUsed: "2026-09-22" },
  { id: "KEY-002", name: "SMS Gateway (Twilio)", keyMasked: "SK••••••••••••4f2a", environment: "Production", status: "active", createdDate: "2025-04-10", lastUsed: "2026-09-21" },
  { id: "KEY-003", name: "Maps API (Google)", keyMasked: "AIza••••••••••••9pLm", environment: "Production", status: "active", createdDate: "2025-01-15", lastUsed: "2026-09-22" },
  { id: "KEY-004", name: "Payment Gateway (Sandbox Test)", keyMasked: "rzp_test_••••••••8qRt", environment: "Sandbox", status: "revoked", createdDate: "2025-06-01", lastUsed: "2026-05-10" },
];

// Read-only — audit logs are append-only by nature, so this tab has no add/edit/delete.
const auditLog = [
  { id: "LOG-001", timestamp: "2026-09-22 14:05", admin: "krishna_singh", action: "Approved listing PRP-12280", module: "Listings" },
  { id: "LOG-002", timestamp: "2026-09-22 13:40", admin: "admin", action: "Warned user Ravi Mehta", module: "Users" },
  { id: "LOG-003", timestamp: "2026-09-21 18:20", admin: "krishna_singh", action: "Refunded transaction TXN-50001", module: "Payments" },
  { id: "LOG-004", timestamp: "2026-09-21 16:15", admin: "anjali_verma", action: "Rejected review REV-40003", module: "Reviews" },
  { id: "LOG-005", timestamp: "2026-09-21 11:00", admin: "admin", action: "Deleted lead LED-30009", module: "Leads" },
  { id: "LOG-006", timestamp: "2026-09-20 09:30", admin: "krishna_singh", action: "Suspended builder Meridian Properties", module: "Builders" },
  { id: "LOG-007", timestamp: "2026-09-19 17:45", admin: "sneha_kulkarni", action: "Exported revenue report to CSV", module: "Reports" },
  { id: "LOG-008", timestamp: "2026-09-19 10:10", admin: "admin", action: "Published article \"New Metro Line to Boost Property Prices\"", module: "CMS" },
  { id: "LOG-009", timestamp: "2026-09-18 15:00", admin: "krishna_singh", action: "Created coupon FESTIVE20", module: "Payments" },
  { id: "LOG-010", timestamp: "2026-09-17 08:20", admin: "rohit_malhotra", action: "Logged in", module: "Auth" },
];

// Category & locality master data (Section 4.2) — the option lists other modules' dropdowns
// draw from (property types across Listings, cities used platform-wide).
const initialPropertyTypes = ["Apartment", "Villa", "Plot", "Commercial", "PG"];
const initialCities = ["Bangalore", "Mumbai", "Gurugram", "Pune", "Hyderabad", "Delhi", "Noida", "Chennai", "Kochi"];

const initialState = {
  adminUsers: initialAdminUsers,
  templates: initialTemplates,
  apiKeys: initialApiKeys,
  auditLog,
  propertyTypes: initialPropertyTypes,
  cities: initialCities,
  filters: {},
};

const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    addAdminUser(state, action) {
      state.adminUsers.unshift(action.payload);
    },
    updateAdminUser(state, action) {
      const i = state.adminUsers.findIndex((a) => a.id === action.payload.id);
      if (i !== -1) state.adminUsers[i] = { ...state.adminUsers[i], ...action.payload };
    },
    removeAdminUser(state, action) {
      state.adminUsers = state.adminUsers.filter((a) => a.id !== action.payload);
    },

    addTemplate(state, action) {
      state.templates.unshift(action.payload);
    },
    updateTemplate(state, action) {
      const i = state.templates.findIndex((t) => t.id === action.payload.id);
      if (i !== -1) state.templates[i] = { ...state.templates[i], ...action.payload };
    },
    removeTemplate(state, action) {
      state.templates = state.templates.filter((t) => t.id !== action.payload);
    },

    addApiKey(state, action) {
      state.apiKeys.unshift(action.payload);
    },
    updateApiKey(state, action) {
      const i = state.apiKeys.findIndex((k) => k.id === action.payload.id);
      if (i !== -1) state.apiKeys[i] = { ...state.apiKeys[i], ...action.payload };
    },
    removeApiKey(state, action) {
      state.apiKeys = state.apiKeys.filter((k) => k.id !== action.payload);
    },

    addPropertyType(state, action) {
      if (!state.propertyTypes.includes(action.payload)) state.propertyTypes.push(action.payload);
    },
    removePropertyType(state, action) {
      state.propertyTypes = state.propertyTypes.filter((t) => t !== action.payload);
    },
    addCity(state, action) {
      if (!state.cities.includes(action.payload)) state.cities.push(action.payload);
    },
    removeCity(state, action) {
      state.cities = state.cities.filter((c) => c !== action.payload);
    },
  },
});

export const {
  addAdminUser,
  updateAdminUser,
  removeAdminUser,
  addTemplate,
  updateTemplate,
  removeTemplate,
  addApiKey,
  updateApiKey,
  removeApiKey,
  addPropertyType,
  removePropertyType,
  addCity,
  removeCity,
} = settingsSlice.actions;

export default settingsSlice.reducer;
