import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * `cn` — combine class names with Tailwind-aware merging.
 * Mirrors the shadcn/ui convention so primitives in `src/components/ui/*`
 * stay drop-in compatible with the broader shadcn ecosystem.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
