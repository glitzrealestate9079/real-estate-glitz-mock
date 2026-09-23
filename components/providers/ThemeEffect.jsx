"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/useReduxHooks";
import { setColorTheme, setDarkMode } from "@/redux/slices/uiSlice";
import { DEFAULT_THEME_ID, getTheme } from "@/lib/themes";

/**
 * Syncs Redux ui.darkMode/colorTheme <-> the <html> element (class + CSS custom properties)
 * and localStorage. A blocking inline script in layout.jsx already applies both before first
 * paint (see COLOR_SCRIPT there) — this effect keeps Redux state in sync with what that script
 * did on load, and re-applies the DOM whenever either value changes afterwards.
 * Renders nothing; mounted once from the root layout.
 */
export default function ThemeEffect() {
  const dispatch = useAppDispatch();
  const darkMode = useAppSelector((state) => state.ui.darkMode);
  const colorTheme = useAppSelector((state) => state.ui.colorTheme);

  // Read the saved/system preference once on mount.
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem("rea-admin-theme");
      if (saved === "dark" || saved === "light") {
        dispatch(setDarkMode(saved === "dark"));
      } else {
        dispatch(setDarkMode(window.matchMedia("(prefers-color-scheme: dark)").matches));
      }
    } catch {
      dispatch(setDarkMode(window.matchMedia("(prefers-color-scheme: dark)").matches));
    }

    try {
      const savedTheme = window.localStorage.getItem("rea-admin-color-theme");
      if (savedTheme) dispatch(setColorTheme(savedTheme));
    } catch {
      // ignore — default theme already in initial state
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reflect darkMode -> <html class="dark"> and persist it.
  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    try {
      window.localStorage.setItem("rea-admin-theme", darkMode ? "dark" : "light");
    } catch {
      // ignore write failures (private browsing etc.)
    }
  }, [darkMode]);

  // Reflect colorTheme -> CSS custom properties on <html> and persist it.
  useEffect(() => {
    const theme = getTheme(colorTheme);
    const root = document.documentElement;
    for (const [key, value] of Object.entries(theme.vars)) {
      root.style.setProperty(key, value);
    }
    try {
      window.localStorage.setItem("rea-admin-color-theme", colorTheme || DEFAULT_THEME_ID);
    } catch {
      // ignore write failures (private browsing etc.)
    }
  }, [colorTheme]);

  return null;
}
