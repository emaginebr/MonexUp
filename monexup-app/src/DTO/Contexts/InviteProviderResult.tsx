import { InviteResultInfo } from "../Domain/InviteInfo";
import ProviderResult from "./ProviderResult";

export default interface InviteProviderResult extends ProviderResult {
    result?: InviteResultInfo;
};
