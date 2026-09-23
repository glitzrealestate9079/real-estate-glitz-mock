"use client";

import { forwardRef } from "react";
import { cn } from "@/utils/cn";

const Textarea = forwardRef(function Textarea(
  { label, error, hint, required, rows = 3, className, containerClassName, ...props },
  ref
) {
  return (
    <div className={cn("w-full", containerClassName)}>
      {label && (
        <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label} {required && <span className="text-danger">*</span>}
        </label>
      )}
      <textarea
        ref={ref}
        rows={rows}
        className={cn(
          "w-full resize-y rounded-lg border bg-white px-3 py-2 text-sm text-gray-900 outline-none transition placeholder:text-gray-400",
          "focus:border-accent-400 focus:ring-2 focus:ring-accent-100",
          "dark:bg-gray-900 dark:text-gray-100 dark:placeholder:text-gray-500",
          error
            ? "border-danger focus:border-danger focus:ring-danger/20"
            : "border-gray-200 dark:border-gray-700",
          className
        )}
        {...props}
      />
      {hint && !error && <p className="mt-1 text-xs text-gray-400">{hint}</p>}
      {error && <p className="mt-1 text-xs text-danger">{error}</p>}
    </div>
  );
});

export default Textarea;
