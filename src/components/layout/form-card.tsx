import { cn } from "@/lib/utils/cn";

export function FormCard({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "w-full space-y-6 rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-lg sm:p-8",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
