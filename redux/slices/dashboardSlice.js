import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  kpis: {
    totalListings: 12480,
    pendingApprovals: 46,
    activeUsers: 8342,
    leadsToday: 214,
    revenueMTD: 1842500,
    flaggedListings: 12,
  },
  // Sparkline series for the KPI tiles — small enough to inline rather than fetch.
  sparklines: {
    totalListings: [18, 22, 19, 24, 27, 25, 30, 28, 33, 31, 36, 34],
    pendingApprovals: [30, 28, 32, 26, 24, 22, 20, 23, 19, 17, 15, 18],
    activeUsers: [40, 42, 41, 45, 48, 47, 50, 53, 51, 55, 58, 60],
    leadsToday: [12, 15, 14, 18, 16, 20, 19, 22, 21, 24, 23, 27],
    revenueMTD: [20, 24, 22, 26, 25, 29, 27, 31, 30, 28, 33, 35],
    flaggedListings: [8, 7, 9, 6, 8, 5, 7, 6, 4, 6, 5, 3],
  },
  // Listings & Leads trend, one series per range the dashboard's date-range selector can pick —
  // feeds the area chart. All four use the same {label, listings, leads} shape so the chart
  // component doesn't need range-specific rendering logic.
  trendByRange: {
    daily: [
      { label: "Mon", listings: 38, leads: 19 },
      { label: "Tue", listings: 45, leads: 22 },
      { label: "Wed", listings: 41, leads: 25 },
      { label: "Thu", listings: 52, leads: 28 },
      { label: "Fri", listings: 60, leads: 33 },
      { label: "Sat", listings: 35, leads: 18 },
      { label: "Sun", listings: 29, leads: 15 },
    ],
    weekly: [
      { label: "W1", listings: 210, leads: 95 },
      { label: "W2", listings: 245, leads: 110 },
      { label: "W3", listings: 230, leads: 105 },
      { label: "W4", listings: 268, leads: 120 },
      { label: "W5", listings: 290, leads: 135 },
      { label: "W6", listings: 310, leads: 142 },
      { label: "W7", listings: 275, leads: 128 },
      { label: "W8", listings: 322, leads: 150 },
    ],
    monthly: [
      { label: "Jan", listings: 820, leads: 410 },
      { label: "Feb", listings: 932, leads: 468 },
      { label: "Mar", listings: 901, leads: 520 },
      { label: "Apr", listings: 1034, leads: 489 },
      { label: "May", listings: 1180, leads: 560 },
      { label: "Jun", listings: 1290, leads: 610 },
      { label: "Jul", listings: 1105, leads: 588 },
      { label: "Aug", listings: 1240, leads: 642 },
      { label: "Sep", listings: 1360, leads: 705 },
      { label: "Oct", listings: 1420, leads: 690 },
      { label: "Nov", listings: 1510, leads: 730 },
      { label: "Dec", listings: 1598, leads: 812 },
    ],
    yearly: [
      { label: "2022", listings: 8200, leads: 3800 },
      { label: "2023", listings: 9800, leads: 4500 },
      { label: "2024", listings: 11200, leads: 5300 },
      { label: "2025", listings: 13400, leads: 6400 },
      { label: "2026", listings: 14390, leads: 7224 },
    ],
  },
  // Lead Conversion funnel — feeds the dashboard's horizontal bar/funnel visualization.
  leadFunnel: [
    { stage: "Visitors", count: 48200 },
    { stage: "Enquiries", count: 12400 },
    { stage: "Contacted", count: 8100 },
    { stage: "Site Visits", count: 3400 },
    { stage: "Negotiation", count: 1450 },
    { stage: "Closed", count: 620 },
  ],
  // Revenue by plan type — feeds the dashboard's bar chart.
  revenueByPlan: [
    { month: "Jan", basic: 4.2, standard: 6.8, premium: 5.1 },
    { month: "Feb", basic: 4.6, standard: 7.2, premium: 5.6 },
    { month: "Mar", basic: 4.1, standard: 7.6, premium: 6.4 },
    { month: "Apr", basic: 5.0, standard: 8.1, premium: 6.0 },
    { month: "May", basic: 4.8, standard: 8.6, premium: 7.2 },
    { month: "Jun", basic: 5.4, standard: 9.0, premium: 7.8 },
  ],
  topCities: [
    { city: "Mumbai", units: 2840, percent: 92 },
    { city: "Bengaluru", units: 2415, percent: 84 },
    { city: "Pune", units: 1860, percent: 71 },
    { city: "Gurugram", units: 1520, percent: 63 },
    { city: "Hyderabad", units: 1180, percent: 52 },
  ],
  // Property lifecycle mix — feeds the dashboard's donut chart.
  propertyStatus: [
    { status: "Active", count: 7738, color: "#0D1B6E" },
    { status: "Pending Review", count: 2246, color: "#29ABE2" },
    { status: "Sold / Rented", count: 1872, color: "#16A34A" },
    { status: "Rejected", count: 624, color: "#DC2626" },
  ],
  // Buyer/tenant interest by Indian city (site traffic + enquiries) — feeds the India-focused
  // map. `lng`/`lat` place each city's marker directly, since react-simple-maps projects them
  // itself — no lookup table needed the way country-id matching required.
  indiaActivity: [
    { id: "mumbai", city: "Mumbai", lng: 72.8777, lat: 19.076, properties: 3420, leads: 980, views: 18600 },
    { id: "bengaluru", city: "Bengaluru", lng: 77.5946, lat: 12.9716, properties: 2890, leads: 845, views: 15200 },
    { id: "delhi-ncr", city: "Delhi NCR", lng: 77.1025, lat: 28.7041, properties: 2210, leads: 690, views: 12400 },
    { id: "pune", city: "Pune", lng: 73.8567, lat: 18.5204, properties: 1680, leads: 520, views: 9100 },
    { id: "hyderabad", city: "Hyderabad", lng: 78.4867, lat: 17.385, properties: 1340, leads: 410, views: 7200 },
    { id: "chennai", city: "Chennai", lng: 80.2707, lat: 13.0827, properties: 890, leads: 280, views: 4800 },
    { id: "kochi", city: "Kochi", lng: 76.2673, lat: 9.9312, properties: 520, leads: 160, views: 2600 },
  ],
  // `initials` isn't stored here — Avatar derives it from `name` (see components/ui/Avatar.jsx).
  reviews: [
    {
      id: "rev-1",
      name: "Ananya Sharma",
      rating: 4.8,
      comment: "Verification process was quick and the agent was very responsive throughout.",
      time: "2h ago",
    },
    {
      id: "rev-2",
      name: "Rohan Mehta",
      rating: 4.5,
      comment: "Found a great 3BHK in Pune within a week. Listing details were accurate.",
      time: "6h ago",
    },
    {
      id: "rev-3",
      name: "Kavya Reddy",
      rating: 4.9,
      comment: "Loved the township comparison tools — made shortlisting so much easier.",
      time: "1d ago",
    },
  ],
  featuredListings: [
    {
      id: "lst-1",
      title: "Skyline Residency 3BHK",
      city: "Bandra West, Mumbai",
      price: "₹2.4 Cr",
      area: "1,850 sq.ft",
      beds: 3,
      baths: 3,
      type: "Apartment",
      status: "For Sale",
      featured: true,
      views: 2840,
      enquiries: 64,
      saves: 212,
      image:
        "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/49/Modern_living_room_with_stylish_furniture_and_a_view_of_the_outdoors_in_a_cozy_apartment_setting.jpg/960px-Modern_living_room_with_stylish_furniture_and_a_view_of_the_outdoors_in_a_cozy_apartment_setting.jpg",
    },
    {
      id: "lst-2",
      title: "Whitefield Garden Villa",
      city: "Whitefield, Bengaluru",
      price: "₹1.8 Cr",
      area: "2,400 sq.ft",
      beds: 4,
      baths: 4,
      type: "Villa",
      status: "For Sale",
      featured: false,
      views: 1920,
      enquiries: 41,
      saves: 158,
      image:
        "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/57/3D_Rendering_of_Modern_Luxury_Villa_Exterior_with_Pool.jpg/960px-3D_Rendering_of_Modern_Luxury_Villa_Exterior_with_Pool.jpg",
    },
    {
      id: "lst-3",
      title: "Baner Heights Studio",
      city: "Baner, Pune",
      price: "₹58 L",
      area: "620 sq.ft",
      beds: 1,
      baths: 1,
      type: "Studio",
      status: "For Rent",
      featured: false,
      views: 1340,
      enquiries: 38,
      saves: 96,
      image: "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/0f/LawrenceScarpa_Cherokee_8268.jpg/960px-LawrenceScarpa_Cherokee_8268.jpg",
    },
    {
      id: "lst-4",
      title: "DLF Cyber Towers Office",
      city: "Cyber City, Gurugram",
      price: "₹3.2 Cr",
      area: "3,100 sq.ft",
      beds: null,
      baths: 2,
      type: "Commercial",
      status: "For Sale",
      featured: false,
      views: 980,
      enquiries: 22,
      saves: 54,
      image:
        "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/9a/DFC_3488_Modern_high-rise_office_building_framed_against_a_bright_blue_sky_with_scattered_clouds.jpg/960px-DFC_3488_Modern_high-rise_office_building_framed_against_a_bright_blue_sky_with_scattered_clouds.jpg",
    },
  ],
  loading: false,
  error: null,
};

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {
    setKpis(state, action) {
      state.kpis = { ...state.kpis, ...action.payload };
    },
    setDashboardLoading(state, action) {
      state.loading = action.payload;
    },
    setDashboardError(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const { setKpis, setDashboardLoading, setDashboardError } = dashboardSlice.actions;

export default dashboardSlice.reducer;
