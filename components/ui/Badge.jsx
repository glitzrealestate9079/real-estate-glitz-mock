import { cn } from "@/utils/cn";

const VARIANTS = {
  success: "bg-success/10 text-success ring-success/20 dark:bg-success/15 dark:text-emerald-400",
  warning: "bg-warning/10 text-amber-700 ring-warning/25 dark:bg-warning/15 dark:text-amber-400",
  danger: "bg-danger/10 text-danger ring-danger/20 dark:bg-danger/15 dark:text-red-400",
  info: "bg-accent/10 text-accent-700 ring-accent/20 dark:bg-accent/15 dark:text-accent-400",
  neutral: "bg-gray-100 text-gray-700 ring-gray-500/20 dark:bg-gray-800 dark:text-gray-300",
};

const DOT_COLORS = {
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
  info: "bg-accent-500",
  neutral: "bg-gray-400",
};

/** Status pill used in tables/cards, e.g. <Badge variant="warning">Pending</Badge> */
export default function Badge({ variant = "neutral", dot = true, className, children }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset",
        VARIANTS[variant],
        className
      )}
    >
      {dot && <span className={cn("h-1.5 w-1.5 rounded-full", DOT_COLORS[variant])} />}
      {children}
    </span>
  );
}
