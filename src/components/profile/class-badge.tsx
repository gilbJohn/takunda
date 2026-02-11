import { cn } from "@/lib/utils/cn";

export interface ClassBadgeProps {
  name: string;
  code?: string;
  className?: string;
}

export function ClassBadge({ name, code, className }: ClassBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-300",
        className
      )}
    >
      {code ? `${code} — ${name}` : name}
    </span>
  );
}
