import BusinessResult from "../../DTO/Business/BusinessResult";
import AuthSession from "../../DTO/Domain/AuthSession";
import { InviteDetailInfo, InviteResultInfo } from "../../DTO/Domain/InviteInfo";
import IInviteService from "../../Services/Interfaces/IInviteService";
import AuthFactory from "../Factory/AuthFactory";
import IInviteBusiness, { InviteUrlParam } from "../Interfaces/IInviteBusiness";

let _inviteService: IInviteService;

const InviteBusiness: IInviteBusiness = {
    init: function (inviteService: IInviteService): void {
        _inviteService = inviteService;
    },
    invite: async (networkId: number, email: string) => {
        let ret: BusinessResult<InviteResultInfo>;
        let session: AuthSession = AuthFactory.AuthBusiness.getSession();
        if (!session) {
            return {
                ...ret,
                sucesso: false,
                mensagem: "Not logged"
            };
        }
        let retServ = await _inviteService.invite(networkId, email, session.token);
        if (retServ.success) {
            return {
                ...ret,
                dataResult: retServ.data,
                sucesso: true
            };
        } else {
            return {
                ...ret,
                sucesso: false,
                mensagem: retServ.messageError
            };
        }
    },
    join: async (token: string) => {
        let ret: BusinessResult<boolean>;
        let session: AuthSession = AuthFactory.AuthBusiness.getSession();
        if (!session) {
            return {
                ...ret,
                sucesso: false,
                mensagem: "Not logged"
            };
        }
        let retServ = await _inviteService.join(token, session.token);
        if (retServ.success) {
            return {
                ...ret,
                dataResult: true,
                sucesso: true
            };
        } else {
            return {
                ...ret,
                sucesso: false,
                mensagem: retServ.messageError
            };
        }
    },
    getDetail: async (token: string) => {
        let ret: BusinessResult<InviteDetailInfo>;
        let session: AuthSession = AuthFactory.AuthBusiness.getSession();
        if (!session) {
            return {
                ...ret,
                sucesso: false,
                mensagem: "Not logged"
            };
        }
        let retServ = await _inviteService.getDetail(token, session.token);
        if (retServ.success) {
            return {
                ...ret,
                dataResult: retServ.data,
                sucesso: true
            };
        } else {
            return {
                ...ret,
                sucesso: false,
                mensagem: retServ.messageError
            };
        }
    },
    accept: async (token: string) => {
        let ret: BusinessResult<boolean>;
        let session: AuthSession = AuthFactory.AuthBusiness.getSession();
        if (!session) {
            return {
                ...ret,
                sucesso: false,
                mensagem: "Not logged"
            };
        }
        let retServ = await _inviteService.accept(token, session.token);
        if (retServ.success) {
            return {
                ...ret,
                dataResult: true,
                sucesso: true
            };
        } else {
            return {
                ...ret,
                sucesso: false,
                mensagem: retServ.messageError
            };
        }
    },
    decline: async (token: string) => {
        let ret: BusinessResult<boolean>;
        let session: AuthSession = AuthFactory.AuthBusiness.getSession();
        if (!session) {
            return {
                ...ret,
                sucesso: false,
                mensagem: "Not logged"
            };
        }
        let retServ = await _inviteService.decline(token, session.token);
        if (retServ.success) {
            return {
                ...ret,
                dataResult: true,
                sucesso: true
            };
        } else {
            return {
                ...ret,
                sucesso: false,
                mensagem: retServ.messageError
            };
        }
    },
    buildInviteUrl: (param: InviteUrlParam): string => {
        const origin = window.location.origin;
        if (param.hasAccount) {
            return origin + "/invite/accept?token=" + encodeURIComponent(param.token);
        }
        return origin + "/" + param.networkSlug + "/new-seller?invite=" + encodeURIComponent(param.token);
    }
}

export default InviteBusiness;
