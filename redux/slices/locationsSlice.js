import { createListSlice } from "./createListSlice";

// Flat list with `type` (country/state/city/locality) + `parentId` — easier to filter/search/edit
// in a table than a nested tree, and the page derives the drill-down view from it. City names
// match the ones already used across the dashboard, listings and site-visits mock data so the
// hierarchy feels like it's describing the same platform, not a separate dataset.
const initialItems = [
  { id: "LOC-country-in", name: "India", type: "country", parentId: null, status: "active", propertiesCount: 12842 },

  { id: "LOC-state-mh", name: "Maharashtra", type: "state", parentId: "LOC-country-in", status: "active", propertiesCount: 5260 },
  { id: "LOC-state-ka", name: "Karnataka", type: "state", parentId: "LOC-country-in", status: "active", propertiesCount: 2890 },
  { id: "LOC-state-hr", name: "Haryana", type: "state", parentId: "LOC-country-in", status: "active", propertiesCount: 1520 },
  { id: "LOC-state-tg", name: "Telangana", type: "state", parentId: "LOC-country-in", status: "active", propertiesCount: 1340 },
  { id: "LOC-state-tn", name: "Tamil Nadu", type: "state", parentId: "LOC-country-in", status: "active", propertiesCount: 890 },
  { id: "LOC-state-kl", name: "Kerala", type: "state", parentId: "LOC-country-in", status: "active", propertiesCount: 520 },
  { id: "LOC-state-rj", name: "Rajasthan", type: "state", parentId: "LOC-country-in", status: "inactive", propertiesCount: 210 },

  { id: "LOC-city-mumbai", name: "Mumbai", type: "city", parentId: "LOC-state-mh", status: "active", propertiesCount: 3420 },
  { id: "LOC-city-pune", name: "Pune", type: "city", parentId: "LOC-state-mh", status: "active", propertiesCount: 1680 },
  { id: "LOC-city-bengaluru", name: "Bengaluru", type: "city", parentId: "LOC-state-ka", status: "active", propertiesCount: 2890 },
  { id: "LOC-city-gurugram", name: "Gurugram", type: "city", parentId: "LOC-state-hr", status: "active", propertiesCount: 1520 },
  { id: "LOC-city-hyderabad", name: "Hyderabad", type: "city", parentId: "LOC-state-tg", status: "active", propertiesCount: 1340 },
  { id: "LOC-city-chennai", name: "Chennai", type: "city", parentId: "LOC-state-tn", status: "active", propertiesCount: 890 },
  { id: "LOC-city-kochi", name: "Kochi", type: "city", parentId: "LOC-state-kl", status: "active", propertiesCount: 520 },
  { id: "LOC-city-jaipur", name: "Jaipur", type: "city", parentId: "LOC-state-rj", status: "inactive", propertiesCount: 210 },

  { id: "LOC-loc-bandra-west", name: "Bandra West", type: "locality", parentId: "LOC-city-mumbai", status: "active", propertiesCount: 640 },
  { id: "LOC-loc-andheri-west", name: "Andheri West", type: "locality", parentId: "LOC-city-mumbai", status: "active", propertiesCount: 580 },
  { id: "LOC-loc-baner", name: "Baner", type: "locality", parentId: "LOC-city-pune", status: "active", propertiesCount: 410 },
  { id: "LOC-loc-kharadi", name: "Kharadi", type: "locality", parentId: "LOC-city-pune", status: "active", propertiesCount: 320 },
  { id: "LOC-loc-whitefield", name: "Whitefield", type: "locality", parentId: "LOC-city-bengaluru", status: "active", propertiesCount: 720 },
  { id: "LOC-loc-koramangala", name: "Koramangala", type: "locality", parentId: "LOC-city-bengaluru", status: "active", propertiesCount: 510 },
  { id: "LOC-loc-cybercity", name: "Cyber City", type: "locality", parentId: "LOC-city-gurugram", status: "active", propertiesCount: 460 },
  { id: "LOC-loc-sector88", name: "Sector 88", type: "locality", parentId: "LOC-city-gurugram", status: "active", propertiesCount: 180 },
  { id: "LOC-loc-hitechcity", name: "Hitech City", type: "locality", parentId: "LOC-city-hyderabad", status: "active", propertiesCount: 390 },
  { id: "LOC-loc-malviyanagar", name: "Malviya Nagar", type: "locality", parentId: "LOC-city-jaipur", status: "inactive", propertiesCount: 95 },
];

const TYPE_ORDER = ["country", "state", "city", "locality"];

const locationsSlice = createListSlice("locations", {
  items: initialItems,
  filters: {},
});

export const {
  setItems: setLocations,
  setFilters: setLocationsFilters,
  resetFilters: resetLocationsFilters,
  setSelectedId: setSelectedLocationId,
  setLoading: setLocationsLoading,
  setError: setLocationsError,
  addItem: addLocation,
  updateItem: updateLocation,
  removeItem: removeLocation,
  removeItems: removeLocations,
  updateItemStatus: updateLocationStatus,
  updateItemsStatus: updateLocationsStatus,
} = locationsSlice.actions;

export { TYPE_ORDER };
export default locationsSlice.reducer;
