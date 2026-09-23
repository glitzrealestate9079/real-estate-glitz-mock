"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/utils/cn";

const ALIGN = { right: "right-0", left: "left-0" };

/**
 * Shared open/close + backdrop + animation shell behind every topbar/profile dropdown
 * (notifications, messages, quick add, profile, theme palette). Before this existed, each one
 * reimplemented the same open-state, outside-click and enter/exit-animation boilerplate — this
 * is that logic in one place, plus Escape-to-close, which none of them had.
 *
 * `trigger` and `children` are render props so callers keep full control of their own button
 * and panel markup: `trigger({ open, toggle })` for the button, `children({ close })` for the
 * panel content (so a menu item's onClick can call `close()` after acting).
 */
export default function Dropdown({ trigger, children, panelClassName, align = "right" }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    function handleKey(e) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open]);

  return (
    <div className="relative">
      {trigger({ open, toggle: () => setOpen((o) => !o) })}

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: -6 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -6 }}
              transition={{ duration: 0.15 }}
              className={cn(
                "absolute z-50 mt-2 max-w-[90vw] overflow-hidden rounded-xl border border-gray-100 bg-white shadow-xl dark:border-gray-800 dark:bg-surface-dark-subtle",
                ALIGN[align],
                panelClassName
              )}
            >
              {children({ close: () => setOpen(false) })}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
