import { createListSlice } from "./createListSlice";

// `items` (via createListSlice) holds admin-saved report configurations (Section 4.8 — name a
// date range + report type, re-run it later). The underlying analytics datasets the charts and
// revenue table read from are static mock series, not CRUD entities, so they live alongside as
// plain extra state.
const initialSavedReports = [
  { id: "RPT-001", name: "Monthly Traffic Overview", type: "Traffic", rangeStart: "2026-08-01", rangeEnd: "2026-08-31", createdBy: "admin", createdDate: "2026-09-01", lastRun: "2026-09-20" },
  { id: "RPT-002", name: "Q3 Conversion Funnel", type: "Conversion Funnel", rangeStart: "2026-07-01", rangeEnd: "2026-09-30", createdBy: "admin", createdDate: "2026-09-15", lastRun: "2026-09-21" },
  { id: "RPT-003", name: "H1 Revenue Summary", type: "Revenue", rangeStart: "2026-01-01", rangeEnd: "2026-06-30", createdBy: "krishna_singh", createdDate: "2026-07-05", lastRun: "2026-09-18" },
  { id: "RPT-004", name: "Weekly Traffic Snapshot", type: "Traffic", rangeStart: "2026-09-14", rangeEnd: "2026-09-20", createdBy: "admin", createdDate: "2026-09-21", lastRun: "2026-09-21" },
  { id: "RPT-005", name: "Agent Conversion Analysis", type: "Conversion Funnel", rangeStart: "2026-06-01", rangeEnd: "2026-08-31", createdBy: "krishna_singh", createdDate: "2026-09-02", lastRun: "2026-09-19" },
  { id: "RPT-006", name: "September Revenue Report", type: "Revenue", rangeStart: "2026-09-01", rangeEnd: "2026-09-30", createdBy: "admin", createdDate: "2026-09-21", lastRun: "2026-09-22" },
];

const trafficTrend = [
  { month: "Jan", pageViews: 42000, uniqueVisitors: 18400 },
  { month: "Feb", pageViews: 45200, uniqueVisitors: 19800 },
  { month: "Mar", pageViews: 48900, uniqueVisitors: 21200 },
  { month: "Apr", pageViews: 51200, uniqueVisitors: 22600 },
  { month: "May", pageViews: 55800, uniqueVisitors: 24800 },
  { month: "Jun", pageViews: 59200, uniqueVisitors: 26400 },
  { month: "Jul", pageViews: 54100, uniqueVisitors: 24100 },
  { month: "Aug", pageViews: 58700, uniqueVisitors: 26800 },
  { month: "Sep", pageViews: 63200, uniqueVisitors: 29400 },
  { month: "Oct", pageViews: 66800, uniqueVisitors: 31200 },
  { month: "Nov", pageViews: 70400, uniqueVisitors: 33800 },
  { month: "Dec", pageViews: 75200, uniqueVisitors: 36600 },
];

// Search -> View -> Contact -> Deal, each stage's count relative to the stage above it.
const conversionFunnel = [
  { stage: "Search", count: 128400 },
  { stage: "View", count: 79608 },
  { stage: "Contact", count: 35952 },
  { stage: "Deal", count: 11556 },
];

const revenueReport = [
  { month: "Jan", basic: 420000, featured: 680000, premium: 510000 },
  { month: "Feb", basic: 460000, featured: 720000, premium: 560000 },
  { month: "Mar", basic: 410000, featured: 760000, premium: 640000 },
  { month: "Apr", basic: 500000, featured: 810000, premium: 600000 },
  { month: "May", basic: 480000, featured: 860000, premium: 720000 },
  { month: "Jun", basic: 540000, featured: 900000, premium: 780000 },
];

const reportsSlice = createListSlice("reports", {
  items: initialSavedReports,
  filters: { type: "all" },
  trafficTrend,
  conversionFunnel,
  revenueReport,
});

export const {
  setItems: setSavedReports,
  setFilters: setReportsFilters,
  resetFilters: resetReportsFilters,
  setSelectedId: setSelectedReportId,
  setLoading: setReportsLoading,
  setError: setReportsError,
  addItem: addSavedReport,
  updateItem: updateSavedReport,
  removeItem: removeSavedReport,
  removeItems: removeSavedReports,
} = reportsSlice.actions;

export default reportsSlice.reducer;
