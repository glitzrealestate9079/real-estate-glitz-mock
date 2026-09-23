"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/utils/cn";

const SIZES = {
  sm: "max-w-sm",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
};

/**
 * Controlled modal used for review panels, add/edit forms, confirmations.
 * Props: isOpen, onClose, title, description, size, footer, children
 *
 * Rendered through a portal straight into <body>. AdminShell's route-transition wrapper
 * (<motion.main>) carries a CSS transform while animating page changes, and ANY transform on an
 * ancestor makes `position: fixed` descendants position themselves relative to that ancestor
 * instead of the real viewport. Left in place, that clipped the backdrop to the main content
 * column — leaving the topbar/sidebar strip undimmed (the reported "gap from the top") and
 * making the backdrop-blur repaint against the wrong box on open/close (the reported "blink").
 * Portaling out of the page tree sidesteps the ancestor entirely, so this is correct regardless
 * of what future page-level animations do.
 */
export default function Modal({ isOpen, onClose, title, description, size = "md", footer, children }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.18 }}
            className={cn(
              "relative z-10 flex max-h-[85vh] w-full flex-col rounded-2xl bg-white shadow-xl dark:bg-surface-dark-subtle",
              SIZES[size]
            )}
          >
            <div className="flex items-start justify-between border-b border-gray-100 px-5 py-4 dark:border-gray-800">
              <div>
                {title && <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">{title}</h2>}
                {description && (
                  <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">{description}</p>
                )}
              </div>
              <button
                onClick={onClose}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="scrollbar-thin flex-1 overflow-y-auto px-5 py-4">{children}</div>
            {footer && (
              <div className="flex items-center justify-end gap-2 border-t border-gray-100 px-5 py-4 dark:border-gray-800">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
