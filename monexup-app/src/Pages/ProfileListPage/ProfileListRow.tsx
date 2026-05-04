import { Link } from "react-router-dom";
import { Pencil, Trash2 } from "lucide-react";
import UserProfileInfo from "../../DTO/Domain/UserProfileInfo";

export interface ProfileListRowProps {
  profile: UserProfileInfo;
  labels: {
    name: string;
    level: string;
    commission: string;
    members: string;
    edit: string;
    delete: string;
  };
  onDelete: (profile: UserProfileInfo) => void;
}

/**
 * ProfileListRow — single team-structure entry rendered in two layouts:
 *
 *   • md+   : a 12-column grid row inside the card table (name, level,
 *             commission %, members, actions). Numeric cells use `mnx-num`
 *             and are right-aligned. Hover paints a subtle orange tint.
 *   • <md   : a stacked card with the name first as a link, followed by
 *             a chip strip of the same metrics and the inline action set.
 *
 * Pure presentational — receives translated labels and an onDelete
 * handler so the parent owns navigation + delete-confirm logic.
 */
export default function ProfileListRow({
  profile,
  labels,
  onDelete,
}: ProfileListRowProps) {
  const editHref = `/admin/team-structure/${profile.profileId}`;

  return (
    <>
      {/* Desktop / tablet — grid row ------------------------------------ */}
      <div
        className="hidden md:!grid grid-cols-12 items-center gap-4 px-4 h-14 border-b border-mnx-neutral-100 last:border-b-0 hover:bg-orange-500/5 transition-colors duration-fast"
        role="row"
      >
        <div className="col-span-5 min-w-0" role="cell">
          <Link
            to={editHref}
            className="text-sm font-semibold text-graphite-900 hover:text-orange-700 transition-colors duration-fast truncate inline-block max-w-full"
          >
            {profile.name || "—"}
          </Link>
        </div>
        <div
          className="col-span-2 text-right text-sm text-graphite-700 mnx-num tabular-nums"
          role="cell"
        >
          {profile.level ?? 0}
        </div>
        <div
          className="col-span-2 text-right text-sm text-graphite-900 font-semibold mnx-num tabular-nums"
          role="cell"
        >
          {profile.commission ?? 0}
          <span className="text-graphite-400 font-normal">%</span>
        </div>
        <div
          className="col-span-2 text-right text-sm text-graphite-700 mnx-num tabular-nums"
          role="cell"
        >
          {profile.members ?? 0}
        </div>
        <div
          className="col-span-1 flex items-center justify-end gap-1"
          role="cell"
        >
          <Link
            to={editHref}
            aria-label={labels.edit}
            title={labels.edit}
            className="inline-flex w-9 h-9 items-center justify-center rounded-md text-graphite-500 hover:text-graphite-900 hover:bg-mnx-neutral-100 transition-colors duration-fast focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
          >
            <Pencil size={16} aria-hidden="true" />
          </Link>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              onDelete(profile);
            }}
            aria-label={labels.delete}
            title={labels.delete}
            className="inline-flex w-9 h-9 items-center justify-center rounded-md text-graphite-500 hover:text-orange-700 hover:bg-orange-500/10 transition-colors duration-fast focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
          >
            <Trash2 size={16} aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Mobile — stacked card ----------------------------------------- */}
      <div className="md:hidden border-b border-mnx-neutral-100 last:border-b-0 px-4 py-4 hover:bg-orange-500/5 transition-colors duration-fast">
        <div className="flex items-start justify-between gap-3">
          <Link
            to={editHref}
            className="text-base font-semibold text-graphite-900 hover:text-orange-700 transition-colors duration-fast min-w-0 flex-1 truncate"
          >
            {profile.name || "—"}
          </Link>
          <div className="flex items-center gap-1 shrink-0">
            <Link
              to={editHref}
              aria-label={labels.edit}
              className="inline-flex w-9 h-9 items-center justify-center rounded-md text-graphite-500 hover:text-graphite-900 hover:bg-mnx-neutral-100 transition-colors duration-fast focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
            >
              <Pencil size={16} aria-hidden="true" />
            </Link>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                onDelete(profile);
              }}
              aria-label={labels.delete}
              className="inline-flex w-9 h-9 items-center justify-center rounded-md text-graphite-500 hover:text-orange-700 hover:bg-orange-500/10 transition-colors duration-fast focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
            >
              <Trash2 size={16} aria-hidden="true" />
            </button>
          </div>
        </div>
        <dl className="mt-3 grid grid-cols-3 gap-3">
          <div>
            <dt className="text-[0.65rem] uppercase tracking-wider font-semibold text-graphite-400">
              {labels.level}
            </dt>
            <dd className="mt-0.5 text-sm text-graphite-900 mnx-num tabular-nums">
              {profile.level ?? 0}
            </dd>
          </div>
          <div>
            <dt className="text-[0.65rem] uppercase tracking-wider font-semibold text-graphite-400">
              {labels.commission}
            </dt>
            <dd className="mt-0.5 text-sm text-graphite-900 font-semibold mnx-num tabular-nums">
              {profile.commission ?? 0}
              <span className="text-graphite-400 font-normal">%</span>
            </dd>
          </div>
          <div>
            <dt className="text-[0.65rem] uppercase tracking-wider font-semibold text-graphite-400">
              {labels.members}
            </dt>
            <dd className="mt-0.5 text-sm text-graphite-900 mnx-num tabular-nums">
              {profile.members ?? 0}
            </dd>
          </div>
        </dl>
      </div>
    </>
  );
}
