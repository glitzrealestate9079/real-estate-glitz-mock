import { createListSlice } from "./createListSlice";
import { toLocalISODate } from "@/utils/format";

// Mock listings covering all five property types from the spec (Apartment, Villa, Plot,
// Commercial, PG), each carrying its own type-specific `details` — mirrors the "different
// posting form per property type" requirement. `admin` holds the review-panel checks.
const initialItems = [
  {
    id: "PRP-10234",
    title: "Spacious 2BHK Apartment in Prestige Tower 1",
    propertyType: "Apartment",
    transactionType: "Sell",
    city: "Whitefield, Bangalore",
    price: 7800000,
    postedBy: "agent_ravi",
    postedByRole: "Agent",
    status: "pending",
    submittedDate: "2026-09-18",
    admin: { duplicateCheck: "passed", photoQuality: "passed", ownershipDoc: "pending", phoneVerified: true },
    details: {
      bhk: 2, bathrooms: 2, carpetArea: 1150, floor: 5, totalFloors: 14,
      furnishing: "Semi-Furnished", facing: "East", age: 2, maintenance: 3200, parking: 1,
      amenities: ["Gym", "Pool", "Lift", "Security"],
    },
  },
  {
    id: "PRP-10891",
    title: "Palm Meadows 4BHK Villa",
    propertyType: "Villa",
    transactionType: "Sell",
    city: "Palm Meadows, Bangalore",
    price: 32000000,
    postedBy: "agent_ravi",
    postedByRole: "Agent",
    status: "pending",
    submittedDate: "2026-09-17",
    admin: { duplicateCheck: "passed", photoQuality: "passed", ownershipDoc: "verified", phoneVerified: true, reraLicense: "verified" },
    details: {
      plotArea: 300, plotAreaUnit: "sqyd_gaj", builtUpArea: 3200, floors: "G+2",
      carParking: 2, privateGarden: true, pool: false, boundaryWall: true, facing: "North-East", age: 5,
    },
  },
  {
    id: "PRP-11207",
    title: "Residential Plot, Sector 88",
    propertyType: "Plot",
    transactionType: "Sell",
    city: "Sector 88, Gurugram",
    price: 9500000,
    postedBy: "dealer_shah",
    postedByRole: "Dealer",
    status: "pending",
    submittedDate: "2026-09-19",
    admin: { duplicateCheck: "passed", landUseCertificate: "uploaded", zoningCompliance: "matches", litigationCheck: "not_verified", authorityApproval: "verified" },
    details: {
      plotArea: 200, plotAreaUnit: "sqyd_gaj", dimensions: "40 x 45 ft", facing: "West",
      zoning: "Residential", cornerPlot: true, roadWidth: 40, approvedBy: "DDA / Local Authority",
    },
  },
  {
    id: "PRP-11540",
    title: "Office Space, Cyber Hub",
    propertyType: "Commercial",
    transactionType: "Rent",
    city: "Cyber City, Gurugram",
    price: 240000,
    postedBy: "builder_cyberhub",
    postedByRole: "Builder",
    status: "flagged",
    submittedDate: "2026-09-16",
    admin: { duplicateCheck: "flagged", occupancyCertificate: "verified", commercialZoning: "confirmed", fireSafetyNoc: "pending", reraRegistration: "verified" },
    details: {
      carpetArea: 1800, superBuiltUp: 2200, floor: 3, totalFloors: 9, frontage: 18,
      washrooms: 2, powerBackup: 100, suitableFor: ["Office", "Retail"], leaseOrSale: "Lease",
    },
  },
  {
    id: "PRP-11902",
    title: "Zenith PG for Boys",
    propertyType: "PG",
    transactionType: "PG",
    city: "HSR Layout, Bangalore",
    price: 15000,
    postedBy: "owner_zenith",
    postedByRole: "Owner",
    status: "approved",
    submittedDate: "2026-09-10",
    admin: { duplicateCheck: "passed", pgLicense: "verified", fireSafety: "pending_inspection", ownerIdProof: "verified" },
    details: {
      genderPreference: "Male Only",
      sharingTypes: [{ type: "Single", rent: 15000 }, { type: "Double", rent: 9500 }, { type: "Triple", rent: 7000 }],
      mealsIncluded: "Breakfast + Dinner", furnishing: "Fully Furnished", securityDeposit: 10000,
      noticePeriod: 30, curfew: "11:00 PM",
    },
  },
  {
    id: "PRP-12034",
    title: "1BHK Flat, Kharadi",
    propertyType: "Apartment",
    transactionType: "Rent",
    city: "Kharadi, Pune",
    price: 22000,
    postedBy: "owner_priya",
    postedByRole: "Owner",
    status: "approved",
    submittedDate: "2026-09-08",
    admin: { duplicateCheck: "passed", photoQuality: "passed", ownershipDoc: "verified", phoneVerified: true },
    details: {
      bhk: 1, bathrooms: 1, carpetArea: 620, floor: 3, totalFloors: 10,
      furnishing: "Unfurnished", facing: "South", age: 1, maintenance: 1800, parking: 1, amenities: ["Lift", "Security"],
    },
  },
  {
    id: "PRP-12156",
    title: "3BHK Villa in Sarjapur",
    propertyType: "Villa",
    transactionType: "Sell",
    city: "Sarjapur Road, Bangalore",
    price: 21000000,
    postedBy: "agent_ravi",
    postedByRole: "Agent",
    status: "rejected",
    rejectionReason: "Ownership documents do not match the RERA filing — please re-upload the sale deed.",
    submittedDate: "2026-09-05",
    admin: { duplicateCheck: "passed", photoQuality: "passed", ownershipDoc: "mismatch", phoneVerified: true },
    details: {
      plotArea: 240, plotAreaUnit: "sqyd_gaj", builtUpArea: 2650, floors: "G+1",
      carParking: 2, privateGarden: true, pool: false, boundaryWall: true, facing: "East", age: 3,
    },
  },
  {
    id: "PRP-12280",
    title: "Sector 62 IT Park Office Floor",
    propertyType: "Commercial",
    transactionType: "Sell",
    city: "Sector 62, Noida",
    price: 42000000,
    postedBy: "builder_cyberhub",
    postedByRole: "Builder",
    status: "pending",
    submittedDate: "2026-09-20",
    admin: { duplicateCheck: "passed", occupancyCertificate: "pending", commercialZoning: "confirmed", fireSafetyNoc: "verified", reraRegistration: "verified" },
    details: {
      carpetArea: 4200, superBuiltUp: 5100, floor: 6, totalFloors: 12, frontage: 30,
      washrooms: 4, powerBackup: 100, suitableFor: ["Office", "IT/ITES"], leaseOrSale: "Sale",
    },
  },
  {
    id: "PRP-12390",
    title: "Green Acres Farm Plot",
    propertyType: "Plot",
    transactionType: "Sell",
    city: "Sohna Road, Gurugram",
    price: 18500000,
    postedBy: "dealer_shah",
    postedByRole: "Dealer",
    status: "approved",
    submittedDate: "2026-08-29",
    admin: { duplicateCheck: "passed", landUseCertificate: "uploaded", zoningCompliance: "matches", litigationCheck: "clear", authorityApproval: "verified" },
    details: {
      plotArea: 1, plotAreaUnit: "acre", dimensions: "-", facing: "North",
      zoning: "Agricultural", cornerPlot: false, roadWidth: 24, approvedBy: "Gurugram Development Authority",
    },
  },
  {
    id: "PRP-12455",
    title: "Co-ed PG near Hitech City",
    propertyType: "PG",
    transactionType: "PG",
    city: "Hitech City, Hyderabad",
    price: 12000,
    postedBy: "owner_meridian",
    postedByRole: "Owner",
    status: "pending",
    submittedDate: "2026-09-19",
    admin: { duplicateCheck: "passed", pgLicense: "pending_upload", fireSafety: "pending_inspection", ownerIdProof: "verified" },
    details: {
      genderPreference: "Co-ed",
      sharingTypes: [{ type: "Double", rent: 12000 }, { type: "Triple", rent: 9000 }],
      mealsIncluded: "All Meals", furnishing: "Fully Furnished", securityDeposit: 8000,
      noticePeriod: 15, curfew: "12:00 AM",
    },
  },
  {
    id: "PRP-12510",
    title: "Skyline Residency 3BHK",
    propertyType: "Apartment",
    transactionType: "Sell",
    city: "Bandra West, Mumbai",
    price: 24000000,
    postedBy: "agent_desai",
    postedByRole: "Agent",
    status: "flagged",
    submittedDate: "2026-09-15",
    admin: { duplicateCheck: "flagged", photoQuality: "passed", ownershipDoc: "pending", phoneVerified: false },
    details: {
      bhk: 3, bathrooms: 3, carpetArea: 1850, floor: 12, totalFloors: 22,
      furnishing: "Semi-Furnished", facing: "West", age: 4, maintenance: 6800, parking: 2, amenities: ["Gym", "Pool", "Clubhouse", "Security", "Power Backup"],
    },
  },
  {
    id: "PRP-12588",
    title: "Baner Heights Studio",
    propertyType: "Apartment",
    transactionType: "Rent",
    city: "Baner, Pune",
    price: 18000,
    postedBy: "owner_kulkarni",
    postedByRole: "Owner",
    status: "approved",
    submittedDate: "2026-09-02",
    admin: { duplicateCheck: "passed", photoQuality: "passed", ownershipDoc: "verified", phoneVerified: true },
    details: {
      bhk: 1, bathrooms: 1, carpetArea: 620, floor: 2, totalFloors: 6,
      furnishing: "Semi-Furnished", facing: "North", age: 2, maintenance: 1500, parking: 1, amenities: ["Lift"],
    },
  },
];

function addDays(dateStr, days) {
  const [y, m, d] = dateStr.split("-").map(Number);
  return toLocalISODate(new Date(y, m - 1, d + days));
}

// One representative photo per property type (Plot has none — a stock interior/exterior shot
// would misrepresent vacant land, so its table thumbnail falls back to the type icon instead).
// Reused across listings of the same type rather than sourcing 11 unique photos, since this is a
// small table thumbnail, not a storefront listing card.
const TYPE_IMAGE = {
  Apartment:
    "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/49/Modern_living_room_with_stylish_furniture_and_a_view_of_the_outdoors_in_a_cozy_apartment_setting.jpg/960px-Modern_living_room_with_stylish_furniture_and_a_view_of_the_outdoors_in_a_cozy_apartment_setting.jpg",
  Villa:
    "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/57/3D_Rendering_of_Modern_Luxury_Villa_Exterior_with_Pool.jpg/960px-3D_Rendering_of_Modern_Luxury_Villa_Exterior_with_Pool.jpg",
  Commercial:
    "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/9a/DFC_3488_Modern_high-rise_office_building_framed_against_a_bright_blue_sky_with_scattered_clouds.jpg/960px-DFC_3488_Modern_high-rise_office_building_framed_against_a_bright_blue_sky_with_scattered_clouds.jpg",
  PG: "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/0f/LawrenceScarpa_Cherokee_8268.jpg/960px-LawrenceScarpa_Cherokee_8268.jpg",
};

// Listing expiry/auto-renewal + RERA force-verify (Section 4.2), plus a thumbnail image and
// views/enquiries performance stats — all derived from the base mock data above via a transform
// instead of hand-editing every item, since they apply uniformly regardless of property type.
const initialItemsWithLifecycle = initialItems.map((item, i) => ({
  ...item,
  reraVerified: ["verified"].includes(item.admin?.reraLicense) || ["verified"].includes(item.admin?.reraRegistration) || item.admin?.ownershipDoc === "verified",
  autoRenew: i % 3 !== 2,
  expiryDate: addDays(item.submittedDate, item.status === "approved" ? 60 : 30),
  image: TYPE_IMAGE[item.propertyType] ?? null,
  views: 180 + i * 97 + (item.status === "approved" ? 420 : 0),
  enquiries: 4 + (i % 7) + (item.status === "approved" ? 12 : 0),
}));

const listingsSlice = createListSlice("listings", {
  items: initialItemsWithLifecycle,
  filters: { status: "all", city: "", propertyType: "all", postedBy: "" },
});

export const {
  setItems: setListings,
  setFilters: setListingsFilters,
  resetFilters: resetListingsFilters,
  setSelectedId: setSelectedListingId,
  setLoading: setListingsLoading,
  setError: setListingsError,
  addItem: addListing,
  updateItem: updateListing,
  removeItem: removeListing,
  removeItems: removeListings,
  updateItemStatus: updateListingStatus,
  updateItemsStatus: updateListingsStatus,
} = listingsSlice.actions;

export default listingsSlice.reducer;
