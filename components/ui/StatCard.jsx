"use client";

import { useId } from "react";
import { motion } from "framer-motion";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { cn } from "@/utils/cn";

const SPARK_W = 84;
const SPARK_H = 34;

/** Tiny decorative trend squiggle for a StatCard — no chart library needed at this size. */
function Sparkline({ data, positive }) {
  const gradientId = useId();
  if (!data || data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const step = SPARK_W / (data.length - 1);

  const points = data.map((v, i) => {
    const x = i * step;
    const y = SPARK_H - ((v - min) / range) * (SPARK_H - 4) - 2;
    return [x, y];
  });

  const linePath = points.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const areaPath = `${linePath} L${SPARK_W},${SPARK_H} L0,${SPARK_H} Z`;
  const stroke = positive ? "#16A34A" : "#DC2626";

  return (
    <svg
      viewBox={`0 0 ${SPARK_W} ${SPARK_H}`}
      className="h-8 w-20 shrink-0"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity="0.28" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#${gradientId})`} stroke="none" />
      <path d={linePath} fill="none" stroke={stroke} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * Dashboard KPI tile: icon + label + value + optional trend + optional sparkline.
 * trend: { value: "8.2%", direction: "up" | "down" }
 * sparkline: number[] — small series rendered as a mini trend chart.
 */
export default function StatCard({ icon: Icon, label, value, trend, accent = "primary", sparkline }) {
  const isUp = trend?.direction === "up";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.25 }}
      className="rounded-2xl border border-gray-100 bg-white p-5 shadow-card hover:shadow-card-hover dark:border-gray-800 dark:bg-surface-dark-subtle"
    >
      <div className="flex items-center justify-between">
        <div
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-xl",
            accent === "primary" && "bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400",
            accent === "gray" && "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300"
          )}
        >
          {Icon && <Icon className="h-5 w-5" />}
        </div>
        {trend && (
          <span
            className={cn(
              "flex items-center gap-0.5 text-xs font-medium",
              isUp ? "text-success dark:text-emerald-400" : "text-danger dark:text-red-400"
            )}
          >
            {isUp ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
            {trend.value}
          </span>
        )}
      </div>
      <div className="mt-4 flex items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-gray-50">{value}</p>
          <p className="mt-1 text-xs font-medium text-gray-500 dark:text-gray-400">{label}</p>
        </div>
        {sparkline && <Sparkline data={sparkline} positive={isUp} />}
      </div>
    </motion.div>
  );
}
