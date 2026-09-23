"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/useReduxHooks";
import { login, setHydrated } from "@/redux/slices/authSlice";

const STORAGE_KEY = "rea-admin-session";

/**
 * Restores the mock login session from localStorage on mount (same pattern as ThemeEffect) and
 * persists it whenever it changes. Mounted once from the root layout.
 */
export default function AuthEffect() {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const user = useAppSelector((state) => state.auth.user);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsedUser = JSON.parse(saved);
        if (parsedUser?.email) dispatch(login(parsedUser));
      }
    } catch {
      // ignore — treat as logged out
    } finally {
      dispatch(setHydrated(true));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    try {
      if (isAuthenticated && user) {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      } else {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      // ignore write failures (private browsing etc.)
    }
  }, [isAuthenticated, user]);

  return null;
}
