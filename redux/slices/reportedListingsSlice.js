import { createListSlice } from "./createListSlice";

export const REPORT_REASONS = ["Fake Listing", "Duplicate Listing", "Wrong Price", "Already Sold / Rented", "Inappropriate Content", "Fraud / Scam", "Other"];

// A unified fraud/moderation queue — buyer-reported listings land here with a reason taxonomy,
// separate from the Listings module's own approve/reject review (that's the *admin* checking a
// listing before it goes live; this is *buyers* flagging something already live as wrong).
const initialItems = [
  {
    id: "RPT-50001",
    listingId: "PRP-12510",
    listingTitle: "Skyline Residency 3BHK",
    reportedByName: "Rakesh Bhatia",
    reportedByPhone: "+91 98450 11223",
    reason: "Fake Listing",
    details: "Called the number on the listing — it's disconnected. Photos look reused from another site too.",
    status: "reviewing",
    reportedDate: "2026-09-19",
    resolutionNotes: "",
    resolvedDate: null,
  },
  {
    id: "RPT-50002",
    listingId: "PRP-11540",
    listingTitle: "Office Space, Cyber Hub",
    reportedByName: "Simran Kaur",
    reportedByPhone: "+91 97110 44556",
    reason: "Wrong Price",
    details: "Listed at ₹2.4L/mo but the agent quoted ₹3.1L/mo on call — bait pricing.",
    status: "open",
    reportedDate: "2026-09-21",
    resolutionNotes: "",
    resolvedDate: null,
  },
  {
    id: "RPT-50003",
    listingId: "PRP-10891",
    listingTitle: "Palm Meadows 4BHK Villa",
    reportedByName: "Nikhil Joshi",
    reportedByPhone: "+91 90050 22114",
    reason: "Already Sold / Rented",
    details: "Visited the site — the villa was sold three weeks ago per the neighboring owner.",
    status: "open",
    reportedDate: "2026-09-20",
    resolutionNotes: "",
    resolvedDate: null,
  },
  {
    id: "RPT-50004",
    listingId: "PRP-12034",
    listingTitle: "1BHK Flat, Kharadi",
    reportedByName: "Aarti Deshmukh",
    reportedByPhone: "+91 96650 33221",
    reason: "Duplicate Listing",
    details: "Same flat is posted twice under slightly different titles by the same owner.",
    status: "resolved",
    reportedDate: "2026-09-12",
    resolutionNotes: "Confirmed duplicate — older listing removed, this one kept live.",
    resolvedDate: "2026-09-14",
  },
  {
    id: "RPT-50005",
    listingId: "PRP-11902",
    listingTitle: "Zenith PG for Boys",
    reportedByName: "Deepika Rao",
    reportedByPhone: "+91 93330 55662",
    reason: "Inappropriate Content",
    details: "One of the listing photos is unrelated and inappropriate for the platform.",
    status: "dismissed",
    reportedDate: "2026-09-08",
    resolutionNotes: "Reviewed all photos — none were inappropriate, likely a mis-click on the report reason.",
    resolvedDate: "2026-09-09",
  },
  {
    id: "RPT-50006",
    listingId: "PRP-12280",
    listingTitle: "Sector 62 IT Park Office Floor",
    reportedByName: "Manoj Pillai",
    reportedByPhone: "+91 99110 77889",
    reason: "Fraud / Scam",
    details: "Asked for a 'booking token' via UPI before allowing a site visit — this isn't how the platform works.",
    status: "open",
    reportedDate: "2026-09-22",
    resolutionNotes: "",
    resolvedDate: null,
  },
];

const reportedListingsSlice = createListSlice("reportedListings", {
  items: initialItems,
  filters: { status: "all", reason: "all" },
});

export const {
  setItems: setReportedListings,
  setFilters: setReportedListingsFilters,
  resetFilters: resetReportedListingsFilters,
  setSelectedId: setSelectedReportedListingId,
  setLoading: setReportedListingsLoading,
  setError: setReportedListingsError,
  addItem: addReportedListing,
  updateItem: updateReportedListing,
  removeItem: removeReportedListing,
  removeItems: removeReportedListings,
  updateItemStatus: updateReportedListingStatus,
  updateItemsStatus: updateReportedListingsStatus,
} = reportedListingsSlice.actions;

export default reportedListingsSlice.reducer;
