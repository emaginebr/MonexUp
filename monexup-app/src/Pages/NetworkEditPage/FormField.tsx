import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";

export interface FormFieldProps {
  /** Stable id — wires `<label htmlFor>` and `<input id>`. */
  id: string;
  /** Visible label above the field. */
  label: string;
  /** Optional helper text rendered below the input. */
  helper?: string;
  /** Optional helper rendered to the right of the label (e.g. unit hint). */
  hint?: ReactNode;
  /** Lucide icon shown inside the field as a leading affix. */
  icon?: LucideIcon;
  /** Trailing affix (e.g. "%", "BRL", "days"). */
  suffix?: ReactNode;
  /** When true, renders a thin orange ring on focus-within. */
  children: ReactNode;
}

/**
 * FormField — primitive used by IdentityCard / FinancialCard to wrap an
 * input with the auth-card aesthetic established in LoginPage / NewAccountPage
 * (h-12, neutral-300 border, orange focus ring). The actual `<input>` is
 * passed in as children so the parent owns value/onChange wiring.
 */
export default function FormField({
  id,
  label,
  helper,
  hint,
  icon: Icon,
  suffix,
  children,
}: FormFieldProps) {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-1.5">
        <label
          htmlFor={id}
          className="block text-sm font-medium text-graphite-700"
        >
          {label}
        </label>
        {hint && (
          <span className="text-xs text-graphite-400">{hint}</span>
        )}
      </div>

      <div
        className={`group flex items-center w-full h-12 rounded-md border border-neutral-300 bg-white
          hover:border-graphite-400
          focus-within:border-orange-500 focus-within:ring-3 focus-within:ring-orange-500/20
          transition-colors duration-fast`}
      >
        {Icon && (
          <span
            className="pl-3.5 pr-2 text-graphite-400 flex-shrink-0"
            aria-hidden="true"
          >
            <Icon size={18} />
          </span>
        )}
        {children}
        {suffix && (
          <span
            className="pr-3.5 pl-2 text-sm font-medium text-graphite-500 flex-shrink-0"
            aria-hidden="true"
          >
            {suffix}
          </span>
        )}
      </div>

      {helper && (
        <p className="mt-1.5 text-xs text-graphite-500">{helper}</p>
      )}
    </div>
  );
}
