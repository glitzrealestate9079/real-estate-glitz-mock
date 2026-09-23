"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import { ChevronRight, Home, Loader2 } from "lucide-react";
import Link from "next/link";
import { NAV_ITEMS } from "@/lib/navigation";
import { useAppSelector } from "@/hooks/useReduxHooks";
import Sidebar from "./Sidebar";
import MobileDrawer from "./MobileDrawer";
import Topbar from "./Topbar";

/** Top-level admin chrome: sidebar + mobile drawer + topbar + breadcrumb + animated route content. */
export default function AdminShell({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const currentItem = NAV_ITEMS.find((item) => pathname?.startsWith(item.href));
  const hydrated = useAppSelector((state) => state.auth.hydrated);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  // Client-side auth gate — this is a frontend-only mock (session lives in localStorage, not a
  // server cookie), so the check runs here rather than in middleware. `hydrated` guards against
  // redirecting before AuthEffect has had a chance to restore a saved session on first mount.
  useEffect(() => {
    if (hydrated && !isAuthenticated) router.replace("/login");
  }, [hydrated, isAuthenticated, router]);

  if (!hydrated || !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-subtle dark:bg-surface-dark">
        <Loader2 className="h-6 w-6 animate-spin text-primary-500" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-surface-subtle dark:bg-surface-dark">
      <Sidebar />
      <MobileDrawer />

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />

        <div className="flex items-center gap-1.5 px-4 pt-4 text-xs text-gray-500 dark:text-gray-400 sm:px-6">
          <Link href="/admin/dashboard" className="flex items-center gap-1 hover:text-primary-600">
            <Home className="h-3.5 w-3.5" />
            Home
          </Link>
          {currentItem && (
            <>
              <ChevronRight className="h-3.5 w-3.5 text-gray-300 dark:text-gray-600" />
              <span className="font-medium text-gray-700 dark:text-gray-200">{currentItem.label}</span>
            </>
          )}
        </div>

        <AnimatePresence mode="wait">
          <motion.main
            key={pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="flex-1 p-4 sm:p-6"
          >
            {children}
          </motion.main>
        </AnimatePresence>
      </div>
    </div>
  );
}
