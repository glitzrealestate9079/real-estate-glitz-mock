"use client";

import { useId, useMemo, useState } from "react";
import Image from "next/image";
import {
  AlertTriangle,
  ArrowRight,
  BadgeCheck,
  Bath,
  BedDouble,
  Briefcase,
  Building2,
  CalendarClock,
  Check,
  Eye,
  Heart,
  Home,
  IndianRupee,
  MapPin,
  MessageSquareText,
  Plus,
  Ruler,
  ShieldCheck,
  Star,
  Store,
  Users,
  Warehouse,
  X,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
} from "react-simple-maps";
import indiaStatesTopoJson from "@/lib/india-states.json";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import Card from "@/components/ui/Card";
import StatCard from "@/components/ui/StatCard";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import SegmentedControl from "@/components/ui/SegmentedControl";
import Avatar from "@/components/ui/Avatar";
import { useAppDispatch, useAppSelector } from "@/hooks/useReduxHooks";
import { formatCount, formatINR, todayISO } from "@/utils/format";
import { getTheme, getThemeColors } from "@/lib/themes";
import { updateListingStatus } from "@/redux/slices/listingsSlice";

const DATE_RANGES = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "yearly", label: "Yearly" },
];

const PROPERTY_TYPE_COLORS = ["#0D1B6E", "#29ABE2", "#16A34A", "#F59E0B", "#8B5CF6"];

const LISTING_TYPE_ICON = {
  Apartment: Building2,
  Villa: Home,
  Studio: Warehouse,
  Commercial: Store,
};

const TOOLTIP_STYLE = {
  contentStyle: {
    background: "#fff",
    border: "1px solid #E2E8F0",
    borderRadius: 12,
    fontSize: 12,
    boxShadow: "0 8px 20px -4px rgba(13,27,110,0.12)",
  },
  labelStyle: { color: "#111827", fontWeight: 600, marginBottom: 2 },
  itemStyle: { color: "#64748B" },
};

/** Small ranked-progress bar used in the India Property Activity list. */
function ProgressBar({ percent }) {
  const colorTheme = useAppSelector((state) => state.ui.colorTheme);
  const { primary, accent } = getThemeColors(colorTheme);
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
      <div
        className="h-full rounded-full transition-[width]"
        style={{ width: `${percent}%`, background: `linear-gradient(90deg, ${accent["500"]}, ${primary["600"]})` }}
      />
    </div>
  );
}

/** Small ranked-progress ring used in the Top Performing Cities list. */
function ProgressRing({ percent }) {
  const colorTheme = useAppSelector((state) => state.ui.colorTheme);
  const { primary, accent } = getThemeColors(colorTheme);
  const id = useId();
  const size = 44;
  const stroke = 4;
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="shrink-0 -rotate-90"
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        strokeWidth={stroke}
        className="stroke-gray-200 dark:stroke-gray-700"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={`url(#${id})`}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
      />
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={accent["500"]} />
          <stop offset="100%" stopColor={primary["600"]} />
        </linearGradient>
      </defs>
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="central"
        className="rotate-90 fill-gray-900 dark:fill-gray-100"
        style={{ transformOrigin: "center", fontSize: 10, fontWeight: 600 }}
      >
        {percent}%
      </text>
    </svg>
  );
}

/**
 * India-focused map — full state/UT-level outline, with per-city markers sized by activity.
 * `lib/india-states.json` carries India's *official* boundary (Survey-of-India position: J&K and
 * Ladakh in full — not clipped at the Line of Control — plus Aksai Chin and Arunachal Pradesh
 * undisputed). Most freely-available India topojson (including world-atlas/Natural Earth, used
 * here previously) draws the de-facto/LoC boundary instead, which is wrong for an India-facing
 * product. Sourced from github.com/AbhinavSwami28/india-official-geojson (MIT).
 */
function IndiaActivityMap({ data }) {
  const darkMode = useAppSelector((state) => state.ui.darkMode);
  const colorTheme = useAppSelector((state) => state.ui.colorTheme);
  const [hover, setHover] = useState(null);
  const maxProperties = Math.max(...data.map((d) => d.properties));

  const { primary, accent } = getThemeColors(colorTheme);
  const indiaFill = darkMode ? primary["800"] : primary["100"];
  const indiaStroke = darkMode ? primary["600"] : primary["300"];

  function markerRadius(d) {
    return 3 + 6 * (d.properties / maxProperties);
  }

  return (
    <div
      className="relative min-h-[220px] sm:min-h-[260px]"
      onMouseMove={(e) => {
        if (!hover) return;
        const rect = e.currentTarget.getBoundingClientRect();
        setHover((h) =>
          h ? { ...h, x: e.clientX - rect.left, y: e.clientY - rect.top } : h,
        );
      }}
    >
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{ rotate: [-83, 0, 0], center: [0, 23], scale: 950 }}
        className="mx-auto max-w-md [&_svg]:w-full [&_svg]:h-full [&_g]:pointer-events-none"
      >
        <Geographies geography={indiaStatesTopoJson}>
          {({ geographies }) =>
            geographies.map((geo) => (
              <Geography
                key={geo.rsmKey}
                geography={geo}
                fill={indiaFill}
                stroke={indiaStroke}
                strokeWidth={0.6}
                style={{ outline: "none" }}
              />
            ))
          }
        </Geographies>

        {data.map((d) => (
          <Marker key={d.id} coordinates={[d.lng, d.lat]} className="!pointer-events-auto">
            <circle
              r={markerRadius(d)}
              fill={accent["500"]}
              stroke="#fff"
              strokeWidth={1.5}
              className="cursor-pointer"
              onMouseEnter={(e) => {
                const rect = e.currentTarget.ownerSVGElement.getBoundingClientRect();
                setHover({ ...d, x: e.clientX - rect.left, y: e.clientY - rect.top });
              }}
              onMouseLeave={() => setHover(null)}
            />
            <circle r={markerRadius(d)} fill={accent["500"]} opacity={0.5} className="pointer-events-none animate-ping" />
          </Marker>
        ))}
      </ComposableMap>

      {hover && (
        <div
          className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-[calc(100%+10px)] rounded-lg border border-gray-100 bg-white px-3 py-2 text-xs shadow-card-hover dark:border-gray-800 dark:bg-surface-dark-subtle"
          style={{ left: hover.x, top: hover.y }}
        >
          <p className="font-semibold text-gray-900 dark:text-gray-100">
            {hover.city}
          </p>
          <p className="mt-0.5 text-gray-500 dark:text-gray-400">
            {formatCount(hover.properties)} properties
          </p>
          <p className="text-gray-500 dark:text-gray-400">
            {formatCount(hover.leads)} leads · {formatCount(hover.views)} views
          </p>
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const colorTheme = useAppSelector((state) => state.ui.colorTheme);
  const { primary, accent } = getThemeColors(colorTheme);
  // "Active"/"Pending Review" are brand-tinted so they track the palette switcher; Sold/Rejected
  // stay the fixed success/danger semantic colors from the propertyStatus slice data.
  const BRAND_STATUS_COLORS = {
    Active: primary["600"],
    "Pending Review": accent["500"],
  };
  const user = useAppSelector((state) => state.auth.user);
  const kpis = useAppSelector((state) => state.dashboard.kpis);
  const sparklines = useAppSelector((state) => state.dashboard.sparklines);
  const trendByRange = useAppSelector((state) => state.dashboard.trendByRange);
  const leadFunnel = useAppSelector((state) => state.dashboard.leadFunnel);
  const revenueByPlan = useAppSelector(
    (state) => state.dashboard.revenueByPlan,
  );
  const topCities = useAppSelector((state) => state.dashboard.topCities);
  const propertyStatus = useAppSelector(
    (state) => state.dashboard.propertyStatus,
  );
  const indiaActivity = useAppSelector(
    (state) => state.dashboard.indiaActivity,
  );
  const reviews = useAppSelector((state) => state.dashboard.reviews);
  const featuredListings = useAppSelector(
    (state) => state.dashboard.featuredListings,
  );
  const listings = useAppSelector((state) => state.listings.items);
  const leads = useAppSelector((state) => state.leads.items);
  const siteVisits = useAppSelector((state) => state.siteVisits.items);
  const builders = useAppSelector((state) => state.builders.items);
  const pendingListings = listings
    .filter((l) => l.status === "pending" || l.status === "flagged")
    .slice(0, 5);

  const [dateRange, setDateRange] = useState("monthly");
  const trend = trendByRange[dateRange];

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  }, []);

  // Property type mix — computed live from the Listings module rather than stored as separate
  // dashboard mock data, so it never drifts out of sync with what's actually in that slice.
  const propertyTypeDistribution = useMemo(() => {
    const counts = {};
    listings.forEach((l) => {
      counts[l.propertyType] = (counts[l.propertyType] ?? 0) + 1;
    });
    return Object.entries(counts).map(([type, count]) => ({ type, count }));
  }, [listings]);

  // Cross-module activity feed — most recent events from listings, leads, site visits and
  // builder projects, sorted together by date. Each source already has its own timestamp field;
  // this just normalizes them into one shape and interleaves them.
  const recentActivity = useMemo(() => {
    const events = [];
    listings.slice(0, 6).forEach((l) => {
      events.push({
        id: `listing-${l.id}`,
        date: l.submittedDate,
        icon: Building2,
        text: `${l.title} submitted for approval`,
        meta: l.city,
      });
    });
    leads.slice(0, 6).forEach((l) => {
      events.push({
        id: `lead-${l.id}`,
        date: l.createdDate,
        icon: MessageSquareText,
        text: `New lead: ${l.buyerName} enquired about ${l.listingTitle}`,
        meta: l.channel,
      });
    });
    siteVisits.slice(0, 6).forEach((v) => {
      events.push({
        id: `visit-${v.id}`,
        date: v.createdDate,
        icon: CalendarClock,
        text: `Site visit ${v.status === "completed" ? "completed" : "scheduled"}: ${v.buyerName} for ${v.listingTitle}`,
        meta: v.city,
      });
    });
    // `launchDate` stands in for "added to platform" since projects don't carry a separate
    // creation timestamp — only past/present launch dates make sense in a *recent* activity feed,
    // future launches belong on the Builders/Projects page instead.
    const today = todayISO();
    builders.forEach((b) => {
      b.projects
        .filter((p) => p.launchDate <= today)
        .forEach((p) => {
          events.push({
            id: `project-${p.id}`,
            date: p.launchDate,
            icon: Briefcase,
            text: `${b.name} added new project: ${p.name}`,
            meta: p.location,
          });
        });
    });
    return events.sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, 6);
  }, [listings, leads, siteVisits, builders]);

  function handleQuickApprove(listing) {
    dispatch(updateListingStatus({ id: listing.id, status: "approved" }));
    toast.success(`${listing.id} approved`);
  }

  function handleQuickReject(listing) {
    dispatch(
      updateListingStatus({
        id: listing.id,
        status: "rejected",
        rejectionReason: "Rejected from dashboard quick action",
      }),
    );
    toast.success(`${listing.id} rejected`);
  }

  const stats = [
    {
      key: "totalListings",
      label: "Total Listings",
      icon: Building2,
      value: formatCount(kpis.totalListings),
      trend: { direction: "up", value: "4.1%" },
    },
    {
      key: "pendingApprovals",
      label: "Pending Approvals",
      icon: ShieldCheck,
      value: formatCount(kpis.pendingApprovals),
      trend: { direction: "down", value: "2 today" },
    },
    {
      key: "activeUsers",
      label: "Active Users",
      icon: Users,
      value: formatCount(kpis.activeUsers),
      trend: { direction: "up", value: "1.8%" },
    },
    {
      key: "leadsToday",
      label: "Leads Today",
      icon: MessageSquareText,
      value: formatCount(kpis.leadsToday),
      trend: { direction: "up", value: "12%" },
    },
    {
      key: "revenueMTD",
      label: "Revenue (MTD)",
      icon: IndianRupee,
      value: formatINR(kpis.revenueMTD),
      trend: { direction: "up", value: "6.4%" },
    },
    {
      key: "flaggedListings",
      label: "Flagged / Fake Listings",
      icon: AlertTriangle,
      value: formatCount(kpis.flaggedListings),
      trend: { direction: "down", value: "3 today" },
    },
    {
      key: "siteVisits",
      label: "Upcoming Site Visits",
      icon: CalendarClock,
      value: formatCount(
        siteVisits.filter((v) => v.status === "requested" || v.status === "confirmed" || v.status === "rescheduled").length,
      ),
      trend: { direction: "up", value: `${siteVisits.filter((v) => v.status === "completed").length} completed` },
    },
    {
      key: "verifiedProperties",
      label: "Verified Properties",
      icon: BadgeCheck,
      value: formatCount(listings.filter((l) => l.reraVerified).length),
      trend: { direction: "up", value: `of ${formatCount(listings.length)} total` },
    },
  ];

  const totalTrendListings = trend.reduce((sum, t) => sum + t.listings, 0);
  const totalPlanRevenue =
    revenueByPlan.reduce(
      (sum, m) => sum + m.basic + m.standard + m.premium,
      0,
    ) * 100000;
  const totalPropertyStatus = propertyStatus.reduce(
    (sum, s) => sum + s.count,
    0,
  );
  const featured = featuredListings.find((l) => l.featured);
  const rest = featuredListings.filter((l) => !l.featured).sort((a, b) => b.views - a.views);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            {greeting}, {user?.name?.split(" ")[0] ?? "Admin"}
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Here&apos;s what&apos;s happening with your real estate platform today.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <SegmentedControl options={DATE_RANGES} value={dateRange} onChange={setDateRange} />
          <Button icon={Plus} onClick={() => router.push("/admin/listings")}>
            Add Listing
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <StatCard
            key={stat.key}
            icon={stat.icon}
            label={stat.label}
            value={stat.value}
            trend={stat.trend}
            sparkline={sparklines[stat.key]}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card
          title="Property Listing Trends"
          description={`${formatCount(totalTrendListings)} listings, ${DATE_RANGES.find((r) => r.value === dateRange)?.label.toLowerCase()} view`}
          className="lg:col-span-1"
        >
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={trend}
                margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="listingsFill" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="0%"
                      stopColor={primary["600"]}
                      stopOpacity={0.28}
                    />
                    <stop
                      offset="100%"
                      stopColor={primary["600"]}
                      stopOpacity={0}
                    />
                  </linearGradient>
                  <linearGradient id="leadsFill" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="0%"
                      stopColor={accent["500"]}
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="100%"
                      stopColor={accent["500"]}
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="#E2E8F0" />
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: "#64748B" }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: "#64748B" }}
                  width={44}
                />
                <Tooltip {...TOOLTIP_STYLE} />
                <Area
                  type="monotone"
                  dataKey="listings"
                  name="Listings"
                  stroke={primary["600"]}
                  strokeWidth={2}
                  fill="url(#listingsFill)"
                />
                <Area
                  type="monotone"
                  dataKey="leads"
                  name="Leads"
                  stroke={accent["500"]}
                  strokeWidth={2}
                  fill="url(#leadsFill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card
          title="Revenue by Plan Type"
          description={`${formatINR(totalPlanRevenue)} tracked this half`}
        >
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={revenueByPlan}
                margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
                barGap={4}
              >
                <CartesianGrid vertical={false} stroke="#E2E8F0" />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: "#64748B" }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: "#64748B" }}
                  width={48}
                  tickFormatter={(v) => `₹${v}L`}
                />
                <Tooltip {...TOOLTIP_STYLE} formatter={(v) => [`₹${v}L`]} />
                <Legend
                  iconType="circle"
                  wrapperStyle={{ fontSize: 12, color: "#64748B" }}
                  formatter={(v) => v[0].toUpperCase() + v.slice(1)}
                />
                <Bar
                  dataKey="basic"
                  name="basic"
                  fill={accent["300"]}
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="standard"
                  name="standard"
                  fill={accent["600"]}
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="premium"
                  name="premium"
                  fill={primary["600"]}
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card
          title="India Property Activity"
          description="Buyer & tenant interest by city"
          className="lg:col-span-2"
        >
          <div className="grid grid-cols-2 flex flex-col gap-10 lg:flex-row lg:items-center">
            <div className="min-w-0 lg:flex-[1.6]">
              <IndiaActivityMap data={indiaActivity} />
            </div>
            <ul className="grid shrink-0 gap-2.5  lg:grid-cols-2 ">
              {indiaActivity.map((c) => (
                <li
                  key={c.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-gray-100 px-3.5 py-2.5 dark:border-gray-800"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">
                      {c.city}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatCount(c.properties)} properties
                    </p>
                  </div>
                  <ProgressRing
                    percent={Math.round(
                      (c.properties /
                        Math.max(...indiaActivity.map((x) => x.properties))) *
                        100,
                    )}
                  />
                </li>
              ))}
            </ul>
          </div>
        </Card>
        <Card
          title="Property Status"
          description={`${formatCount(totalPropertyStatus)} listings tracked`}
        >
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={propertyStatus}
                  dataKey="count"
                  nameKey="status"
                  innerRadius="62%"
                  outerRadius="100%"
                  paddingAngle={2}
                  stroke="none"
                >
                  {propertyStatus.map((s) => (
                    <Cell
                      key={s.status}
                      fill={BRAND_STATUS_COLORS[s.status] ?? s.color}
                    />
                  ))}
                </Pie>
                <Tooltip {...TOOLTIP_STYLE} formatter={(v) => formatCount(v)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className="mt-1 space-y-1.5">
            {propertyStatus.map((s) => (
              <li
                key={s.status}
                className="flex items-center justify-between text-xs"
              >
                <span className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{
                      backgroundColor: BRAND_STATUS_COLORS[s.status] ?? s.color,
                    }}
                  />
                  {s.status}
                </span>
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {formatCount(s.count)}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card
          title="Property Type Distribution"
          description={`${formatCount(listings.length)} listings across ${propertyTypeDistribution.length} types`}
        >
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={propertyTypeDistribution}
                  dataKey="count"
                  nameKey="type"
                  innerRadius="62%"
                  outerRadius="100%"
                  paddingAngle={2}
                  stroke="none"
                >
                  {propertyTypeDistribution.map((s, i) => (
                    <Cell key={s.type} fill={PROPERTY_TYPE_COLORS[i % PROPERTY_TYPE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip {...TOOLTIP_STYLE} formatter={(v) => formatCount(v)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className="mt-1 space-y-1.5">
            {propertyTypeDistribution.map((s, i) => (
              <li key={s.type} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: PROPERTY_TYPE_COLORS[i % PROPERTY_TYPE_COLORS.length] }}
                  />
                  {s.type}
                </span>
                <span className="font-medium text-gray-900 dark:text-gray-100">{formatCount(s.count)}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card title="Lead Conversion Funnel" description="Visitors through to closed deals">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={leadFunnel} layout="vertical" margin={{ top: 4, right: 24, left: 4, bottom: 4 }}>
                <XAxis type="number" hide />
                <YAxis
                  type="category"
                  dataKey="stage"
                  tickLine={false}
                  axisLine={false}
                  width={82}
                  tick={{ fontSize: 11, fill: "#64748B" }}
                />
                <Tooltip {...TOOLTIP_STYLE} formatter={(v) => formatCount(v)} cursor={{ fill: "rgba(148,163,184,0.08)" }} />
                <Bar dataKey="count" radius={[0, 6, 6, 0]} barSize={18}>
                  {leadFunnel.map((_, i) => (
                    <Cell key={i} fillOpacity={Math.max(0.5, 1 - i * 0.13)} fill={accent["500"]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card
          title="Top Performing Cities"
          description="Units sold this year, by city"
        >
          <ul className="divide-y divide-gray-100 dark:divide-gray-800">
            {topCities.map((c) => (
              <li
                key={c.city}
                className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {c.city}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatCount(c.units)} units
                    </p>
                  </div>
                </div>
                <ProgressRing percent={c.percent} />
              </li>
            ))}
          </ul>
        </Card>

        <Card
          title="Customer Reviews"
          description="Latest feedback from buyers and tenants"
        >
          <ul className="divide-y divide-gray-100 dark:divide-gray-800">
            {reviews.map((r) => (
              <li
                key={r.id}
                className="flex items-start gap-3 py-3 first:pt-0 last:pb-0"
              >
                <Avatar name={r.name} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">
                      {r.name}
                    </p>
                    <span className="shrink-0 text-[11px] text-gray-400 dark:text-gray-500">
                      {r.time}
                    </span>
                  </div>
                  <p className="mt-0.5 line-clamp-2 text-xs text-gray-500 dark:text-gray-400">
                    {r.comment}
                  </p>
                  <div className="mt-1 flex items-center gap-1">
                    <Star className="h-3.5 w-3.5 fill-warning text-warning" />
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                      {r.rating}
                    </span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card title="Recent Activity" description="Latest events across listings, leads, site visits and projects">
        {recentActivity.length === 0 ? (
          <p className="py-6 text-center text-sm text-gray-400">No recent activity yet.</p>
        ) : (
          <ul className="relative space-y-3 pl-1">
            {recentActivity.map((event, idx) => {
              const EventIcon = event.icon;
              return (
                <li key={event.id} className="relative flex gap-3">
                  {idx !== recentActivity.length - 1 && (
                    <span className="absolute left-[13px] top-7 h-[calc(100%-4px)] w-px bg-gray-100 dark:bg-gray-800" />
                  )}
                  <div className="z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400">
                    <EventIcon className="h-3.5 w-3.5" />
                  </div>
                  <div className="min-w-0 flex-1 pb-0.5 pt-0.5">
                    <p className="text-sm leading-snug text-gray-800 dark:text-gray-200">{event.text}</p>
                    <p className="mt-0.5 text-xs text-gray-400">
                      {event.meta} · {event.date}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      <Card
        title="Top Performing Properties"
        description="Ranked by views — pending review lands with the Listings module"
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {featured && (
            <div className="group relative col-span-full overflow-hidden rounded-xl sm:col-span-2">
              <div className="relative h-56 w-full sm:h-64">
                <Image
                  src={featured.image}
                  alt={featured.title}
                  fill
                  sizes="(min-width: 640px) 50vw, 100vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary-950/85 via-primary-950/10 to-transparent" />
                <div className="absolute left-3 top-3 flex items-center gap-2">
                  <Badge
                    variant="warning"
                    dot={false}
                    className="bg-white/90 backdrop-blur-sm"
                  >
                    Featured
                  </Badge>
                  <Badge
                    variant="info"
                    dot={false}
                    className="bg-white/90 backdrop-blur-sm"
                  >
                    {featured.status}
                  </Badge>
                </div>
                <button
                  aria-label="Save to favorites"
                  className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-gray-500 backdrop-blur-sm transition-colors hover:text-danger"
                >
                  <Heart className="h-4 w-4" />
                </button>
                <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                  <p className="text-base font-semibold">{featured.title}</p>
                  <p className="mt-0.5 flex items-center gap-1 text-xs text-white/80">
                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                    {featured.city}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-white/90">
                    <span className="text-sm font-semibold">
                      {featured.price}
                    </span>
                    <span className="flex items-center gap-1">
                      <Ruler className="h-3.5 w-3.5" />
                      {featured.area}
                    </span>
                    <span className="flex items-center gap-1">
                      <BedDouble className="h-3.5 w-3.5" />
                      {featured.beds}
                    </span>
                    <span className="flex items-center gap-1">
                      <Bath className="h-3.5 w-3.5" />
                      {featured.baths}
                    </span>
                    <span className="flex items-center gap-1" title="Views">
                      <Eye className="h-3.5 w-3.5" />
                      {formatCount(featured.views)}
                    </span>
                    <span className="flex items-center gap-1" title="Enquiries">
                      <MessageSquareText className="h-3.5 w-3.5" />
                      {formatCount(featured.enquiries)}
                    </span>
                    <span className="flex items-center gap-1" title="Saves">
                      <Heart className="h-3.5 w-3.5" />
                      {formatCount(featured.saves)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {rest.map((l) => {
            const ThumbIcon = LISTING_TYPE_ICON[l.type] ?? Building2;
            return (
              <div
                key={l.id}
                className="group overflow-hidden rounded-xl border border-gray-100 transition-shadow hover:shadow-card-hover dark:border-gray-800"
              >
                <div className="relative h-32 w-full overflow-hidden bg-primary-50 dark:bg-primary-500/10">
                  {l.image ? (
                    <Image
                      src={l.image}
                      alt={l.title}
                      fill
                      sizes="(min-width: 1280px) 25vw, (min-width: 640px) 50vw, 100vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <ThumbIcon
                        className="h-10 w-10 text-primary-300 dark:text-primary-400"
                        strokeWidth={1.5}
                      />
                    </div>
                  )}
                  <Badge
                    variant="neutral"
                    dot={false}
                    className="absolute left-2 top-2 bg-white/90 backdrop-blur-sm"
                  >
                    {l.status}
                  </Badge>
                  <button
                    aria-label="Save to favorites"
                    className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-gray-500 backdrop-blur-sm transition-colors hover:text-danger"
                  >
                    <Heart className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="p-3.5">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {l.title}
                    </p>
                    <Badge variant="info" dot={false} className="shrink-0">
                      {l.type}
                    </Badge>
                  </div>
                  <p className="mt-1 flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{l.city}</span>
                  </p>
                  <p className="mt-2 text-sm font-semibold text-primary-600 dark:text-primary-400">
                    {l.price}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <Ruler className="h-3.5 w-3.5" />
                      {l.area}
                    </span>
                    {l.beds != null && (
                      <span className="flex items-center gap-1">
                        <BedDouble className="h-3.5 w-3.5" />
                        {l.beds}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Bath className="h-3.5 w-3.5" />
                      {l.baths}
                    </span>
                  </div>
                  <div className="mt-2.5 flex items-center gap-3 border-t border-gray-100 pt-2.5 text-xs text-gray-500 dark:border-gray-800 dark:text-gray-400">
                    <span className="flex items-center gap-1" title="Views">
                      <Eye className="h-3.5 w-3.5" />
                      {formatCount(l.views)}
                    </span>
                    <span className="flex items-center gap-1" title="Enquiries">
                      <MessageSquareText className="h-3.5 w-3.5" />
                      {formatCount(l.enquiries)}
                    </span>
                    <span className="flex items-center gap-1" title="Saves">
                      <Heart className="h-3.5 w-3.5" />
                      {formatCount(l.saves)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <Card
        title="Listings Pending Approval"
        description={`${formatCount(pendingListings.length)} shown of ${formatCount(kpis.pendingApprovals)} awaiting review`}
        action={
          <button
            onClick={() => router.push("/admin/listings")}
            className="flex items-center gap-1 text-xs font-medium text-primary-600 hover:underline dark:text-primary-400"
          >
            View All
            <ArrowRight className="h-3 w-3" />
          </button>
        }
      >
        {pendingListings.length === 0 ? (
          <p className="py-6 text-center text-sm text-gray-400">
            Nothing pending — all caught up.
          </p>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {pendingListings.map((l) => (
              <div
                key={l.id}
                className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
              >
                <div className="min-w-0">
                  <p className="max-w-xs truncate text-sm font-medium text-gray-900 dark:text-gray-100">
                    {l.title}
                  </p>
                  <p className="text-xs text-gray-400">
                    {l.id} — {l.city} — {l.postedBy} ({l.postedByRole})
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={l.status === "flagged" ? "danger" : "warning"}
                  >
                    {l.status === "flagged" ? "Flagged" : "Pending"}
                  </Badge>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {formatINR(l.price)}
                  </span>
                  <button
                    onClick={() => handleQuickApprove(l)}
                    className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:bg-success/10 hover:text-success"
                    aria-label="Approve listing"
                  >
                    <Check className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => handleQuickReject(l)}
                    className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:bg-danger/10 hover:text-danger"
                    aria-label="Reject listing"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
