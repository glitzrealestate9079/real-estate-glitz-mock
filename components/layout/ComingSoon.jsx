"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import Card from "@/components/ui/Card";

/**
 * Placeholder used by module pages not yet built (build order: Dashboard -> Listings
 * -> Users -> Leads -> Payments -> Builders -> Reviews -> Reports -> CMS -> Township -> Settings).
 */
export default function ComingSoon({ title, description, features = [] }) {
  return (
    <div className="mx-auto max-w-2xl py-10">
      <Card className="text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400"
        >
          <Sparkles className="h-6 w-6" />
        </motion.div>
        <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h1>
        <p className="mx-auto mt-1.5 max-w-md text-sm text-gray-500 dark:text-gray-400">{description}</p>

        {features.length > 0 && (
          <ul className="mx-auto mt-6 max-w-md space-y-2 text-left">
            {features.map((f) => (
              <li key={f} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary-400" />
                {f}
              </li>
            ))}
          </ul>
        )}

        <p className="mt-6 text-xs font-medium text-gray-400 dark:text-gray-500">
          This module is built next, once you say go.
        </p>
      </Card>
    </div>
  );
}
