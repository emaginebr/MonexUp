import OrderInfo from "../Domain/OrderInfo";
import UserProfileInfo from "../Domain/UserProfileInfo";
import OrderProviderResult from "./OrderProviderResult";
import ProviderResult from "./ProviderResult";


interface IOrderProvider {
    loading: boolean;
    loadingUpdate: boolean;

    order: OrderInfo;
    clientSecret: string;
    
    createSubscription: (productSlug: string) => Promise<OrderProviderResult>;
}

export default IOrderProvider;