import { InviteDetailInfo } from "../Domain/InviteInfo";
import ProviderResult from "./ProviderResult";

export default interface InviteDetailProviderResult extends ProviderResult {
    detail?: InviteDetailInfo;
};
