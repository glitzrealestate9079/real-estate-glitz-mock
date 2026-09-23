"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";

/**
 * Auto-opens a module's Add form when it's reached via the topbar's Quick Add dropdown
 * (`?new=1`), then strips the param so refreshing or navigating back doesn't reopen it.
 *
 * A fresh client-side navigation to a not-yet-visited route in this app remounts the target page
 * a couple hundred ms after its first paint (reproduces on plain sidebar links too, nothing to do
 * with this flow specifically — an App Router navigation quirk, not a bug in this hook). An
 * earlier version called `openAdd()` on every fire so the modal would still end up open on
 * whichever mount turned out to be the settled one — that fixed the modal silently never
 * reopening, but since the modal actually opened on *both* the first mount and the remount, its
 * entrance animation played twice back to back, which read as the modal blinking open. Fix:
 * debounce the open itself — wait until refires have gone quiet (i.e. the remount has already
 * happened) before ever calling `openAdd()`, so only the final settled mount opens it, once.
 */
export function useQuickAddParam(openAdd) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const timer = useRef(null);

  useEffect(() => {
    if (searchParams.get("new") !== "1") return;

    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      openAdd();
      window.history.replaceState(null, "", pathname);
    }, 400);

    return () => clearTimeout(timer.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);
}
