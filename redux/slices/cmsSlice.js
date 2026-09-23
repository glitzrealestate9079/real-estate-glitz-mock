import { createSlice } from "@reduxjs/toolkit";

// Mirrors paymentsSlice's shape: three related-but-distinct entities from Section 4.9 (blog
// articles, static pages, homepage banners), each with its own small set of CRUD reducers rather
// than forcing them through the single-list factory.

const initialArticles = [
  {
    id: "ART-001",
    title: "5 Tips for First-Time Home Buyers in India",
    slug: "5-tips-for-first-time-home-buyers-in-india",
    author: "Priya Menon",
    category: "Buying Guide",
    status: "published",
    excerpt: "Navigating your first home purchase can be overwhelming — here's what to check before you sign.",
    content: "Buying your first home is one of the biggest financial decisions you'll make. Start by getting your budget and home loan pre-approval sorted, then shortlist localities based on commute and amenities. Always verify the RERA registration number and check the builder's track record before booking...",
    seoTitle: "First-Time Home Buyer Tips | Real Estate Admin Blog",
    seoDescription: "A practical checklist for first-time home buyers in India — budgeting, RERA verification, loan pre-approval and more.",
    publishedDate: "2026-08-15",
  },
  {
    id: "ART-002",
    title: "RERA Compliance: What Every Buyer Should Know",
    slug: "rera-compliance-what-every-buyer-should-know",
    author: "Adv. Rahul Kapoor",
    category: "Legal",
    status: "published",
    excerpt: "RERA registration protects buyers from delayed possession and false advertising — here's how to check it.",
    content: "The Real Estate (Regulation and Development) Act requires every project above a certain size to be registered with the state RERA authority. Buyers should verify the registration number on the state RERA website, check the promised possession date, and understand the compensation clause for delays...",
    seoTitle: "RERA Compliance Guide for Property Buyers",
    seoDescription: "Understand RERA registration, buyer protections and how to verify a project before booking.",
    publishedDate: "2026-08-28",
  },
  {
    id: "ART-003",
    title: "Real Estate Market Trends — Q3 2026",
    slug: "real-estate-market-trends-q3-2026",
    author: "Priya Menon",
    category: "Market Trends",
    status: "published",
    excerpt: "Residential demand held steady this quarter while commercial leasing saw a strong rebound in tier-1 cities.",
    content: "Q3 2026 saw residential prices grow modestly across major metros, with Bengaluru and Pune leading absorption. Commercial leasing rebounded sharply as more companies expanded office footprints. Affordable housing continued to see the highest transaction volumes...",
    seoTitle: "Real Estate Market Trends Q3 2026 Report",
    seoDescription: "Residential and commercial real estate trends across India's major cities for Q3 2026.",
    publishedDate: "2026-09-10",
  },
  {
    id: "ART-004",
    title: "Is Now a Good Time to Invest in Commercial Property?",
    slug: "is-now-a-good-time-to-invest-in-commercial-property",
    author: "Vikas Sharma",
    category: "Investment",
    status: "draft",
    excerpt: "With leasing demand rebounding, we break down the risk and reward of commercial real estate investment.",
    content: "Commercial real estate offers higher rental yields than residential but comes with longer vacancy periods and higher entry costs. This piece examines cap rates across office, retail and warehousing segments to help investors decide where the opportunity lies in the current cycle...",
    seoTitle: "Commercial Property Investment Guide 2026",
    seoDescription: "A look at cap rates and rental yields across commercial real estate segments in 2026.",
    publishedDate: null,
  },
  {
    id: "ART-005",
    title: "New Metro Line to Boost Property Prices in Sector 62",
    slug: "new-metro-line-to-boost-property-prices-in-sector-62",
    author: "Priya Menon",
    category: "News",
    status: "published",
    excerpt: "The upcoming metro extension is expected to lift both residential and commercial property values nearby.",
    content: "The newly announced metro extension connecting Sector 62 to the central business district is expected to significantly improve connectivity. Historical data from similar projects suggests property values within a 1km radius could see appreciation over the next 18-24 months...",
    seoTitle: "Metro Line Impact on Sector 62 Property Prices",
    seoDescription: "How the new metro extension could affect residential and commercial property values in Sector 62, Noida.",
    publishedDate: "2026-09-18",
  },
  {
    id: "ART-006",
    title: "Understanding Stamp Duty and Registration Charges",
    slug: "understanding-stamp-duty-and-registration-charges",
    author: "Adv. Rahul Kapoor",
    category: "Legal",
    status: "archived",
    excerpt: "A state-by-state breakdown of stamp duty rates and how they affect your total purchase cost.",
    content: "Stamp duty and registration charges vary significantly by state, typically ranging from 4-8% of the property value. This guide breaks down current rates across major states and explains available rebates for women buyers and first-time purchasers...",
    seoTitle: "Stamp Duty and Registration Charges Explained",
    seoDescription: "State-wise stamp duty rates in India and how they impact your property purchase budget.",
    publishedDate: "2026-05-01",
  },
];

const initialStaticPages = [
  { id: "PAGE-001", title: "About Us", slug: "/about", content: "We are India's trusted real estate marketplace, connecting buyers, sellers, agents and builders since 2015...", seoTitle: "About Us | Real Estate Admin", seoDescription: "Learn about our mission to make property search transparent and hassle-free.", status: "published", lastUpdated: "2026-06-01" },
  { id: "PAGE-002", title: "Terms & Conditions", slug: "/terms", content: "By using this platform, you agree to the following terms and conditions governing listings, payments and user conduct...", seoTitle: "Terms & Conditions | Real Estate Admin", seoDescription: "Platform terms of use for buyers, sellers, agents and builders.", status: "published", lastUpdated: "2026-07-15" },
  { id: "PAGE-003", title: "Privacy Policy", slug: "/privacy", content: "We collect and use your personal information as described in this policy to provide and improve our services...", seoTitle: "Privacy Policy | Real Estate Admin", seoDescription: "How we collect, use and protect your personal information.", status: "published", lastUpdated: "2026-07-15" },
  { id: "PAGE-004", title: "FAQ", slug: "/faq", content: "Frequently asked questions about posting listings, verification, payments and account management...", seoTitle: "Frequently Asked Questions | Real Estate Admin", seoDescription: "Answers to common questions about using the platform.", status: "published", lastUpdated: "2026-08-01" },
  { id: "PAGE-005", title: "Contact Us", slug: "/contact", content: "Reach our support team via email, phone or the in-app chat widget. Our office hours are Mon-Sat, 9am-7pm IST...", seoTitle: "Contact Us | Real Estate Admin", seoDescription: "Get in touch with our support team.", status: "draft", lastUpdated: "2026-09-20" },
];

const initialBanners = [
  { id: "BNR-001", title: "Diwali Mega Sale Hero Banner", imageLabel: "1920x600 hero image", linkUrl: "/offers/diwali", position: "Homepage Hero", startDate: "2026-10-01", endDate: "2026-11-05", active: true, clicks: 4820 },
  { id: "BNR-002", title: "Featured Builder Spotlight — Cyberhub", imageLabel: "1200x400 banner image", linkUrl: "/builders/BLD-001", position: "Homepage Secondary", startDate: "2026-09-01", endDate: "2026-09-30", active: true, clicks: 1240 },
  { id: "BNR-003", title: "Download Our Mobile App", imageLabel: "1600x300 banner image", linkUrl: "/app-download", position: "Search Results Top", startDate: "2026-08-01", endDate: "2026-12-31", active: true, clicks: 3610 },
  { id: "BNR-004", title: "Summer Sale (expired)", imageLabel: "1920x600 hero image", linkUrl: "/offers/summer", position: "Homepage Hero", startDate: "2026-05-01", endDate: "2026-06-30", active: false, clicks: 8920 },
  { id: "BNR-005", title: "Refer & Earn Program", imageLabel: "400x600 sidebar image", linkUrl: "/refer", position: "Listing Sidebar", startDate: "2026-09-10", endDate: "2026-10-10", active: true, clicks: 560 },
];

const initialState = {
  articles: initialArticles,
  staticPages: initialStaticPages,
  banners: initialBanners,
  filters: { category: "all", status: "all" },
};

const cmsSlice = createSlice({
  name: "cms",
  initialState,
  reducers: {
    setFilters(state, action) {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFilters(state) {
      state.filters = {};
    },

    addArticle(state, action) {
      state.articles.unshift(action.payload);
    },
    updateArticle(state, action) {
      const i = state.articles.findIndex((a) => a.id === action.payload.id);
      if (i !== -1) state.articles[i] = { ...state.articles[i], ...action.payload };
    },
    removeArticle(state, action) {
      state.articles = state.articles.filter((a) => a.id !== action.payload);
    },
    removeArticles(state, action) {
      const ids = new Set(action.payload);
      state.articles = state.articles.filter((a) => !ids.has(a.id));
    },

    addStaticPage(state, action) {
      state.staticPages.unshift(action.payload);
    },
    updateStaticPage(state, action) {
      const i = state.staticPages.findIndex((p) => p.id === action.payload.id);
      if (i !== -1) state.staticPages[i] = { ...state.staticPages[i], ...action.payload };
    },
    removeStaticPage(state, action) {
      state.staticPages = state.staticPages.filter((p) => p.id !== action.payload);
    },

    addBanner(state, action) {
      state.banners.unshift(action.payload);
    },
    updateBanner(state, action) {
      const i = state.banners.findIndex((b) => b.id === action.payload.id);
      if (i !== -1) state.banners[i] = { ...state.banners[i], ...action.payload };
    },
    removeBanner(state, action) {
      state.banners = state.banners.filter((b) => b.id !== action.payload);
    },
  },
});

export const {
  setFilters: setCmsFilters,
  resetFilters: resetCmsFilters,
  addArticle,
  updateArticle,
  removeArticle,
  removeArticles,
  addStaticPage,
  updateStaticPage,
  removeStaticPage,
  addBanner,
  updateBanner,
  removeBanner,
} = cmsSlice.actions;

export default cmsSlice.reducer;
