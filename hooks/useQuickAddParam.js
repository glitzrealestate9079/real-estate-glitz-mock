"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";

/**
 * Auto-opens a module's Add form when it's reached via the topbar's Quick Add dropdown
 * (`?new=1`), then strips the param so refreshing or navigating back doesn't reopen it.
 *
 * A fresh client-side navigation to a not-yet-visited route in this app remounts the target page
 * a couple hundred ms after its first paint (reproduces on plain sidebar links too, nothing to do
 * with this flow specifically — an App Router navigation quirk, not a bug in this hook). Stripping
 * `?new=1` immediately used to race that remount: the URL was already clean by the time the
 * remount's own effect checked it, so the modal opened once and then silently never came back,
 * reading as a blink. Fix: keep re-opening (a no-op if already open) on every fire instead of
 * stripping right away, and only clean up the URL once refires have gone quiet for a bit — so
 * whichever mount turns out to be the settled one still ends up with the modal open.
 */
export function useQuickAddParam(openAdd) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const cleanupTimer = useRef(null);

  useEffect(() => {
    if (searchParams.get("new") !== "1") return;

    openAdd();

    clearTimeout(cleanupTimer.current);
    cleanupTimer.current = setTimeout(() => {
      window.history.replaceState(null, "", pathname);
    }, 800);

    return () => clearTimeout(cleanupTimer.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);
}
