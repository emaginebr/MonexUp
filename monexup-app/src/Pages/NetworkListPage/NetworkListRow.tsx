import { Link } from "react-router-dom";
import { Eye, Pencil, Users } from "lucide-react";
import UserNetworkInfo from "../../DTO/Domain/UserNetworkInfo";

export interface NetworkListRowLabels {
  network: string;
  members: string;
  commission: string;
  open: string;
  manage: string;
}

export interface NetworkListRowProps {
  userNetwork: UserNetworkInfo;
  /** Whether the action cluster shows the "manage" (Pencil) link. */
  canManage: boolean;
  labels: NetworkListRowLabels;
  /** Click handler on the network name — preserves legacy behavior of
   *  setting the active network and navigating to /admin/dashboard. */
  onSelect: (un: UserNetworkInfo) => void;
}

/**
 * Initials fallback used when no `imageUrl` is available — the
 * graphite-100 ring keeps the cell aligned with the ProfileListPage
 * row even when the avatar slot is empty.
 */
function avatarInitials(name?: string | null): string {
  if (!name) return "·";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "·";
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase() || "·";
}

/**
 * NetworkListRow — single row in the `/network/search` table.
 *
 *   • md+   : 12-column grid row (network 6 / members 2 / commission 2 /
 *             actions 2). Members + commission cells use `mnx-num
 *             tabular-nums` and align right. Hover paints orange/5 like
 *             the ProfileListPage benchmark.
 *   • <md   : a stacked card mirroring the desktop data — avatar + name
 *             header, subtitle with the public slug, and a tight 2-col
 *             dl strip with Members + Commission. Action cluster is
 *             rendered to the right of the title.
 *
 * Pure presentational. The parent owns `onSelect` (set active network +
 * navigate to dashboard, the legacy click target) and the `canManage`
 * gate that decides whether the Pencil link is rendered.
 */
export default function NetworkListRow({
  userNetwork,
  canManage,
  labels,
  onSelect,
}: NetworkListRowProps) {
  const network = userNetwork.network;
  const slug = network?.slug ?? "";
  const name = network?.name ?? "—";
  const initials = avatarInitials(name);
  const publicHref = slug ? `/${slug}` : "#";
  const manageHref = "/admin/network";

  const handleNameClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onSelect(userNetwork);
  };

  const Avatar = (
    <span
      aria-hidden="true"
      className="relative inline-flex w-8 h-8 shrink-0 items-center justify-center rounded-full bg-mnx-neutral-100 ring-1 ring-graphite-100 overflow-hidden"
    >
      {network?.imageUrl ? (
        <img
          src={network.imageUrl}
          alt=""
          className="w-full h-full object-cover"
          loading="lazy"
        />
      ) : (
        <span className="text-[0.65rem] font-semibold text-graphite-500 mnx-num">
          {initials}
        </span>
      )}
    </span>
  );

  const Actions = (
    <>
      <Link
        to={publicHref}
        aria-label={labels.open}
        title={labels.open}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex w-9 h-9 items-center justify-center rounded-md text-graphite-500 hover:text-graphite-900 hover:bg-mnx-neutral-100 transition-colors duration-fast focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
      >
        <Eye size={16} aria-hidden="true" />
      </Link>
      {canManage && (
        <Link
          to={manageHref}
          aria-label={labels.manage}
          title={labels.manage}
          className="inline-flex w-9 h-9 items-center justify-center rounded-md text-graphite-500 hover:text-orange-700 hover:bg-orange-500/10 transition-colors duration-fast focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
        >
          <Pencil size={16} aria-hidden="true" />
        </Link>
      )}
    </>
  );

  return (
    <>
      {/* Desktop / tablet — grid row ------------------------------------ */}
      <div
        className="hidden md:!grid grid-cols-12 items-center gap-4 px-4 h-14 border-b border-mnx-neutral-100 last:border-b-0 hover:bg-orange-500/5 transition-colors duration-fast"
        role="row"
      >
        <div className="col-span-6 min-w-0 flex items-center gap-3" role="cell">
          {Avatar}
          <div className="min-w-0">
            <a
              href="#"
              onClick={handleNameClick}
              className="block text-sm font-semibold text-graphite-900 hover:text-orange-700 transition-colors duration-fast truncate"
            >
              {name}
            </a>
            <div className="text-xs text-graphite-500 truncate">
              monexup.com/
              <span className="text-orange-700 font-medium">{slug}</span>
            </div>
          </div>
        </div>
        <div
          className="col-span-2 flex items-center justify-end gap-1.5 text-sm text-graphite-700 mnx-num tabular-nums"
          role="cell"
        >
          <Users
            size={12}
            className="text-graphite-400"
            aria-hidden="true"
          />
          <span>
            {network?.qtdyUsers ?? 0}
            {typeof network?.maxUsers === "number" && network.maxUsers > 0 && (
              <span className="text-graphite-400 font-normal">
                /{network.maxUsers}
              </span>
            )}
          </span>
        </div>
        <div
          className="col-span-2 text-right text-sm text-graphite-900 font-semibold mnx-num tabular-nums"
          role="cell"
        >
          {network?.comission ?? 0}
          <span className="text-graphite-400 font-normal">%</span>
        </div>
        <div
          className="col-span-2 flex items-center justify-end gap-1"
          role="cell"
        >
          {Actions}
        </div>
      </div>

      {/* Mobile — stacked card ----------------------------------------- */}
      <div className="md:hidden border-b border-mnx-neutral-100 last:border-b-0 px-4 py-4 hover:bg-orange-500/5 transition-colors duration-fast">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0 flex-1">
            {Avatar}
            <div className="min-w-0 flex-1">
              <a
                href="#"
                onClick={handleNameClick}
                className="block text-base font-semibold text-graphite-900 hover:text-orange-700 transition-colors duration-fast truncate"
              >
                {name}
              </a>
              <div className="text-xs text-graphite-500 truncate">
                monexup.com/
                <span className="text-orange-700 font-medium">{slug}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">{Actions}</div>
        </div>
        <dl className="mt-3 grid grid-cols-2 gap-3">
          <div>
            <dt className="text-[0.65rem] uppercase tracking-wider font-semibold text-graphite-400">
              {labels.members}
            </dt>
            <dd className="mt-0.5 text-sm text-graphite-900 mnx-num tabular-nums flex items-center gap-1.5">
              <Users
                size={12}
                className="text-graphite-400"
                aria-hidden="true"
              />
              <span>
                {network?.qtdyUsers ?? 0}
                {typeof network?.maxUsers === "number" &&
                  network.maxUsers > 0 && (
                    <span className="text-graphite-400 font-normal">
                      /{network.maxUsers}
                    </span>
                  )}
              </span>
            </dd>
          </div>
          <div>
            <dt className="text-[0.65rem] uppercase tracking-wider font-semibold text-graphite-400">
              {labels.commission}
            </dt>
            <dd className="mt-0.5 text-sm text-graphite-900 font-semibold mnx-num tabular-nums">
              {network?.comission ?? 0}
              <span className="text-graphite-400 font-normal">%</span>
            </dd>
          </div>
        </dl>
      </div>
    </>
  );
}
