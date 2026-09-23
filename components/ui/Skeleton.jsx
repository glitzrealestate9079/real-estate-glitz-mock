import { cn } from "@/utils/cn";

export function Skeleton({ className }) {
  return <div className={cn("skeleton rounded-md", className)} />;
}

/** A skeleton row matching <Table>'s column count, used while data is loading. */
export function SkeletonRow({ columns = 4 }) {
  return (
    <tr>
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <Skeleton className="h-4 w-full max-w-[140px]" />
        </td>
      ))}
    </tr>
  );
}
