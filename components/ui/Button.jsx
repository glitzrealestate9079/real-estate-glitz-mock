"use client";

import { forwardRef } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { cn } from "@/utils/cn";

const VARIANTS = {
  primary:
    "brand-gradient text-white focus-visible:ring-accent-300 shadow-sm shadow-primary-600/20",
  secondary:
    "bg-primary-900 text-white hover:bg-primary-700 focus-visible:ring-primary-300 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-white",
  outline:
    "border border-gray-300 text-gray-700 hover:bg-gray-50 focus-visible:ring-gray-200 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800",
  ghost:
    "text-gray-600 hover:bg-gray-100 focus-visible:ring-gray-200 dark:text-gray-300 dark:hover:bg-gray-800",
  danger:
    "bg-danger text-white hover:bg-danger/90 focus-visible:ring-danger/30 shadow-sm",
  success:
    "bg-success text-white hover:bg-success/90 focus-visible:ring-success/30 shadow-sm",
};

const SIZES = {
  sm: "h-8 px-3 text-xs gap-1.5",
  md: "h-10 px-4 text-sm gap-2",
  lg: "h-11 px-5 text-sm gap-2",
};

/**
 * Shared action button used across every module (approve/reject/save/etc.).
 * Props: variant, size, loading, disabled, icon (a lucide component), plus native button props.
 */
const Button = forwardRef(function Button(
  { className, variant = "primary", size = "md", loading = false, disabled, icon: Icon, children, ...props },
  ref
) {
  return (
    <motion.button
      ref={ref}
      whileTap={{ scale: 0.97 }}
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center rounded-lg font-medium transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1",
        "disabled:cursor-not-allowed disabled:opacity-60",
        VARIANTS[variant],
        SIZES[size],
        className
      )}
      {...props}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        Icon && <Icon className="h-4 w-4" />
      )}
      {children}
    </motion.button>
  );
});

export default Button;
