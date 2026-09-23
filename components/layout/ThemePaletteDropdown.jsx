"use client";

import { Check, Palette } from "lucide-react";
import toast from "react-hot-toast";
import Dropdown from "@/components/ui/Dropdown";
import { useAppDispatch, useAppSelector } from "@/hooks/useReduxHooks";
import { setColorTheme } from "@/redux/slices/uiSlice";
import { COLOR_THEMES } from "@/lib/themes";
import { cn } from "@/utils/cn";

/** Topbar palette switcher — 10 preset admin color themes, applied instantly across the app. */
export default function ThemePaletteDropdown() {
  const dispatch = useAppDispatch();
  const activeId = useAppSelector((state) => state.ui.colorTheme);

  function handlePick(theme) {
    dispatch(setColorTheme(theme.id));
    toast.success(`Theme set to ${theme.name}`);
  }

  return (
    <Dropdown
      panelClassName="w-72"
      trigger={({ toggle }) => (
        <button
          onClick={toggle}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200"
          aria-label="Change color theme"
        >
          <Palette className="h-[18px] w-[18px]" />
        </button>
      )}
    >
      {() => (
        <>
          <div className="border-b border-gray-100 px-4 py-3 dark:border-gray-800">
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Admin Theme</p>
            <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
              Pick a color palette — applies across the whole panel
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 p-3">
            {COLOR_THEMES.map((theme) => {
              const isActive = theme.id === activeId;
              return (
                <button
                  key={theme.id}
                  onClick={() => handlePick(theme)}
                  className={cn(
                    "flex items-center gap-2.5 rounded-lg border px-2.5 py-2 text-left transition-colors",
                    isActive
                      ? "border-accent-400 bg-accent-50 dark:border-accent-500/50 dark:bg-accent-500/10"
                      : "border-gray-100 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800/60"
                  )}
                >
                  <span
                    className="relative flex h-7 w-7 shrink-0 overflow-hidden rounded-full ring-1 ring-black/5"
                    style={{ backgroundColor: theme.swatch.primary }}
                  >
                    <span className="absolute inset-y-0 right-0 w-1/2" style={{ backgroundColor: theme.swatch.accent }} />
                    {isActive && (
                      <span className="absolute inset-0 flex items-center justify-center bg-black/20">
                        <Check className="h-3.5 w-3.5 text-white" />
                      </span>
                    )}
                  </span>
                  <span className="min-w-0 truncate text-xs font-medium text-gray-700 dark:text-gray-200">{theme.name}</span>
                </button>
              );
            })}
          </div>
        </>
      )}
    </Dropdown>
  );
}
