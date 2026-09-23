"use client";

import { cn } from "@/utils/cn";

/**
 * Pill-button group standing in for a radio group (e.g. Transaction Type: Sell/Rent/PG).
 * Controlled component — pair with react-hook-form's <Controller>.
 * options: [{ value, label }]
 */
export default function SegmentedControl({ label, error, required, options, value, onChange, className }) {
  return (
    <div className={cn("w-full", className)}>
      {label && (
        <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label} {required && <span className="text-danger">*</span>}
        </label>
      )}
      <div className="inline-flex flex-wrap gap-1.5 rounded-lg border border-gray-200 bg-gray-50 p-1 dark:border-gray-700 dark:bg-gray-900">
        {options.map((opt) => {
          const isActive = opt.value === value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                isActive
                  ? "bg-white text-primary-600 shadow-sm dark:bg-gray-800 dark:text-primary-400"
                  : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              )}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
      {error && <p className="mt-1 text-xs text-danger">{error}</p>}
    </div>
  );
}
