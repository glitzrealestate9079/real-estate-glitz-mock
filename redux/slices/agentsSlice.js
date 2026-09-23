import { createListSlice } from "./createListSlice";

// Agents module is a business-performance view of the same Agent-role people already in
// usersSlice (Users & Agents stays the trust/safety + KYC/RERA view). Each record carries
// `userId` so the page can live-join site visits (siteVisits.agentId). `slug` is the same
// username convention listingsSlice (`postedBy`) and leadsSlice (`assignedTo`) already use
// ("agent_ravi", "agent_desai", ...), so properties and leads are also live-joined rather than
// stored as separate counts that could drift out of sync with those modules.
const initialItems = [
  {
    id: "AGT-1001",
    userId: "USR-20001",
    name: "Ravi Mehta",
    email: "ravi.mehta@example.com",
    phone: "+91 98765 43210",
    agency: "Mehta Realty",
    city: "Bangalore",
    reraNumber: "KA-RERA-12345",
    rating: 4.8,
    specializations: ["Apartments", "Villas"],
    joinedDate: "2025-11-02",
    status: "active",
    slug: "agent_ravi",
  },
  {
    id: "AGT-1002",
    userId: "USR-20065",
    name: "Vikram Desai",
    email: "vikram.desai@example.com",
    phone: "+91 98450 22110",
    agency: "Desai Associates",
    city: "Mumbai",
    reraNumber: "MH-RERA-44210",
    rating: 4.3,
    specializations: ["Apartments", "Commercial"],
    joinedDate: "2025-09-18",
    status: "active",
    slug: "agent_desai",
  },
  {
    id: "AGT-1003",
    userId: "USR-20089",
    name: "Arjun Nair",
    email: "arjun.nair@nairrealty.example.com",
    phone: "+91 94470 55123",
    agency: "Nair Realty Associates",
    city: "Kochi",
    reraNumber: "KL-RERA-77341",
    rating: 4.6,
    specializations: ["PG / Co-living"],
    joinedDate: "2026-06-01",
    status: "active",
    slug: "agent_nair",
  },
  {
    id: "AGT-1004",
    userId: "USR-20140",
    name: "Deepak Verma",
    email: "deepak.verma@example.com",
    phone: "+91 90030 66778",
    agency: "Verma & Co. Estates",
    city: "Chennai",
    reraNumber: "TN-RERA-33012",
    rating: 4.1,
    specializations: ["Villas", "Plots"],
    joinedDate: "2025-12-05",
    status: "active",
    slug: "agent_verma",
  },
];

const agentsSlice = createListSlice("agents", {
  items: initialItems,
  filters: { status: "all", city: "all" },
});

export const {
  setItems: setAgents,
  setFilters: setAgentsFilters,
  resetFilters: resetAgentsFilters,
  setSelectedId: setSelectedAgentId,
  setLoading: setAgentsLoading,
  setError: setAgentsError,
  addItem: addAgent,
  updateItem: updateAgent,
  removeItem: removeAgent,
  removeItems: removeAgents,
  updateItemStatus: updateAgentStatus,
  updateItemsStatus: updateAgentsStatus,
} = agentsSlice.actions;

export default agentsSlice.reducer;
