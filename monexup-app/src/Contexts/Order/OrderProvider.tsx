import { useState } from "react";
import ProviderResult from "../../DTO/Contexts/ProviderResult";
import OrderInfo from "../../DTO/Domain/OrderInfo";
import IOrderProvider from "../../DTO/Contexts/IOrderProvider";
import OrderContext from "./OrderContext";
import OrderProviderResult from "../../DTO/Contexts/OrderProviderResult";
import OrderFactory from "../../Business/Factory/OrderFactory";
import OrderListPagedInfo from "../../DTO/Domain/OrderListPagedInfo";
import PixPaymentResult from "../../DTO/Services/SubscriptionResult";

export default function OrderProvider(props: any) {

    const [loading, setLoading] = useState<boolean>(false);
    const [loadingUpdate, setLoadingUpdate] = useState<boolean>(false);
    const [loadingSearch, setLoadingSearch] = useState<boolean>(false);

    const [order, setOrder] = useState<OrderInfo>(null);
    const [searchResult, setSearchResult] = useState<OrderListPagedInfo>(null);
    const [pixPaymentResult, setPixPaymentResult] = useState<PixPaymentResult | null>(null);

    const orderProviderValue: IOrderProvider = {
        loading: loading,
        loadingUpdate: loadingUpdate,
        loadingSearch: loadingSearch,

        order: order,
        searchResult: searchResult,
        pixPaymentResult: pixPaymentResult,

        createPixPayment: async (productSlug: string, documentId: string, networkSlug?: string, sellerSlug?: string) => {
            let ret: Promise<OrderProviderResult>;
            setLoadingUpdate(true);
            let brt = await OrderFactory.OrderBusiness.createPixPayment(productSlug, documentId, networkSlug, sellerSlug);
            if (brt.sucesso) {
                setLoadingUpdate(false);
                setPixPaymentResult(brt.dataResult);
                return {
                    ...ret,
                    sucesso: true,
                    mensagemSucesso: "Payment created"
                };
            }
            else {
                setLoadingUpdate(false);
                return {
                    ...ret,
                    sucesso: false,
                    mensagemErro: brt.mensagem
                };
            }
        },
        search: async (networkId: number, userId: number, sellerId: number, pageNum: number) => {
            let ret: Promise<ProviderResult>;
            setLoadingSearch(true);
            let brt = await OrderFactory.OrderBusiness.search(networkId, userId, sellerId, pageNum);
            if (brt.sucesso) {
                setLoadingSearch(false);
                setSearchResult(brt.dataResult);
                return {
                    ...ret,
                    sucesso: true,
                    mensagemSucesso: "Search completed"
                };
            }
            else {
                setLoadingSearch(false);
                return {
                    ...ret,
                    sucesso: false,
                    mensagemErro: brt.mensagem
                };
            }
        },
        getById: async (orderId: number) => {
            let ret: Promise<OrderProviderResult>;
            setLoading(true);
            let brt = await OrderFactory.OrderBusiness.getById(orderId);
            if (brt.sucesso) {
                setLoading(false);
                setOrder(brt.dataResult);
                return {
                    ...ret,
                    sucesso: true,
                    order: brt.dataResult,
                    mensagemSucesso: "Load Order"
                };
            }
            else {
                setLoading(false);
                return {
                    ...ret,
                    sucesso: false,
                    mensagemErro: brt.mensagem
                };
            }
        }
    }

    return (
        <OrderContext.Provider value={orderProviderValue}>
            {props.children}
        </OrderContext.Provider>
    );
}
