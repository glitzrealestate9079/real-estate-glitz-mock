"use client";

import { forwardRef } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/utils/cn";

/** Native <select> styled to match Input — options: [{ value, label }] or pass children directly. */
const Select = forwardRef(function Select(
  { label, error, hint, required, options, placeholder, className, containerClassName, children, ...props },
  ref
) {
  return (
    <div className={cn("w-full", containerClassName)}>
      {label && (
        <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label} {required && <span className="text-danger">*</span>}
        </label>
      )}
      <div className="relative">
        <select
          ref={ref}
          className={cn(
            "h-10 w-full appearance-none rounded-lg border bg-white px-3 pr-9 text-sm text-gray-900 outline-none transition",
            "focus:border-accent-400 focus:ring-2 focus:ring-accent-100",
            "dark:bg-gray-900 dark:text-gray-100",
            error
              ? "border-danger focus:border-danger focus:ring-danger/20"
              : "border-gray-200 dark:border-gray-700",
            className
          )}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options
            ? options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))
            : children}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
      </div>
      {hint && !error && <p className="mt-1 text-xs text-gray-400">{hint}</p>}
      {error && <p className="mt-1 text-xs text-danger">{error}</p>}
    </div>
  );
});

export default Select;
