import { LucideIcon } from "lucide-react";

export interface SectionHeaderProps {
  /** Lucide icon for the section chip. */
  icon: LucideIcon;
  /** Eyebrow / kicker text — uppercase tracking. */
  eyebrow?: string;
  /** Section heading. */
  title: string;
  /** Supporting paragraph below the title. */
  subtitle?: string;
  /** Stable id used to wire the surrounding `aria-labelledby`. */
  id: string;
}

/**
 * SectionHeader — eyebrow + title + supporting copy used at the top of every
 * card section of the NetworkEditPage. Mirrors the dashboard rhythm
 * (`mnx-eyebrow` + `display-headline` + paragraph) but at section scale.
 */
export default function SectionHeader({
  icon: Icon,
  eyebrow,
  title,
  subtitle,
  id,
}: SectionHeaderProps) {
  return (
    <div className="flex items-start gap-4 mb-6">
      <span
        className="mnx-stat-chip mnx-stat-chip--orange"
        aria-hidden="true"
      >
        <Icon size={20} />
      </span>
      <div className="min-w-0">
        {eyebrow && (
          <span className="mnx-eyebrow">{eyebrow}</span>
        )}
        <h2
          id={id}
          className="font-display font-bold text-graphite-900 text-xl sm:text-2xl tracking-tight mt-1"
        >
          {title}
        </h2>
        {subtitle && (
          <p className="mt-1 text-sm text-graphite-500 leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}
