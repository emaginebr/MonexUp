import type { ReactNode } from "react";
import {
  ArrowDown,
  ArrowUp,
  Ban,
  Check,
  ShieldCheck,
  X,
} from "lucide-react";

import UserNetworkSearchInfo from "../../DTO/Domain/UserNetworkSearchInfo";
import { UserNetworkStatusEnum } from "../../DTO/Enum/UserNetworkStatusEnum";

export interface UserSearchRowLabels {
  /** Column header / dl label for "Role" */
  roleLabel: string;
  /** Column header / dl label for "Status" */
  statusLabel: string;
  /** Translated role text for this user. */
  roleText: string;
  /** Translated status text for this user. */
  statusText: string;
  /** Action button labels (used as aria-label + title). */
  promote: string;
  demote: string;
  remove: string;
  reactivate: string;
  block: string;
  approve: string;
  reprove: string;
}

export interface UserSearchRowHandlers {
  onPromote: (user: UserNetworkSearchInfo) => void;
  onDemote: (user: UserNetworkSearchInfo) => void;
  onRemove: (user: UserNetworkSearchInfo) => void;
  onReactivate: (user: UserNetworkSearchInfo) => void;
  onBlock: (user: UserNetworkSearchInfo) => void;
  onApprove: (user: UserNetworkSearchInfo) => void;
  onReprove: (user: UserNetworkSearchInfo) => void;
}

export interface UserSearchRowProps {
  user: UserNetworkSearchInfo;
  labels: UserSearchRowLabels;
  handlers: UserSearchRowHandlers;
}

/**
 * UserSearchRow — single row of `/admin/teams` rendered in two layouts:
 *
 *   • md+   : a 12-column grid row (User+avatar 5 / Role chip 3 / Status pill 2
 *             / Actions cluster 2). Hover paints a subtle orange tint.
 *   • <md   : a stacked card with avatar + name on top, role chip + status pill
 *             below, action cluster on the right. Email is the secondary line
 *             so a `<dl>` block is omitted.
 *
 * Pure presentational. The parent owns the search/page-refresh side effects
 * after each action and just feeds the relevant onClick handlers via
 * `handlers`. No legacy behavior changed.
 */

function getInitials(name: string | undefined): string {
  if (!name) return "—";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "—";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function statusPillClasses(status: UserNetworkStatusEnum): string {
  // Three semantic tints: active = emerald, blocked = rose, otherwise neutral.
  if (status === UserNetworkStatusEnum.Active) {
    return "bg-emerald-500/10 text-emerald-700 ring-emerald-500/20";
  }
  if (status === UserNetworkStatusEnum.Blocked) {
    return "bg-rose-500/10 text-rose-700 ring-rose-500/20";
  }
  return "bg-graphite-100 text-graphite-700 ring-graphite-200";
}

interface ActionButtonProps {
  ariaLabel: string;
  onClick: () => void;
  tone?: "neutral" | "success" | "danger" | "primary";
  children: ReactNode;
}

function ActionButton({
  ariaLabel,
  onClick,
  tone = "neutral",
  children,
}: ActionButtonProps) {
  const toneClass =
    tone === "success"
      ? "text-graphite-500 hover:text-emerald-700 hover:bg-emerald-500/10"
      : tone === "danger"
      ? "text-graphite-500 hover:text-rose-700 hover:bg-rose-500/10"
      : tone === "primary"
      ? "text-graphite-500 hover:text-orange-700 hover:bg-orange-500/10"
      : "text-graphite-500 hover:text-graphite-900 hover:bg-mnx-neutral-100";

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        onClick();
      }}
      aria-label={ariaLabel}
      title={ariaLabel}
      className={`inline-flex w-9 h-9 items-center justify-center rounded-md transition-colors duration-fast focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 ${toneClass}`}
    >
      {children}
    </button>
  );
}

function ActionCluster({
  user,
  labels,
  handlers,
}: {
  user: UserNetworkSearchInfo;
  labels: UserSearchRowLabels;
  handlers: UserSearchRowHandlers;
}) {
  return (
    <>
      <ActionButton
        ariaLabel={labels.promote}
        onClick={() => handlers.onPromote(user)}
        tone="success"
      >
        <ArrowUp size={16} aria-hidden="true" />
      </ActionButton>
      <ActionButton
        ariaLabel={labels.demote}
        onClick={() => handlers.onDemote(user)}
        tone="primary"
      >
        <ArrowDown size={16} aria-hidden="true" />
      </ActionButton>

      {user.status === UserNetworkStatusEnum.Active && (
        <ActionButton
          ariaLabel={labels.remove}
          onClick={() => handlers.onRemove(user)}
          tone="danger"
        >
          <Ban size={16} aria-hidden="true" />
        </ActionButton>
      )}

      {user.status === UserNetworkStatusEnum.Inactive && (
        <>
          <ActionButton
            ariaLabel={labels.reactivate}
            onClick={() => handlers.onReactivate(user)}
            tone="success"
          >
            <Check size={16} aria-hidden="true" />
          </ActionButton>
          <ActionButton
            ariaLabel={labels.block}
            onClick={() => handlers.onBlock(user)}
            tone="danger"
          >
            <Ban size={16} aria-hidden="true" />
          </ActionButton>
        </>
      )}

      {user.status === UserNetworkStatusEnum.WaitForApproval && (
        <>
          <ActionButton
            ariaLabel={labels.approve}
            onClick={() => handlers.onApprove(user)}
            tone="success"
          >
            <Check size={16} aria-hidden="true" />
          </ActionButton>
          <ActionButton
            ariaLabel={labels.reprove}
            onClick={() => handlers.onReprove(user)}
            tone="danger"
          >
            <X size={16} aria-hidden="true" />
          </ActionButton>
        </>
      )}

      {user.status === UserNetworkStatusEnum.Blocked && (
        <ActionButton
          ariaLabel={labels.reactivate}
          onClick={() => handlers.onReactivate(user)}
          tone="success"
        >
          <Check size={16} aria-hidden="true" />
        </ActionButton>
      )}
    </>
  );
}

export default function UserSearchRow({
  user,
  labels,
  handlers,
}: UserSearchRowProps) {
  const initials = getInitials(user.name);
  const statusClass = statusPillClasses(user.status);

  return (
    <>
      {/* Desktop / tablet — grid row ------------------------------------ */}
      <div
        className="hidden md:!grid grid-cols-12 items-center gap-4 px-4 h-14 border-b border-mnx-neutral-100 last:border-b-0 hover:bg-orange-500/5 transition-colors duration-fast"
        role="row"
      >
        {/* User cell */}
        <div className="col-span-5 min-w-0 flex items-center gap-3" role="cell">
          <span
            aria-hidden="true"
            className="inline-flex w-8 h-8 items-center justify-center rounded-full bg-orange-500/10 text-orange-700 ring-1 ring-orange-500/20 text-[0.7rem] font-bold tabular-nums shrink-0"
          >
            {initials}
          </span>
          <div className="min-w-0">
            <div className="text-sm font-semibold text-graphite-900 truncate">
              {user.name || "—"}
            </div>
            {user.email && (
              <div className="text-xs text-graphite-500 truncate">
                {user.email}
              </div>
            )}
          </div>
        </div>

        {/* Role chip */}
        <div className="col-span-3 flex items-center justify-end" role="cell">
          <span className="inline-flex items-center gap-1 h-[26px] px-2 rounded-full bg-orange-500/10 text-orange-700 ring-1 ring-orange-500/20 text-xs font-semibold">
            <ShieldCheck size={12} aria-hidden="true" />
            {labels.roleText}
          </span>
        </div>

        {/* Status pill */}
        <div className="col-span-2 flex items-center justify-end" role="cell">
          <span
            className={`inline-flex items-center h-[26px] px-2 rounded-full text-xs font-semibold ring-1 ${statusClass}`}
          >
            {labels.statusText}
          </span>
        </div>

        {/* Actions */}
        <div
          className="col-span-2 flex items-center justify-end gap-1"
          role="cell"
        >
          <ActionCluster user={user} labels={labels} handlers={handlers} />
        </div>
      </div>

      {/* Mobile — stacked card ----------------------------------------- */}
      <div className="md:hidden border-b border-mnx-neutral-100 last:border-b-0 px-4 py-4 hover:bg-orange-500/5 transition-colors duration-fast">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0 flex-1">
            <span
              aria-hidden="true"
              className="inline-flex w-9 h-9 items-center justify-center rounded-full bg-orange-500/10 text-orange-700 ring-1 ring-orange-500/20 text-xs font-bold tabular-nums shrink-0"
            >
              {initials}
            </span>
            <div className="min-w-0">
              <div className="text-sm font-semibold text-graphite-900 truncate">
                {user.name || "—"}
              </div>
              {user.email && (
                <div className="text-xs text-graphite-500 truncate">
                  {user.email}
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <ActionCluster user={user} labels={labels} handlers={handlers} />
          </div>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1 h-[24px] px-2 rounded-full bg-orange-500/10 text-orange-700 ring-1 ring-orange-500/20 text-[11px] font-semibold">
            <ShieldCheck size={11} aria-hidden="true" />
            {labels.roleText}
          </span>
          <span
            className={`inline-flex items-center h-[24px] px-2 rounded-full text-[11px] font-semibold ring-1 ${statusClass}`}
          >
            {labels.statusText}
          </span>
        </div>
      </div>
    </>
  );
}
