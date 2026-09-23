import { initials } from "@/utils/format";
import { cn } from "@/utils/cn";

const SIZES = {
  sm: "h-7 w-7 text-[10px]",
  md: "h-9 w-9 text-xs",
  lg: "h-11 w-11 text-sm",
  xl: "h-20 w-20 text-2xl",
};

const VARIANTS = {
  gradient: "brand-gradient text-white",
  flat: "bg-accent-50 text-accent-600 dark:bg-accent-500/10 dark:text-accent-400",
};

/** Initials avatar circle — used anywhere a person doesn't have a photo (which is everywhere here). */
export default function Avatar({ name, size = "md", variant = "gradient", className }) {
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full font-semibold",
        SIZES[size],
        VARIANTS[variant],
        className
      )}
    >
      {initials(name)}
    </div>
  );
}
