export type StatementStatus = "released" | "maturing" | "reversed";

export interface StatusChipLabels {
  released: string;
  maturing: string;
  reversed: string;
}

interface StatusChipProps {
  status: StatementStatus;
  labels: StatusChipLabels;
}

/**
 * StatusChip — shared status pill used by both the desktop table row and the
 * mobile stacked card. The visible text label is the primary carrier of the
 * status (never color/dot alone), per the design spec's a11y notes.
 *
 * Tints reuse the exact `/10 · 700 · /20` recipe already used by
 * `UserSearchRow.statusPillClasses` (emerald/rose) plus Tailwind's default
 * `amber` scale for the maturing state.
 */
const TINTS: Record<StatementStatus, { chip: string; dot: string }> = {
  released: {
    chip: "bg-emerald-500/10 text-emerald-700 ring-emerald-500/20",
    dot: "bg-emerald-500",
  },
  maturing: {
    chip: "bg-amber-500/10 text-amber-700 ring-amber-500/20",
    dot: "bg-amber-500",
  },
  reversed: {
    chip: "bg-rose-500/10 text-rose-700 ring-rose-500/20",
    dot: "bg-rose-500",
  },
};

export default function StatusChip({ status, labels }: StatusChipProps) {
  const tint = TINTS[status];
  const label = labels[status];

  return (
    <span
      className={`inline-flex items-center gap-1 h-[26px] px-2 rounded-full text-xs font-semibold ring-1 ${tint.chip}`}
    >
      <span
        aria-hidden="true"
        className={`w-1.5 h-1.5 rounded-full ${tint.dot}`}
      />
      {label}
    </span>
  );
}
