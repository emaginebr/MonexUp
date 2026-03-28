import UserProfileInfo from "../../DTO/Domain/UserProfileInfo";
import IHttpClient from "../../Infra/Interface/IHttpClient";
import IProfileService from "../Interfaces/IProfileService";

let _httpClient: IHttpClient;

const ProfileService: IProfileService = {
    init: function (htppClient: IHttpClient): void {
        _httpClient = htppClient;
    },
    insert: async (profile: UserProfileInfo, token: string) => {
        return await _httpClient.doPostAuth<UserProfileInfo>("/Profile/insert", profile, token);
    },
    update: async (profile: UserProfileInfo, token: string) => {
        return await _httpClient.doPostAuth<UserProfileInfo>("/Profile/update", profile, token);
    },
    delete: async (profileId: number, token: string) => {
        return await _httpClient.doGetAuth<void>("/Profile/delete/" + profileId, token);
    },
    listByNetwork: async (networkId: number, token: string) => {
        return await _httpClient.doGetAuth<UserProfileInfo[]>("/Profile/listByNetwork/" + networkId, token);
    },
    getById: async (profileId: number, token: string) => {
        return await _httpClient.doGetAuth<UserProfileInfo>("/Profile/getById/" + profileId, token);
    }
}

export default ProfileService;
