"use client";

import { motion } from "framer-motion";
import { cn } from "@/utils/cn";

/**
 * Base rounded card used everywhere. Pass title/action for a header row,
 * or just children for a plain container.
 */
export default function Card({ title, description, action, hover = false, className, children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      whileHover={hover ? { y: -2 } : undefined}
      className={cn(
        "rounded-2xl border border-gray-100 bg-white p-5 shadow-card transition-shadow",
        hover && "hover:shadow-card-hover",
        "dark:border-gray-800 dark:bg-surface-dark-subtle",
        className
      )}
    >
      {(title || action) && (
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            {title && <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">{title}</h3>}
            {description && <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">{description}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </motion.div>
  );
}
