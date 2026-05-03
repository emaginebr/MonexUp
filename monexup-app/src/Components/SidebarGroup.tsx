import { ReactNode } from "react";

/**
 * SidebarGroup — labelled cluster of nav rows.
 *
 * Renders a small uppercase eyebrow above its children, mirroring the
 * grouping pattern already used in the Header dropdowns ("Finances",
 * "Network Manager", etc.). When the sidebar is collapsed, the eyebrow
 * is replaced by a short divider so the icon rail keeps its rhythm
 * without the extra text noise.
 */
export interface SidebarGroupProps {
  label: string;
  collapsed: boolean;
  children: ReactNode;
}

export default function SidebarGroup({
  label,
  collapsed,
  children,
}: SidebarGroupProps) {
  return (
    <div className="mt-5 first:mt-0">
      {collapsed ? (
        <div
          aria-hidden="true"
          className="mx-3 mb-2 h-px bg-white/5"
        />
      ) : (
        <p className="px-3 mb-2 text-[0.65rem] uppercase tracking-wider font-semibold text-graphite-400">
          {label}
        </p>
      )}
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}
