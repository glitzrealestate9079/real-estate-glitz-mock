"use client";

import { useMemo, useState } from "react";
import {
  Eye,
  FileDown,
  IndianRupee,
  Percent,
  Pencil,
  Plus,
  Printer,
  Trash2,
  TrendingDown,
  Users,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import toast from "react-hot-toast";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import StatCard from "@/components/ui/StatCard";
import Table from "@/components/ui/Table";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import ReportFormModal from "@/components/reports/ReportFormModal";
import { useAppDispatch, useAppSelector } from "@/hooks/useReduxHooks";
import { addSavedReport, removeSavedReport, removeSavedReports, updateSavedReport } from "@/redux/slices/reportsSlice";
import { cityOf, formatCount, formatINR, todayISO } from "@/utils/format";
import { getThemeColors } from "@/lib/themes";

const TOOLTIP_STYLE = {
  contentStyle: { background: "#fff", border: "1px solid #E2E8F0", borderRadius: 12, fontSize: 12, boxShadow: "0 8px 20px -4px rgba(13,27,110,0.12)" },
  labelStyle: { color: "#111827", fontWeight: 600, marginBottom: 2 },
  itemStyle: { color: "#64748B" },
};

function exportCSV(filename, headers, rows) {
  const csvRow = (vals) => vals.map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`).join(",");
  const lines = [csvRow(headers), ...rows.map(csvRow)];
  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function ReportsPage() {
  const dispatch = useAppDispatch();
  const items = useAppSelector((state) => state.reports.items);
  const trafficTrend = useAppSelector((state) => state.reports.trafficTrend);
  const conversionFunnel = useAppSelector((state) => state.reports.conversionFunnel);
  const revenueReport = useAppSelector((state) => state.reports.revenueReport);
  const leads = useAppSelector((state) => state.leads.items);
  const listings = useAppSelector((state) => state.listings.items);
  const colorTheme = useAppSelector((state) => state.ui.colorTheme);
  const { primary, accent } = getThemeColors(colorTheme);

  const [selectedIds, setSelectedIds] = useState([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editingReport, setEditingReport] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [busy, setBusy] = useState(false);

  const revenueRows = useMemo(
    () =>
      revenueReport.map((r, i) => {
        const total = r.basic + r.featured + r.premium;
        const prevTotal = i > 0 ? revenueReport[i - 1].basic + revenueReport[i - 1].featured + revenueReport[i - 1].premium : null;
        const growth = prevTotal ? (((total - prevTotal) / prevTotal) * 100).toFixed(1) : null;
        return { ...r, total, growth };
      }),
    [revenueReport]
  );

  const totalPageViews = trafficTrend.reduce((sum, m) => sum + m.pageViews, 0);
  const totalVisitors = trafficTrend.reduce((sum, m) => sum + m.uniqueVisitors, 0);
  const totalRevenue = revenueRows.reduce((sum, r) => sum + r.total, 0);
  const conversionRate = ((conversionFunnel.at(-1).count / conversionFunnel[0].count) * 100).toFixed(1);

  // Live lead-source breakdown — computed from real leads, not a static mock series.
  const leadsByChannel = useMemo(() => {
    const counts = {};
    leads.forEach((l) => {
      counts[l.channel] = (counts[l.channel] ?? 0) + 1;
    });
    return Object.entries(counts)
      .map(([channel, count]) => ({ channel, count }))
      .sort((a, b) => b.count - a.count);
  }, [leads]);

  // Live city-wise performance — computed from real listings, not a static mock series.
  const topCities = useMemo(() => {
    const byCity = {};
    listings.forEach((l) => {
      const city = cityOf(l.city);
      if (!byCity[city]) byCity[city] = { city, listings: 0, views: 0, enquiries: 0 };
      byCity[city].listings += 1;
      byCity[city].views += l.views ?? 0;
      byCity[city].enquiries += l.enquiries ?? 0;
    });
    return Object.values(byCity)
      .sort((a, b) => b.listings - a.listings)
      .slice(0, 6);
  }, [listings]);

  function openAdd() {
    setEditingReport(null);
    setFormOpen(true);
  }

  function openEdit(report) {
    setEditingReport(report);
    setFormOpen(true);
  }

  function handleSubmit(values) {
    setBusy(true);
    setTimeout(() => {
      if (editingReport) {
        dispatch(updateSavedReport({ id: editingReport.id, ...values }));
        toast.success(`${values.name} updated`);
      } else {
        const newId = `RPT-${Math.floor(100 + Math.random() * 899)}`;
        dispatch(addSavedReport({ id: newId, ...values, createdDate: todayISO(), lastRun: todayISO() }));
        toast.success(`${values.name} saved`);
      }
      setBusy(false);
      setFormOpen(false);
      setEditingReport(null);
    }, 400);
  }

  function handleDelete() {
    dispatch(removeSavedReport(deleteTarget.id));
    toast.success(`${deleteTarget.name} deleted`);
    setDeleteTarget(null);
  }

  function handleBulkDelete() {
    dispatch(removeSavedReports(selectedIds));
    toast.success(`${selectedIds.length} reports deleted`);
    setSelectedIds([]);
  }

  function handleExportRevenueCSV() {
    exportCSV(
      `revenue-report-${todayISO()}.csv`,
      ["Month", "Basic", "Featured", "Premium", "Total", "Growth %"],
      revenueRows.map((r) => [r.month, r.basic, r.featured, r.premium, r.total, r.growth ?? "—"])
    );
    toast.success("Revenue report exported to CSV");
  }

  function handleExportPDF() {
    toast("Opening print dialog — choose \"Save as PDF\" as the destination", { icon: "🖨️" });
    setTimeout(() => window.print(), 300);
  }

  function handleExportSavedReport(report) {
    if (report.type === "Traffic") {
      exportCSV(`${report.name}.csv`, ["Month", "Page Views", "Unique Visitors"], trafficTrend.map((r) => [r.month, r.pageViews, r.uniqueVisitors]));
    } else if (report.type === "Revenue") {
      exportCSV(`${report.name}.csv`, ["Month", "Basic", "Featured", "Premium", "Total"], revenueRows.map((r) => [r.month, r.basic, r.featured, r.premium, r.total]));
    } else if (report.type === "Lead Source") {
      exportCSV(`${report.name}.csv`, ["Channel", "Leads"], leadsByChannel.map((c) => [c.channel, c.count]));
    } else if (report.type === "City Performance") {
      exportCSV(`${report.name}.csv`, ["City", "Listings", "Views", "Enquiries"], topCities.map((c) => [c.city, c.listings, c.views, c.enquiries]));
    } else {
      exportCSV(`${report.name}.csv`, ["Stage", "Count"], conversionFunnel.map((s) => [s.stage, s.count]));
    }
    toast.success(`${report.name} exported to CSV`);
  }

  const savedReportColumns = [
    { key: "name", header: "Report Name", sortable: true },
    { key: "type", header: "Type", sortable: true },
    { key: "rangeStart", header: "Range", render: (row) => `${row.rangeStart} → ${row.rangeEnd}`, searchable: false },
    { key: "createdBy", header: "Created By", sortable: true },
    { key: "lastRun", header: "Last Run", sortable: true },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Reports &amp; Analytics</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Traffic, lead sources, city performance, the conversion funnel, and revenue — with CSV/PDF export.
          </p>
        </div>
        <Button icon={Plus} onClick={openAdd}>
          Save New Report
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Eye} label="Total Page Views" value={formatCount(totalPageViews)} trend={{ direction: "up", value: "12.4%" }} sparkline={trafficTrend.map((t) => t.pageViews)} />
        <StatCard icon={Users} label="Unique Visitors" value={formatCount(totalVisitors)} trend={{ direction: "up", value: "9.8%" }} sparkline={trafficTrend.map((t) => t.uniqueVisitors)} />
        <StatCard icon={Percent} label="Conversion Rate" value={`${conversionRate}%`} trend={{ direction: "up", value: "0.6%" }} />
        <StatCard icon={IndianRupee} label="Total Revenue" value={formatINR(totalRevenue)} trend={{ direction: "up", value: "7.8%" }} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card title="Traffic Analytics" description={`${formatCount(totalPageViews)} page views this year`}>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trafficTrend} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="pageViewsFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={primary["600"]} stopOpacity={0.28} />
                    <stop offset="100%" stopColor={primary["600"]} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="visitorsFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={accent["500"]} stopOpacity={0.3} />
                    <stop offset="100%" stopColor={accent["500"]} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#64748B" }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#64748B" }} width={44} tickFormatter={(v) => `${v / 1000}k`} />
                <Tooltip {...TOOLTIP_STYLE} formatter={(v) => formatCount(v)} />
                <Area type="monotone" dataKey="pageViews" name="Page Views" stroke={primary["600"]} strokeWidth={2} fill="url(#pageViewsFill)" />
                <Area type="monotone" dataKey="uniqueVisitors" name="Unique Visitors" stroke={accent["500"]} strokeWidth={2} fill="url(#visitorsFill)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Conversion Funnel" description="Search → View → Contact → Deal">
          <div className="space-y-4 py-1">
            {conversionFunnel.map((stage, i) => {
              const percent = (stage.count / conversionFunnel[0].count) * 100;
              const prevStage = i > 0 ? conversionFunnel[i - 1] : null;
              const dropOff = prevStage ? (((prevStage.count - stage.count) / prevStage.count) * 100).toFixed(0) : null;
              return (
                <div key={stage.stage}>
                  {dropOff && (
                    <p className="mb-1 flex items-center gap-1 text-[11px] text-gray-400">
                      <TrendingDown className="h-3 w-3" />
                      {dropOff}% drop-off from {prevStage.stage}
                    </p>
                  )}
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="font-medium text-gray-700 dark:text-gray-300">{stage.stage}</span>
                    <span className="text-gray-500 dark:text-gray-400">
                      {formatCount(stage.count)} ({percent.toFixed(0)}%)
                    </span>
                  </div>
                  <div className="h-3 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                    <div className="h-full rounded-full bg-accent-500" style={{ width: `${percent}%`, opacity: Math.max(0.55, 1 - i * 0.18) }} />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card title="Leads by Source" description="Which enquiry channels bring in the most leads">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={leadsByChannel} layout="vertical" margin={{ top: 4, right: 24, left: 4, bottom: 4 }}>
                <XAxis type="number" hide />
                <YAxis
                  type="category"
                  dataKey="channel"
                  tickLine={false}
                  axisLine={false}
                  width={104}
                  tick={{ fontSize: 11, fill: "#64748B" }}
                />
                <Tooltip {...TOOLTIP_STYLE} formatter={(v) => formatCount(v)} cursor={{ fill: "rgba(148,163,184,0.08)" }} />
                <Bar dataKey="count" name="Leads" radius={[0, 6, 6, 0]} barSize={18}>
                  {leadsByChannel.map((_, i) => (
                    <Cell key={i} fillOpacity={Math.max(0.5, 1 - i * 0.13)} fill={accent["600"]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Top Cities" description="Listing volume and engagement by city">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topCities} layout="vertical" margin={{ top: 4, right: 24, left: 4, bottom: 4 }}>
                <XAxis type="number" hide />
                <YAxis
                  type="category"
                  dataKey="city"
                  tickLine={false}
                  axisLine={false}
                  width={88}
                  tick={{ fontSize: 11, fill: "#64748B" }}
                />
                <Tooltip
                  {...TOOLTIP_STYLE}
                  formatter={(v, name) => [formatCount(v), name]}
                  labelFormatter={(label) => label}
                />
                <Bar dataKey="listings" name="Listings" radius={[0, 6, 6, 0]} barSize={18}>
                  {topCities.map((_, i) => (
                    <Cell key={i} fillOpacity={1 - i * 0.13} fill={accent["500"]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card
        title="Revenue Report"
        description="Monthly revenue by plan type"
        action={
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" icon={FileDown} onClick={handleExportRevenueCSV}>
              Export CSV
            </Button>
            <Button size="sm" variant="outline" icon={Printer} onClick={handleExportPDF}>
              Export PDF
            </Button>
          </div>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-xs uppercase tracking-wide text-gray-500 dark:border-gray-800 dark:text-gray-400">
                <th className="px-3 py-2 font-medium">Month</th>
                <th className="px-3 py-2 font-medium">Basic</th>
                <th className="px-3 py-2 font-medium">Featured</th>
                <th className="px-3 py-2 font-medium">Premium</th>
                <th className="px-3 py-2 font-medium">Total</th>
                <th className="px-3 py-2 font-medium">Growth</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {revenueRows.map((r) => (
                <tr key={r.month}>
                  <td className="px-3 py-2.5 font-medium text-gray-900 dark:text-gray-100">{r.month}</td>
                  <td className="px-3 py-2.5 text-gray-600 dark:text-gray-300">{formatINR(r.basic)}</td>
                  <td className="px-3 py-2.5 text-gray-600 dark:text-gray-300">{formatINR(r.featured)}</td>
                  <td className="px-3 py-2.5 text-gray-600 dark:text-gray-300">{formatINR(r.premium)}</td>
                  <td className="px-3 py-2.5 font-semibold text-gray-900 dark:text-gray-100">{formatINR(r.total)}</td>
                  <td className={`px-3 py-2.5 ${r.growth > 0 ? "text-success" : r.growth < 0 ? "text-danger" : "text-gray-400"}`}>
                    {r.growth ? `${r.growth > 0 ? "+" : ""}${r.growth}%` : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Saved Reports</h2>
          {selectedIds.length > 0 && (
            <div className="flex items-center gap-2 rounded-lg bg-primary-50 px-3 py-2 dark:bg-primary-500/10">
              <span className="text-xs font-medium text-primary-700 dark:text-primary-300">{selectedIds.length} selected</span>
              <Button size="sm" variant="outline" icon={Trash2} onClick={handleBulkDelete}>
                Delete
              </Button>
            </div>
          )}
        </div>
        <Table
          columns={savedReportColumns}
          data={items}
          selectable
          selectedIds={selectedIds}
          onSelectedIdsChange={setSelectedIds}
          pageSize={10}
          emptyTitle="No saved reports yet"
          rowActions={(row) => (
            <>
              <button onClick={() => openEdit(row)} className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-primary-600 dark:hover:bg-gray-800" aria-label="Edit report">
                <Pencil className="h-3.5 w-3.5" />
              </button>
              <button onClick={() => handleExportSavedReport(row)} className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-primary-600 dark:hover:bg-gray-800" aria-label="Export report">
                <FileDown className="h-3.5 w-3.5" />
              </button>
              <button onClick={() => setDeleteTarget(row)} className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:bg-danger/10 hover:text-danger" aria-label="Delete report">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </>
          )}
        />
      </div>

      <ReportFormModal isOpen={formOpen} onClose={() => setFormOpen(false)} onSubmit={handleSubmit} initialData={editingReport} submitting={busy} />

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title={`Delete ${deleteTarget?.name}?`}
        description="This will permanently remove the saved report configuration."
        confirmLabel="Delete"
      />
    </div>
  );
}
