import BusinessResult from "../../DTO/Business/BusinessResult";
import { InviteDetailInfo, InviteResultInfo } from "../../DTO/Domain/InviteInfo";
import IInviteService from "../../Services/Interfaces/IInviteService";

export interface InviteUrlParam {
    token: string;
    hasAccount: boolean;
    networkSlug: string;
}

export default interface IInviteBusiness {
    init: (inviteService: IInviteService) => void;
    invite: (networkId: number, email: string) => Promise<BusinessResult<InviteResultInfo>>;
    join: (token: string) => Promise<BusinessResult<boolean>>;
    getDetail: (token: string) => Promise<BusinessResult<InviteDetailInfo>>;
    accept: (token: string) => Promise<BusinessResult<boolean>>;
    decline: (token: string) => Promise<BusinessResult<boolean>>;
    buildInviteUrl: (param: InviteUrlParam) => string;
}
