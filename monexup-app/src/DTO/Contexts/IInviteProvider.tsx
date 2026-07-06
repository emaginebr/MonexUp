import { InviteUrlParam } from "../../Business/Interfaces/IInviteBusiness";
import InviteDetailProviderResult from "./InviteDetailProviderResult";
import InviteProviderResult from "./InviteProviderResult";
import ProviderResult from "./ProviderResult";

interface IInviteProvider {
    loading: boolean;
    loadingDetail: boolean;
    loadingAction: boolean;

    invite: (networkId: number, email: string) => Promise<InviteProviderResult>;
    join: (token: string) => Promise<ProviderResult>;
    getDetail: (token: string) => Promise<InviteDetailProviderResult>;
    accept: (token: string) => Promise<ProviderResult>;
    decline: (token: string) => Promise<ProviderResult>;
    buildInviteUrl: (param: InviteUrlParam) => string;
}

export default IInviteProvider;
