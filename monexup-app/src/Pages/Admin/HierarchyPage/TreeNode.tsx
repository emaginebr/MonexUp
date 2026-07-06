import { useRef, type KeyboardEvent, type ReactNode } from "react";
import { ChevronDown, ShieldCheck } from "lucide-react";

import HierarchyInfo, {
  HierarchyNodeInfo,
} from "../../../DTO/Domain/HierarchyInfo";
import { UserNetworkStatusEnum } from "../../../DTO/Enum/UserNetworkStatusEnum";
import { UserRoleEnum } from "../../../DTO/Enum/UserRoleEnum";
import {
  getInitials,
  statusPillClasses,
} from "../../UserSearchPage/UserSearchRow";

/**
 * Below this many direct children a node is expanded by default; above it the
 * node starts collapsed with a `+N` control. Shared with the page so the
 * initial `expanded` seed and the render stay in agreement.
 */
export const COLLAPSE_THRESHOLD = 3;

/** Max descendant depth rendered relative to the current user (1-based). */
export const MAX_DEPTH = 3;

/**
 * Pre-translated strings + resolvers passed down through the recursion so
 * TreeNode stays presentational (no `useTranslation` inside the tree).
 */
export interface HierarchyLabels {
  you: string;
  profileMissing: string;
  childrenLabel: string;
  collapse: string;
  roleText: (role: UserRoleEnum) => string;
  statusText: (status: UserNetworkStatusEnum) => string;
  /** aria-label for the expand control, given the hidden child count. */
  expandChildren: (count: number) => string;
  /** appended to a collapsed node's aria-label ("N convidados recolhidos"). */
  collapsedSummary: (count: number) => string;
}

type NodeVariant = "ancestor" | "current" | "descendant";

function nodeAriaLabel(
  node: HierarchyNodeInfo,
  labels: HierarchyLabels,
  variant: NodeVariant,
  collapsedCount: number
): string {
  const name = node.name || "—";
  const parts = [name, labels.roleText(node.role), labels.statusText(node.status)];
  const base =
    variant === "current" ? `${labels.you}: ${parts.join(", ")}` : parts.join(", ");
  return collapsedCount > 0
    ? `${base}. ${labels.collapsedSummary(collapsedCount)}`
    : base;
}

/* ------------------------------------------------------------------------- */
/* NodeCard — one presentational member card. Used for ancestors, current,   */
/* and (inside TreeNode) every descendant.                                   */
/* ------------------------------------------------------------------------- */

interface NodeCardProps {
  node: HierarchyNodeInfo;
  variant: NodeVariant;
  labels: HierarchyLabels;
  /** rendered inside the card (the collapse control), when provided. */
  collapseControl?: ReactNode;
}

export function NodeCard({
  node,
  variant,
  labels,
  collapseControl,
}: NodeCardProps) {
  const initials = getInitials(node.name);
  const statusClass = statusPillClasses(node.status);
  const isCurrent = variant === "current";
  const isAncestor = variant === "ancestor";

  const cardClass = [
    "relative text-left rounded-xl p-3 w-[210px] sm:w-[236px]",
    "transition-[box-shadow,border-color] duration-fast ease-out",
    isCurrent
      ? "border border-transparent ring-2 ring-orange-500 shadow-glow-md bg-gradient-to-b from-[#FFFBF8] to-white hover:shadow-glow-md"
      : [
          "border border-mnx-neutral-200 shadow-md",
          isAncestor ? "bg-mnx-neutral-50" : "bg-white",
          "hover:border-orange-200 hover:shadow-lg",
          "focus-within:ring-3 focus-within:ring-orange-500/20",
        ].join(" "),
  ].join(" ");

  const avatarClass = isCurrent
    ? "bg-orange-500 text-white"
    : "bg-orange-500/10 text-orange-700 ring-1 ring-orange-500/20";

  return (
    <article className={cardClass} aria-current={isCurrent ? "true" : undefined}>
      {isCurrent && (
        <span className="absolute -top-2.5 left-3 inline-flex items-center h-5 px-2 rounded-full bg-orange-500 text-white text-[10px] font-bold uppercase tracking-wide shadow-glow-md">
          {labels.you}
        </span>
      )}

      <div className="flex items-center gap-2.5 min-w-0">
        <span
          aria-hidden="true"
          className={`inline-flex w-[34px] h-[34px] items-center justify-center rounded-full text-[0.72rem] font-bold tabular-nums shrink-0 ${avatarClass}`}
        >
          {initials}
        </span>
        <div className="min-w-0">
          <div className="text-sm font-semibold text-graphite-900 truncate">
            {node.name || "—"}
          </div>
          <div className="text-xs text-graphite-500 truncate">
            {node.profileName || "—"}
          </div>
        </div>
      </div>

      <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
        <span className="inline-flex items-center gap-1 h-[24px] px-2 rounded-full bg-orange-500/10 text-orange-700 ring-1 ring-orange-500/20 text-[11px] font-semibold">
          <ShieldCheck size={11} aria-hidden="true" />
          {labels.roleText(node.role)}
        </span>
        <span
          className={`inline-flex items-center h-[24px] px-2 rounded-full text-[11px] font-semibold ring-1 ${statusClass}`}
        >
          {labels.statusText(node.status)}
        </span>
      </div>

      {collapseControl}
    </article>
  );
}

/* ------------------------------------------------------------------------- */
/* Collapse / expand control                                                 */
/* ------------------------------------------------------------------------- */

interface CollapseControlProps {
  count: number;
  expanded: boolean;
  ariaLabel: string;
  childrenLabel: string;
  collapseLabel: string;
  onToggle: () => void;
}

function CollapseControl({
  count,
  expanded,
  ariaLabel,
  childrenLabel,
  collapseLabel,
  onToggle,
}: CollapseControlProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={expanded}
      aria-label={ariaLabel}
      className="inline-flex items-center gap-1.5 h-[26px] pl-1.5 pr-2 mt-2.5 rounded-full border border-mnx-neutral-200 bg-white text-graphite-700 text-[11px] font-semibold hover:bg-orange-50 hover:border-orange-200 hover:text-orange-700 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-orange-500/35 transition-colors duration-fast"
    >
      <ChevronDown
        size={13}
        aria-hidden="true"
        className={`text-orange-600 transition-transform duration-fast ${
          expanded ? "rotate-180" : ""
        }`}
      />
      {expanded ? collapseLabel : childrenLabel}
      {!expanded && (
        <span className="inline-flex items-center justify-center min-w-[18px] h-4 px-1 rounded-full bg-orange-500 text-white text-[10px] font-bold">
          +{count}
        </span>
      )}
    </button>
  );
}

/* ------------------------------------------------------------------------- */
/* TreeNode — recursive descendant branch (<li role="treeitem">)             */
/* ------------------------------------------------------------------------- */

interface TreeNodeProps {
  node: HierarchyNodeInfo;
  depth: number; // 1-based, relative to the current user
  expanded: Set<number>;
  focusedId: number | null;
  onToggle: (userId: number) => void;
  labels: HierarchyLabels;
  maxDepth?: number;
}

export default function TreeNode({
  node,
  depth,
  expanded,
  focusedId,
  onToggle,
  labels,
  maxDepth = MAX_DEPTH,
}: TreeNodeProps) {
  const children = node.children ?? [];
  const childCount = children.length;
  const hasChildren = childCount > 0;
  const isExpanded = expanded.has(node.userId);
  const renderChildren = hasChildren && isExpanded && depth < maxDepth;
  const collapsedCount = hasChildren && !isExpanded ? childCount : 0;

  return (
    <li
      role="treeitem"
      data-user-id={node.userId}
      aria-level={depth}
      aria-expanded={hasChildren ? isExpanded : undefined}
      aria-label={nodeAriaLabel(node, labels, "descendant", collapsedCount)}
      tabIndex={focusedId === node.userId ? 0 : -1}
      className="rounded-xl focus:outline-none focus-visible:ring-3 focus-visible:ring-orange-500/35"
    >
      <NodeCard
        node={node}
        variant="descendant"
        labels={labels}
        collapseControl={
          hasChildren ? (
            <CollapseControl
              count={childCount}
              expanded={isExpanded}
              childrenLabel={labels.childrenLabel}
              collapseLabel={labels.collapse}
              ariaLabel={labels.expandChildren(childCount)}
              onToggle={() => onToggle(node.userId)}
            />
          ) : undefined
        }
      />

      {renderChildren && (
        <ul role="group">
          {children.map((child) => (
            <TreeNode
              key={child.userId}
              node={child}
              depth={depth + 1}
              expanded={expanded}
              focusedId={focusedId}
              onToggle={onToggle}
              labels={labels}
              maxDepth={maxDepth}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

/* ------------------------------------------------------------------------- */
/* DescendantTree — role="tree" root + roving-tabindex keyboard handler       */
/* ------------------------------------------------------------------------- */

interface DescendantTreeProps {
  roots: HierarchyNodeInfo[];
  expanded: Set<number>;
  onToggle: (userId: number) => void;
  labels: HierarchyLabels;
  ariaLabel: string;
  focusedId: number | null;
  setFocusedId: (id: number) => void;
  maxDepth?: number;
}

export function DescendantTree({
  roots,
  expanded,
  onToggle,
  labels,
  ariaLabel,
  focusedId,
  setFocusedId,
  maxDepth = MAX_DEPTH,
}: DescendantTreeProps) {
  const treeRef = useRef<HTMLUListElement | null>(null);

  const visibleItems = (): HTMLElement[] =>
    treeRef.current
      ? Array.from(
          treeRef.current.querySelectorAll<HTMLElement>('[role="treeitem"]')
        )
      : [];

  const idOf = (el: HTMLElement | null | undefined): number | null => {
    const raw = el?.getAttribute("data-user-id");
    return raw ? Number(raw) : null;
  };

  const focusItem = (el: HTMLElement | undefined | null) => {
    if (!el) return;
    const id = idOf(el);
    if (id != null) setFocusedId(id);
    el.focus();
  };

  const onKeyDown = (e: KeyboardEvent<HTMLUListElement>) => {
    const target = (e.target as HTMLElement).closest<HTMLElement>(
      '[role="treeitem"]'
    );
    if (!target) return;

    const items = visibleItems();
    const index = items.indexOf(target);
    const id = idOf(target);
    const expandedNow = target.getAttribute("aria-expanded");
    const hasChildren = expandedNow !== null;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        focusItem(items[index + 1] ?? items[index]);
        break;
      case "ArrowUp":
        e.preventDefault();
        focusItem(items[index - 1] ?? items[index]);
        break;
      case "Home":
        e.preventDefault();
        focusItem(items[0]);
        break;
      case "End":
        e.preventDefault();
        focusItem(items[items.length - 1]);
        break;
      case "ArrowRight":
        e.preventDefault();
        if (hasChildren && expandedNow === "false" && id != null) {
          onToggle(id);
        } else if (hasChildren && expandedNow === "true") {
          const firstChild = target.querySelector<HTMLElement>(
            'ul[role="group"] > [role="treeitem"]'
          );
          focusItem(firstChild);
        }
        break;
      case "ArrowLeft":
        e.preventDefault();
        if (hasChildren && expandedNow === "true" && id != null) {
          onToggle(id);
        } else {
          const parent = target.parentElement?.closest<HTMLElement>(
            '[role="treeitem"]'
          );
          focusItem(parent);
        }
        break;
      case "Enter":
      case " ":
        if (hasChildren && id != null) {
          e.preventDefault();
          onToggle(id);
        }
        break;
      default:
        break;
    }
  };

  return (
    <div className="mnx-hier-tree">
      <ul
        ref={treeRef}
        role="tree"
        aria-label={ariaLabel}
        onKeyDown={onKeyDown}
      >
        {roots.map((node) => (
          <TreeNode
            key={node.userId}
            node={node}
            depth={1}
            expanded={expanded}
            focusedId={focusedId}
            onToggle={onToggle}
            labels={labels}
            maxDepth={maxDepth}
          />
        ))}
      </ul>
    </div>
  );
}

/** Seed the initial expanded set: expand every node with children whose direct
 * child count is within COLLAPSE_THRESHOLD, collapse the wider ones. */
export function seedExpanded(view: HierarchyInfo | null | undefined): Set<number> {
  const set = new Set<number>();
  const walk = (nodes: HierarchyNodeInfo[] | undefined, depth: number) => {
    if (!nodes || depth > MAX_DEPTH) return;
    for (const n of nodes) {
      const count = n.children?.length ?? 0;
      if (count > 0 && count <= COLLAPSE_THRESHOLD) {
        set.add(n.userId);
      }
      walk(n.children, depth + 1);
    }
  };
  walk(view?.descendants, 1);
  return set;
}
