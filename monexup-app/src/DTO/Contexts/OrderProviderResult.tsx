import OrderInfo from "../Domain/OrderInfo";
import ProviderResult from "./ProviderResult";

export default interface OrderProviderResult extends ProviderResult {
    order?: OrderInfo;
};
