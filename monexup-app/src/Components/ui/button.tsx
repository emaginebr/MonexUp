import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";

/**
 * Button — shadcn-style primitive bound to MonexUp semantic tokens.
 *
 * Variants chosen to match the home redesign spec:
 *  - `default`  : brand-orange filled with glow shadow (used for primary CTAs)
 *  - `outline`  : transparent with strong border (light-surface secondary)
 *  - `outlineDark` : transparent with white-ish border for dark surfaces
 *  - `ghost`    : link-styled with hover overlay
 *  - `link`     : underlined inline link
 */
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-semibold transition-colors duration-normal ease-standard focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "cta-primary bg-orange-500 text-white hover:bg-orange-600 shadow-glow-md",
        outline:
          "border border-graphite-900 text-graphite-900 hover:bg-graphite-900 hover:text-white",
        outlineDark:
          "border border-white/30 text-mnx-neutral-50 hover:border-white/60 hover:bg-white/5",
        ghost: "text-graphite-100 hover:bg-white/5 hover:text-white",
        link: "text-orange-600 hover:text-orange-700 underline-offset-4 hover:underline",
      },
      size: {
        default: "h-12 px-6",
        sm: "h-10 px-4 text-sm",
        lg: "h-14 px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
