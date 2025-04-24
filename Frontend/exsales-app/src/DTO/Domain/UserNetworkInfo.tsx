import NetworkInfo from "./NetworkInfo";
import UserProfileInfo from "./UserProfileInfo";

export default interface UserNetworkInfo {
    userId: number;
    networkId: number;
    profileId?: number;
    role: number;
    status: number;
    referrerId?: number;
    network: NetworkInfo;
    profile?: UserProfileInfo;
}