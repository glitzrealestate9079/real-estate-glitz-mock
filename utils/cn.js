import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind class strings safely (later classes win on conflicts).
 * Usage: cn("px-2 py-1", isActive && "bg-primary-600", className)
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
