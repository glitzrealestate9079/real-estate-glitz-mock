"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Building, X } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/hooks/useReduxHooks";
import { closeMobileDrawer } from "@/redux/slices/uiSlice";
import SidebarNav from "./SidebarNav";

/** Slide-in nav drawer for < lg screens; mirrors Sidebar's content. */
export default function MobileDrawer() {
  const dispatch = useAppDispatch();
  const open = useAppSelector((state) => state.ui.mobileDrawerOpen);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-gray-900/50"
            onClick={() => dispatch(closeMobileDrawer())}
          />
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 34 }}
            className="relative flex h-full w-72 max-w-[80vw] flex-col bg-sidebar shadow-xl dark:bg-surface-dark-subtle"
          >
            <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4 dark:border-gray-800">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg brand-gradient text-white">
                  <Building className="h-[18px] w-[18px]" />
                </div>
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Real Estate Admin</p>
              </div>
              <button
                onClick={() => dispatch(closeMobileDrawer())}
                className="rounded-lg p-1.5 text-sidebar-muted hover:bg-sidebar-hover hover:text-sidebar-foreground dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100"
                aria-label="Close menu"
              >
                <X className="h-[18px] w-[18px]" />
              </button>
            </div>
            <SidebarNav onNavigate={() => dispatch(closeMobileDrawer())} />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
