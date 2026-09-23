"use client";

import { useEffect, useState } from "react";

/** Returns true/false for a CSS media query, updating live on viewport changes. */
export function useMediaQuery(query) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mediaQueryList = window.matchMedia(query);
    const listener = () => setMatches(mediaQueryList.matches);
    listener();
    mediaQueryList.addEventListener("change", listener);
    return () => mediaQueryList.removeEventListener("change", listener);
  }, [query]);

  return matches;
}
