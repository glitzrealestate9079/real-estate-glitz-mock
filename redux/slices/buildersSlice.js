import { createListSlice } from "./createListSlice";

// Each builder carries its own nested `projects` array (Section 4.6 — builder profiles, project
// micro-sites with a construction timeline, and new-launch approval). Project-level mutations
// are done by computing a new `projects` array in the page component and merging it back in via
// the generic `updateItem` reducer — no separate nested-reducer plumbing needed.
const initialItems = [
  {
    id: "BLD-001",
    name: "Cyberhub Developers Pvt Ltd",
    slug: "builder_cyberhub",
    reraNumber: "HR-RERA-99871",
    city: "Gurugram",
    establishedYear: 2015,
    createdDate: "2025-05-10",
    status: "active",
    documents: [
      { label: "rera-registration-certificate.pdf", verified: true },
      { label: "company-incorporation-certificate.pdf", verified: true },
    ],
    projects: [
      {
        id: "PRJ-101",
        name: "Cyberhub Business Tower",
        type: "Commercial",
        location: "Cyber City, Gurugram",
        status: "approved",
        launchDate: "2025-06-01",
        possessionDate: "2028-06-30",
        totalUnits: 320,
        unitsAvailable: 210,
        priceRange: "₹85L - ₹3.2Cr",
        constructionStage: "Structure",
        progressPercent: 45,
        reraNumber: "HR-RERA-99871-101",
        amenities: ["Power Backup", "24x7 Security", "Covered Parking", "Cafeteria"],
      },
      {
        id: "PRJ-102",
        name: "Cyberhub Residency Phase 2",
        type: "Residential",
        location: "Sector 62, Gurugram",
        status: "pending_approval",
        launchDate: "2026-11-01",
        possessionDate: "2029-12-31",
        totalUnits: 500,
        unitsAvailable: 500,
        priceRange: "₹65L - ₹1.8Cr",
        constructionStage: "Foundation",
        progressPercent: 5,
        reraNumber: "HR-RERA-99871-102",
        amenities: ["Clubhouse", "Swimming Pool", "Gym", "Kids Play Area", "24x7 Security"],
      },
    ],
  },
  {
    id: "BLD-002",
    name: "Meridian Properties",
    slug: "owner_meridian",
    reraNumber: "TS-RERA-10982",
    city: "Hyderabad",
    establishedYear: 2010,
    createdDate: "2025-02-14",
    status: "active",
    documents: [{ label: "rera-registration-certificate.pdf", verified: true }],
    projects: [
      {
        id: "PRJ-201",
        name: "Meridian Heights",
        type: "Residential",
        location: "Gachibowli, Hyderabad",
        status: "under_construction",
        launchDate: "2024-03-01",
        possessionDate: "2027-03-01",
        totalUnits: 240,
        unitsAvailable: 60,
        priceRange: "₹55L - ₹1.2Cr",
        constructionStage: "Finishing",
        progressPercent: 80,
        reraNumber: "TS-RERA-10982-201",
        amenities: ["Clubhouse", "Swimming Pool", "Landscaped Garden", "Power Backup"],
      },
      {
        id: "PRJ-202",
        name: "Meridian Grand Mall",
        type: "Commercial",
        location: "Hitech City, Hyderabad",
        status: "rejected",
        rejectionReason: "RERA registration for this phase had expired — resubmit an updated certificate.",
        launchDate: "2026-09-01",
        possessionDate: "2029-01-01",
        totalUnits: 150,
        unitsAvailable: 150,
        priceRange: "₹1.2Cr - ₹6Cr",
        constructionStage: "Foundation",
        progressPercent: 0,
        reraNumber: "TS-RERA-10982-202",
        amenities: ["Food Court", "Multiplex", "Escalators", "Covered Parking"],
      },
    ],
  },
  {
    id: "BLD-003",
    name: "Palm Meadows Developers",
    slug: null,
    reraNumber: "KA-RERA-55810",
    city: "Bangalore",
    establishedYear: 2018,
    createdDate: "2025-07-22",
    status: "active",
    documents: [{ label: "rera-registration-certificate.pdf", verified: true }],
    projects: [
      {
        id: "PRJ-301",
        name: "Palm Meadows Villas Phase 3",
        type: "Residential",
        location: "Palm Meadows, Bangalore",
        status: "completed",
        launchDate: "2022-01-01",
        possessionDate: "2024-12-31",
        totalUnits: 80,
        unitsAvailable: 5,
        priceRange: "₹2.8Cr - ₹4.5Cr",
        constructionStage: "Ready to Move",
        progressPercent: 100,
        reraNumber: "KA-RERA-55810-301",
        amenities: ["Private Garden", "Clubhouse", "Swimming Pool", "24x7 Security"],
      },
    ],
  },
  {
    id: "BLD-004",
    name: "Green Acres Township Ltd",
    slug: null,
    reraNumber: "HR-RERA-22019",
    city: "Gurugram",
    establishedYear: 2012,
    createdDate: "2025-01-30",
    status: "suspended",
    documents: [{ label: "rera-registration-certificate.pdf", verified: false }],
    projects: [
      {
        id: "PRJ-401",
        name: "Green Acres Integrated Township",
        type: "Township",
        location: "Sohna Road, Gurugram",
        status: "under_construction",
        launchDate: "2023-05-01",
        possessionDate: "2030-05-01",
        totalUnits: 2500,
        unitsAvailable: 1800,
        priceRange: "₹45L - ₹2.5Cr",
        constructionStage: "Structure",
        progressPercent: 35,
        reraNumber: "HR-RERA-22019-401",
        amenities: ["School", "Hospital", "Shopping Complex", "Parks", "24x7 Security"],
      },
    ],
  },
  {
    id: "BLD-005",
    name: "Skyline Realty",
    slug: null,
    reraNumber: "MH-RERA-77341",
    city: "Mumbai",
    establishedYear: 2020,
    createdDate: "2025-08-05",
    status: "active",
    documents: [
      { label: "rera-registration-certificate.pdf", verified: true },
      { label: "company-incorporation-certificate.pdf", verified: false },
    ],
    projects: [
      {
        id: "PRJ-501",
        name: "Skyline Residency Towers",
        type: "Residential",
        location: "Bandra West, Mumbai",
        status: "pending_approval",
        launchDate: "2026-12-01",
        possessionDate: "2030-06-30",
        totalUnits: 180,
        unitsAvailable: 180,
        priceRange: "₹1.8Cr - ₹5Cr",
        constructionStage: "Foundation",
        progressPercent: 0,
        reraNumber: "MH-RERA-77341-501",
        amenities: ["Clubhouse", "Swimming Pool", "Gym", "Kids Play Area"],
      },
      {
        id: "PRJ-502",
        name: "Skyline Business Bay",
        type: "Commercial",
        location: "Bandra Kurla Complex, Mumbai",
        status: "approved",
        launchDate: "2025-01-01",
        possessionDate: "2028-01-01",
        totalUnits: 60,
        unitsAvailable: 22,
        priceRange: "₹2.5Cr - ₹8Cr",
        constructionStage: "Structure",
        progressPercent: 55,
        reraNumber: "MH-RERA-77341-502",
        amenities: ["Power Backup", "24x7 Security", "Covered Parking", "Conference Center"],
      },
    ],
  },
];

function slugify(name) {
  return name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

// One representative exterior/building photo per project type — Township reuses the villa shot
// (a large low-rise residential development reads similarly) and Mixed-Use reuses the office
// tower shot, since both are closer to those than to a bare land photo.
const PROJECT_TYPE_IMAGE = {
  Residential:
    "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/57/3D_Rendering_of_Modern_Luxury_Villa_Exterior_with_Pool.jpg/960px-3D_Rendering_of_Modern_Luxury_Villa_Exterior_with_Pool.jpg",
  Township:
    "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/57/3D_Rendering_of_Modern_Luxury_Villa_Exterior_with_Pool.jpg/960px-3D_Rendering_of_Modern_Luxury_Villa_Exterior_with_Pool.jpg",
  Commercial:
    "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/9a/DFC_3488_Modern_high-rise_office_building_framed_against_a_bright_blue_sky_with_scattered_clouds.jpg/960px-DFC_3488_Modern_high-rise_office_building_framed_against_a_bright_blue_sky_with_scattered_clouds.jpg",
  "Mixed-Use":
    "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/9a/DFC_3488_Modern_high-rise_office_building_framed_against_a_bright_blue_sky_with_scattered_clouds.jpg/960px-DFC_3488_Modern_high-rise_office_building_framed_against_a_bright_blue_sky_with_scattered_clouds.jpg",
};

// Brochure/floor-plan reference (Section 4.6) + thumbnail image — added via a transform since
// both are derived uniformly (from the project's name and type) rather than needing hand-picked
// values on every project.
const itemsWithBrochures = initialItems.map((builder) => ({
  ...builder,
  projects: builder.projects.map((p) => ({
    ...p,
    brochureLabel: `${slugify(p.name)}-brochure.pdf`,
    image: PROJECT_TYPE_IMAGE[p.type] ?? null,
  })),
}));

const buildersSlice = createListSlice("builders", {
  items: itemsWithBrochures,
  filters: { status: "all" },
});

export const {
  setItems: setBuilders,
  setFilters: setBuildersFilters,
  resetFilters: resetBuildersFilters,
  setSelectedId: setSelectedBuilderId,
  setLoading: setBuildersLoading,
  setError: setBuildersError,
  addItem: addBuilder,
  updateItem: updateBuilder,
  removeItem: removeBuilder,
  removeItems: removeBuilders,
} = buildersSlice.actions;

export default buildersSlice.reducer;
