import { cn } from "@/lib/utils/cn";

export interface ClassBadgeProps {
  name: string;
  code?: string;
  className?: string;
}

export function ClassBadge({ name, code, className }: ClassBadgeProps) {
  const label = code ? `${code} — ${name}` : name;
  return (
    <span
      className={cn(
        "inline-block max-w-[140px] truncate rounded-full bg-emerald-600/15 px-2.5 py-0.5 text-xs font-medium text-emerald-500",
        className
      )}
      title={label}
    >
      {label}
    </span>
  );
}
