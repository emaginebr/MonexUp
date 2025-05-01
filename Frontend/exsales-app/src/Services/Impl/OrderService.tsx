import SubscriptionResult from "../../DTO/Services/SubscriptionResult";
import IHttpClient from "../../Infra/Interface/IHttpClient"; 
import IOrderService from "../Interfaces/IOrderService";

let _httpClient : IHttpClient;

const OrderService : IOrderService = {
    init: function (htppClient: IHttpClient): void {
        _httpClient = htppClient;
    },
    createSubscription: async (productSlug: string, token: string) => {
        let ret: SubscriptionResult;
        let request = await _httpClient.doGetAuth<SubscriptionResult>("/api/Order/createSubscription/" + productSlug, token);
        if (request.success) {
            return request.data;
        }
        else {
            ret = {
                mensagem: request.messageError,
                sucesso: false,
                ...ret
            };
        }
        return ret;
    }
}

export default OrderService;