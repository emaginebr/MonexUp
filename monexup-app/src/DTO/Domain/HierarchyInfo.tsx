import { UserNetworkStatusEnum } from "../Enum/UserNetworkStatusEnum";
import { UserRoleEnum } from "../Enum/UserRoleEnum";

/**
 * A single member node in the hierarchy graph returned by
 * `GET /Network/hierarchy/{networkId}`. `name` / `profileName` may be null.
 * `children` is the nested descendant subtree (down to depth 3); it is `[]`
 * for ancestors and for leaf descendants.
 */
export interface HierarchyNodeInfo {
    userId: number;
    name: string | null;
    profileName: string | null;
    role: UserRoleEnum;
    status: UserNetworkStatusEnum;
    children: HierarchyNodeInfo[];
}

/**
 * Member graph rooted at the logged-in user for a given network.
 * `ancestors` is the referrer chain (immediate referrer first, ≤3).
 * `descendants` are the current user's direct children with nested
 * `children` down to depth 3.
 */
export default interface HierarchyInfo {
    networkId: number;
    current: HierarchyNodeInfo;
    ancestors: HierarchyNodeInfo[];
    descendants: HierarchyNodeInfo[];
}
