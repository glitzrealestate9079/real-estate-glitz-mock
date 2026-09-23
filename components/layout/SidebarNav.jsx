"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { NAV_ITEMS } from "@/lib/navigation";
import { cn } from "@/utils/cn";
import Tooltip from "@/components/ui/Tooltip";

/**
 * Pure nav list — shared between the desktop Sidebar and the mobile drawer
 * so active-route styling and icons never drift between the two.
 */
export default function SidebarNav({ collapsed = false, onNavigate }) {
  const pathname = usePathname();

  let lastGroup = null;

  return (
    <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-2.5 py-2 scrollbar-thin">
      {NAV_ITEMS.map((item) => {
        const isActive = pathname?.startsWith(item.href);
        const Icon = item.icon;
        const showGroupLabel = item.group && item.group !== lastGroup;
        lastGroup = item.group ?? lastGroup;

        return (
          <div key={item.id}>
            {showGroupLabel && !collapsed && (
              <p className="mb-1 mt-4 truncate px-3 text-[11px] font-semibold uppercase tracking-wider text-gray-400 first:mt-1 dark:text-gray-600">
                {item.group}
              </p>
            )}
            {showGroupLabel && collapsed && (
              <div className="mx-3 my-3 h-px bg-sidebar-border first:mt-1 dark:bg-gray-800" />
            )}
            <Tooltip content={item.label} side="right" disabled={!collapsed}>
              <Link
                href={item.href}
                onClick={onNavigate}
                className={cn(
                  "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-sidebar-active text-primary-600 font-semibold dark:bg-primary-500/15 dark:text-primary-300"
                    : "text-sidebar-muted hover:bg-sidebar-hover hover:text-sidebar-foreground dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100"
                )}
              >
                {isActive && (
                  <motion.span
                    layoutId="sidebar-active-indicator"
                    className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-accent-500"
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  />
                )}
                <Icon className="h-[18px] w-[18px] shrink-0" />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </Link>
            </Tooltip>
          </div>
        );
      })}
    </nav>
  );
}
