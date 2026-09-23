"use client";

import { forwardRef } from "react";
import { cn } from "@/utils/cn";

const Checkbox = forwardRef(function Checkbox({ label, error, className, containerClassName, ...props }, ref) {
  return (
    <div className={cn("w-full", containerClassName)}>
      <label className="flex cursor-pointer items-center gap-2.5 text-sm text-gray-700 dark:text-gray-300">
        <input
          ref={ref}
          type="checkbox"
          className={cn(
            "h-4 w-4 shrink-0 rounded border-gray-300 text-primary-600 focus:ring-accent-400 dark:border-gray-600 dark:bg-gray-800",
            className
          )}
          {...props}
        />
        {label}
      </label>
      {error && <p className="mt-1 text-xs text-danger">{error}</p>}
    </div>
  );
});

export default Checkbox;
