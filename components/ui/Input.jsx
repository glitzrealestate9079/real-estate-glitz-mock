"use client";

import { forwardRef } from "react";
import { cn } from "@/utils/cn";

/** Text/number/email/etc input with built-in label + error, for react-hook-form's register(). */
const Input = forwardRef(function Input(
  { label, error, hint, required, icon: Icon, className, containerClassName, ...props },
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
        {Icon && <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />}
        <input
          ref={ref}
          className={cn(
            "h-10 w-full rounded-lg border bg-white px-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400",
            "focus:border-accent-400 focus:ring-2 focus:ring-accent-100",
            "disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400",
            "dark:bg-gray-900 dark:text-gray-100 dark:placeholder:text-gray-500 dark:disabled:bg-gray-800/50",
            Icon && "pl-9",
            error
              ? "border-danger focus:border-danger focus:ring-danger/20"
              : "border-gray-200 dark:border-gray-700",
            className
          )}
          {...props}
        />
      </div>
      {hint && !error && <p className="mt-1 text-xs text-gray-400">{hint}</p>}
      {error && <p className="mt-1 text-xs text-danger">{error}</p>}
    </div>
  );
});

export default Input;
