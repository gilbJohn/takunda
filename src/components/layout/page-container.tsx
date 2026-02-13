import { cn } from "@/lib/utils/cn";

interface PageContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Max width: sm (28rem), md (32rem), lg (42rem), xl (56rem), full */
  maxWidth?: "sm" | "md" | "lg" | "xl" | "full";
}

const maxWidthClasses = {
  sm: "max-w-2xl",
  md: "max-w-3xl",
  lg: "max-w-4xl",
  xl: "max-w-5xl",
  full: "max-w-full",
};

export function PageContainer({
  className,
  maxWidth = "lg",
  children,
  ...props
}: PageContainerProps) {
  return (
    <div
      className={cn(
        "container w-full space-y-8",
        "px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10",
        maxWidthClasses[maxWidth],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
