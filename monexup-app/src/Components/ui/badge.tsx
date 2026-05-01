import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";

const badgeVariants = cva(
  "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default: "bg-orange-500 text-white",
        soft: "bg-orange-500/10 text-orange-300 border border-orange-500/30",
        light: "bg-white/95 text-graphite-900",
        outline: "border border-graphite-900 text-graphite-900",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
