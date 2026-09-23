"use client";

import { Menu, Moon, Search, Sun } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/hooks/useReduxHooks";
import { openMobileDrawer, toggleDarkMode } from "@/redux/slices/uiSlice";
import NotificationDropdown from "./NotificationDropdown";
import MessagesDropdown from "./MessagesDropdown";
import QuickAddDropdown from "./QuickAddDropdown";
import ProfileDropdown from "./ProfileDropdown";
import ThemePaletteDropdown from "./ThemePaletteDropdown";

export default function Topbar() {
  const dispatch = useAppDispatch();
  const darkMode = useAppSelector((state) => state.ui.darkMode);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-gray-100 bg-white/80 px-4 backdrop-blur dark:border-gray-800 dark:bg-surface-dark/80 print:hidden">
      <button
        onClick={() => dispatch(openMobileDrawer())}
        className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 lg:hidden"
        aria-label="Open menu"
      >
        <Menu className="h-[18px] w-[18px]" />
      </button>

      <div className="relative hidden max-w-sm flex-1 sm:block">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          placeholder="Search listings, users, leads..."
          className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-9 pr-3 text-sm text-gray-700 outline-none transition focus:border-accent-400 focus:bg-white focus:ring-2 focus:ring-accent-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
        />
      </div>

      <div className="ml-auto flex items-center gap-1.5">
        <button
          onClick={() => dispatch(toggleDarkMode())}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200"
          aria-label="Toggle dark mode"
        >
          {darkMode ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
        </button>
        <ThemePaletteDropdown />
        <QuickAddDropdown />
        <MessagesDropdown />
        <NotificationDropdown />
        <div className="mx-1 hidden h-6 w-px bg-gray-200 dark:bg-gray-700 sm:block" />
        <ProfileDropdown />
      </div>
    </header>
  );
}
