"use client";

import { useEffect, useState } from "react";

/** Debounces a fast-changing value (e.g. a search input) by `delay` ms. */
export function useDebouncedValue(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timeout = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timeout);
  }, [value, delay]);

  return debounced;
}
