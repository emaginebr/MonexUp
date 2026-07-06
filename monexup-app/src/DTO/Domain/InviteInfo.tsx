// DTOs for the "referrer invite" feature. Mirrors the MonexUp API
// `/Network/invite*` contract 1:1. Account existence is detected
// server-side — the frontend never probes emails directly.

export interface InviteRequestInfo {
    networkId: number;
    email: string;
}

export interface InviteResultInfo {
    sucesso: boolean;
    hasAccount: boolean;
    alreadyMember: boolean;
    token: string;
    networkSlug: string;
    mensagemErro: string | null;
}

export interface InviteDetailInfo {
    sucesso: boolean;
    networkId: number;
    networkName: string;
    inviterName: string;
    targetUserId: number;
    isForCurrentUser: boolean;
    alreadyActiveMember: boolean;
    mensagemErro: string | null;
}

export interface InviteActionInfo {
    token: string;
}
