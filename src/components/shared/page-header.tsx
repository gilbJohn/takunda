import * as React from "react";
import { cn } from "@/lib/utils/cn";

export interface PageHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
}

const PageHeader = React.forwardRef<HTMLDivElement, PageHeaderProps>(
  ({ className, title, description, ...props }, ref) => (
    <div ref={ref} className={cn("space-y-1.5", className)} {...props}>
      <h1 className="text-2xl font-bold tracking-tight text-slate-100 sm:text-3xl">
        {title}
      </h1>
      {description && (
        <p className="text-sm text-slate-400 sm:text-base">
          {description}
        </p>
      )}
    </div>
  )
);
PageHeader.displayName = "PageHeader";

export { PageHeader };
