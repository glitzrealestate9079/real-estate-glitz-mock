import { createSlice } from "@reduxjs/toolkit";

// Section 4.11 / 9 — a master township entity with linked sub-project "phases" (each phase can
// be measured in a different unit), plus a unit-conversion master table with a state-wise Bigha
// override (Bigha has no fixed size — it varies by state). Same custom-reducer shape as
// paymentsSlice/cmsSlice/settingsSlice.

const initialTownships = [
  {
    id: "TWN-001",
    name: "Green Acres Integrated Township",
    reraUmbrellaNo: "HR-RERA-TWN-2021-001",
    location: "Sohna Road, Gurugram",
    totalAreaValue: 500,
    totalAreaUnit: "acre",
    masterPlanLabel: "green-acres-masterplan-v3.pdf",
    status: "active",
    phases: [
      { id: "PH-01", name: "Phase 1 — Residential Towers", type: "Residential", areaValue: 120, areaUnit: "acre", status: "completed", totalUnits: 1200, launchDate: "2023-05-01" },
      { id: "PH-02", name: "Phase 2 — Commercial Boulevard", type: "Commercial", areaValue: 45, areaUnit: "acre", status: "under_construction", totalUnits: 80, launchDate: "2024-08-01" },
      { id: "PH-03", name: "Phase 3 — Villas & Clubhouse", type: "Residential", areaValue: 80, areaUnit: "acre", status: "planned", totalUnits: 300, launchDate: "2026-11-01" },
    ],
  },
  {
    id: "TWN-002",
    name: "Palm Meadows Estate",
    reraUmbrellaNo: "KA-RERA-TWN-2020-045",
    location: "Whitefield, Bangalore",
    totalAreaValue: 250,
    totalAreaUnit: "acre",
    masterPlanLabel: "palm-meadows-masterplan.pdf",
    status: "active",
    phases: [
      { id: "PH-04", name: "Phase 1 — Villas", type: "Residential", areaValue: 100, areaUnit: "acre", status: "completed", totalUnits: 400, launchDate: "2021-01-01" },
      { id: "PH-05", name: "Phase 2 — Apartments", type: "Residential", areaValue: 150, areaUnit: "acre", status: "under_construction", totalUnits: 900, launchDate: "2024-01-01" },
    ],
  },
  {
    id: "TWN-003",
    name: "Cyberhub Integrated Business District",
    reraUmbrellaNo: "HR-RERA-TWN-2022-012",
    location: "Cyber City, Gurugram",
    totalAreaValue: 180,
    totalAreaUnit: "acre",
    masterPlanLabel: "cyberhub-district-masterplan.pdf",
    status: "planning",
    phases: [{ id: "PH-06", name: "Phase 1 — Office Towers", type: "Commercial", areaValue: 90, areaUnit: "acre", status: "planned", totalUnits: 12, launchDate: "2027-03-01" }],
  },
  {
    id: "TWN-004",
    name: "Riverside Heritage Township",
    reraUmbrellaNo: "UP-RERA-TWN-2019-008",
    location: "Sector 150, Noida",
    totalAreaValue: 8000000,
    totalAreaUnit: "sqft",
    masterPlanLabel: "riverside-masterplan-final.pdf",
    status: "completed",
    phases: [
      { id: "PH-07", name: "Phase 1", type: "Residential", areaValue: 5000000, areaUnit: "sqft", status: "completed", totalUnits: 2000, launchDate: "2019-06-01" },
      { id: "PH-08", name: "Phase 2 — Mixed Use", type: "Mixed-Use", areaValue: 3000000, areaUnit: "sqft", status: "completed", totalUnits: 600, launchDate: "2020-11-01" },
    ],
  },
];

// All rates convert into the base unit (sqft). Bigha has no single national size, so it's kept
// as a separate state -> sqft lookup instead of one fixed rate.
const initialConversionRates = {
  baseUnit: "sqft",
  rates: { sqft: 1, sqyd_gaj: 9, sqm: 10.7639, acre: 43560 },
  bighaByState: {
    Punjab: 9070,
    Haryana: 27225,
    "Uttar Pradesh": 27000,
    Rajasthan: 27225,
    "West Bengal": 14400,
    Bihar: 27220,
    Gujarat: 17424,
    Assam: 14400,
  },
};

// Reorder/feature phases + township-level combined analytics (Section 4.11) — added via a
// transform so the base mock data above doesn't need per-phase edits for fields that apply
// uniformly (view/lead counts scale roughly with unit count; the first phase in each township
// starts featured, as a realistic default).
const townshipsWithAnalytics = initialTownships.map((t) => ({
  ...t,
  phases: t.phases.map((p, i) => ({
    ...p,
    featured: i === 0,
    views: p.totalUnits * 40 + i * 130,
    leads: Math.round(p.totalUnits * 2.4) + i * 6,
  })),
}));

const initialState = {
  townships: townshipsWithAnalytics,
  conversionRates: initialConversionRates,
  filters: { status: "all" },
};

const townshipSlice = createSlice({
  name: "township",
  initialState,
  reducers: {
    addTownship(state, action) {
      state.townships.unshift(action.payload);
    },
    updateTownship(state, action) {
      const i = state.townships.findIndex((t) => t.id === action.payload.id);
      if (i !== -1) state.townships[i] = { ...state.townships[i], ...action.payload };
    },
    removeTownship(state, action) {
      state.townships = state.townships.filter((t) => t.id !== action.payload);
    },
    removeTownships(state, action) {
      const ids = new Set(action.payload);
      state.townships = state.townships.filter((t) => !ids.has(t.id));
    },
    updateConversionRates(state, action) {
      state.conversionRates = {
        ...state.conversionRates,
        rates: { ...state.conversionRates.rates, ...action.payload.rates },
        bighaByState: { ...state.conversionRates.bighaByState, ...action.payload.bighaByState },
      };
    },
  },
});

export const { addTownship, updateTownship, removeTownship, removeTownships, updateConversionRates } = townshipSlice.actions;

export default townshipSlice.reducer;
