import UserNetworkInfo from "../DTO/Domain/UserNetworkInfo";
import { UserRoleEnum } from "../DTO/Enum/UserRoleEnum";

const showFrequencyMin = (frequency: number) => {
    let ret: string;
    switch (frequency) {
        case 0:
            ret = "Unique";
            break;
        case 7:
            ret = "Week";
            break;
        case 30:
            ret = "Month";
            break;
        case 60:
            ret = "Bimonthly";
            break;
        case 90:
            ret = "Quarter";
            break;
        case 180:
            ret = "Half";
            break;
        case 365:
            ret = "Year";
            break;
    }
    return ret;
};

const showFrequencyMax = (frequency: number) => {
    let ret: string;
    switch (frequency) {
        case 0:
            ret = "Unique payment";
            break;
        case 7:
            ret = "Weekly payment";
            break;
        case 30:
            ret = "Monthly Payment";
            break;
        case 60:
            ret = "Bimonthly Payment";
            break;
        case 90:
            ret = "Quarterly Payment";
            break;
        case 180:
            ret = "Semiannual Payment";
            break;
        case 365:
            ret = "Annual Payment";
            break;
    }
    return ret;
};

const showProfile = (user: UserNetworkInfo) => {
    if (!user) {
        return "";
    }
    if (user.profile) {
        return user.profile?.name;
    }
    switch (user.role) {
        case UserRoleEnum.Administrator:
            return "Adminstrator";
            break;
        case UserRoleEnum.NetworkManager:
            return "Network Manager";
            break;
        case UserRoleEnum.Seller:
            return "Seller";
            break;
        case UserRoleEnum.User:
            return "User";
            break;
    }
};

export {showFrequencyMin, showFrequencyMax, showProfile};