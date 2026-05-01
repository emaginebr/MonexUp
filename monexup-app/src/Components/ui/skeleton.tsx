import * as React from "react";
import { cn } from "../../lib/utils";

/**
 * Skeleton — shadcn-flavored loading placeholder.
 * Replaces `react-loading-skeleton` on the home route. Other pages keep
 * the legacy library until they are migrated.
 */
function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-graphite-200/60 dark:bg-graphite-700/60",
        className
      )}
      style={{ background: "rgba(154, 154, 163, 0.18)" }}
      {...props}
    />
  );
}

export { Skeleton };
