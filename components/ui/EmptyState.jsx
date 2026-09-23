"use client";

import { motion } from "framer-motion";
import { Inbox } from "lucide-react";

/** Shown when a table/list has no rows (post-filter, or genuinely empty). */
export default function EmptyState({ icon: Icon = Inbox, title = "Nothing here yet", description, action }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
      className="flex flex-col items-center justify-center px-6 py-14 text-center"
    >
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500">
        <Icon className="h-6 w-6" />
      </div>
      <p className="text-sm font-medium text-gray-700 dark:text-gray-200">{title}</p>
      {description && <p className="mt-1 max-w-sm text-xs text-gray-500 dark:text-gray-400">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </motion.div>
  );
}
