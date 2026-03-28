import UserProfileInfo from "../../DTO/Domain/UserProfileInfo";
import ApiResponse from "../../DTO/Services/ApiResponse";
import IHttpClient from "../../Infra/Interface/IHttpClient";

export default interface IProfileService {
    init: (httpClient: IHttpClient) => void;
    insert: (profile: UserProfileInfo, token: string) => Promise<ApiResponse<UserProfileInfo>>;
    update: (profile: UserProfileInfo, token: string) => Promise<ApiResponse<UserProfileInfo>>;
    delete: (profileId: number, token: string) => Promise<ApiResponse<void>>;
    listByNetwork: (networkId: number, token: string) => Promise<ApiResponse<UserProfileInfo[]>>;
    getById: (profileId: number, token: string) => Promise<ApiResponse<UserProfileInfo>>;
}
