"use client";

import { motion } from "framer-motion";
import { AlertTriangle, RotateCcw } from "lucide-react";
import Button from "./Button";

/** Shown when a module fails to load its (mock) data. */
export default function ErrorState({ message = "Something went wrong while loading this data.", onRetry }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
      className="flex flex-col items-center justify-center px-6 py-14 text-center"
    >
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-danger/10 text-danger dark:bg-danger/15">
        <AlertTriangle className="h-6 w-6" />
      </div>
      <p className="text-sm font-medium text-gray-700 dark:text-gray-200">{message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" icon={RotateCcw} className="mt-4" onClick={onRetry}>
          Retry
        </Button>
      )}
    </motion.div>
  );
}
