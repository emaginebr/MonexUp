import { LucideIcon } from "lucide-react";

/**
 * SidebarItem — single nav row for the admin sidebar.
 *
 * Visual contract: editorial-brutalist dark surface, with a 3px orange
 * left accent bar on the active row, soft `bg-white/5` row background,
 * and a compact 16px lucide icon paired with a label. When the parent
 * sidebar is collapsed (icon rail), the label is hidden and the row
 * shrinks to a square so only the icon shows. The native `title`
 * attribute carries the label so hovering still surfaces the name on
 * `<lg` rails.
 */
export interface SidebarItemProps {
  icon: LucideIcon;
  label: string;
  active: boolean;
  collapsed: boolean;
  onClick: () => void;
}

export default function SidebarItem({
  icon: Icon,
  label,
  active,
  collapsed,
  onClick,
}: SidebarItemProps) {
  // Two visual atoms: the 3px left accent strip (orange when active,
  // transparent otherwise) and the row body (rounded, hover/active tint).
  return (
    <button
      type="button"
      onClick={onClick}
      title={collapsed ? label : undefined}
      aria-current={active ? "page" : undefined}
      className={[
        "group relative w-full flex items-center gap-3 h-10 rounded-md",
        "text-sm font-medium transition-colors duration-fast",
        collapsed ? "justify-center px-0" : "pl-3 pr-3",
        active
          ? "bg-white/5 text-white shadow-glow-sm"
          : "text-graphite-200 hover:text-white hover:bg-white/5",
      ].join(" ")}
    >
      {/* Left accent bar — only rendered when active so inactive rows
          don't reserve visual space for an empty strip. */}
      {active && (
        <span
          aria-hidden="true"
          className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-r-sm bg-orange-500"
        />
      )}

      <Icon
        size={17}
        className={active ? "text-orange-400" : "text-graphite-300 group-hover:text-graphite-100"}
        aria-hidden="true"
      />
      {!collapsed && <span className="truncate">{label}</span>}
    </button>
  );
}
