import { UserNetworkStatusEnum } from "../Enum/UserNetworkStatusEnum";
import { UserRoleEnum } from "../Enum/UserRoleEnum";
import NetworkInfo from "./NetworkInfo";
import UserProfileInfo from "./UserProfileInfo";

export default interface UserNetworkInfo {
    userId: number;
    networkId: number;
    profileId?: number;
    role: UserRoleEnum;
    status: UserNetworkStatusEnum;
    referrerId?: number;
    network: NetworkInfo;
    profile?: UserProfileInfo;
}