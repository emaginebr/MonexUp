import SubscriptionResult from "../../DTO/Services/SubscriptionResult";
import IHttpClient from "../../Infra/Interface/IHttpClient";

export default interface IOrderService {
    init: (httpClient : IHttpClient) => void;
    createSubscription: (productSlug: string, token: string) => Promise<SubscriptionResult>;
}