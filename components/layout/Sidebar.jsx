"use client";

import { motion } from "framer-motion";
import { Building, ChevronsLeft, ChevronsRight } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/hooks/useReduxHooks";
import { toggleSidebarCollapsed } from "@/redux/slices/uiSlice";
import SidebarNav from "./SidebarNav";

/** Persistent desktop sidebar — hidden below lg, collapses to icon rail. */
export default function Sidebar() {
  const dispatch = useAppDispatch();
  const collapsed = useAppSelector((state) => state.ui.sidebarCollapsed);

  return (
    <motion.aside
      animate={{ width: collapsed ? 76 : 256 }}
      transition={{ type: "spring", stiffness: 260, damping: 30 }}
      className="sticky top-0 hidden h-screen shrink-0 flex-col border-r border-sidebar-border bg-sidebar dark:border-gray-800 dark:bg-surface-dark-subtle lg:flex print:hidden"
    >
      <div className="flex h-16 items-center gap-2.5 border-b border-sidebar-border px-4 dark:border-gray-800">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg brand-gradient text-white">
          <Building className="h-[18px] w-[18px]" />
        </div>
        {!collapsed && (
          <div className="min-w-0 leading-tight">
            <p className="truncate text-sm font-semibold text-gray-900 dark:text-gray-100">Real Estate Admin</p>
            <p className="truncate text-[11px] text-sidebar-muted dark:text-gray-400">Marketplace Control Panel</p>
          </div>
        )}
      </div>

      <SidebarNav collapsed={collapsed} />

      <div className="border-t border-sidebar-border p-2.5 dark:border-gray-800">
        <button
          onClick={() => dispatch(toggleSidebarCollapsed())}
          className="flex w-full items-center justify-center gap-2 rounded-lg py-2 text-xs font-medium text-sidebar-muted transition-colors hover:bg-sidebar-hover hover:text-sidebar-foreground dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100"
        >
          {collapsed ? <ChevronsRight className="h-4 w-4" /> : <ChevronsLeft className="h-4 w-4" />}
          {!collapsed && "Collapse"}
        </button>
      </div>
    </motion.aside>
  );
}
