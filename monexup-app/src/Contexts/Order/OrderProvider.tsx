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

        createPixPayment: async (productSlug: string, documentId: string, cellphone: string, networkSlug?: string, sellerSlug?: string, amount?: number) => {
            let ret: Promise<OrderProviderResult>;
            setLoadingUpdate(true);
            let brt = await OrderFactory.OrderBusiness.createPixPayment(productSlug, documentId, cellphone, networkSlug, sellerSlug, amount);
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
        checkPixStatus: async (invoiceId: number) => {
            return await OrderFactory.OrderBusiness.checkPixStatus(invoiceId);
        },
        simulatePixPayment: async (invoiceId: number) => {
            return await OrderFactory.OrderBusiness.simulatePixPayment(invoiceId);
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
        },
        listInvoices: async (orderId: number) => {
            const brt = await OrderFactory.OrderBusiness.listInvoices(orderId);
            if (brt.sucesso) {
                return { sucesso: true, invoices: brt.dataResult || [] };
            }
            return { sucesso: false, invoices: [], mensagemErro: brt.mensagem };
        },
        getInvoice: async (orderId: number, invoiceId: number) => {
            const brt = await OrderFactory.OrderBusiness.getInvoice(orderId, invoiceId);
            if (brt.sucesso) {
                return { sucesso: true, invoice: brt.dataResult };
            }
            return { sucesso: false, invoice: null, mensagemErro: brt.mensagem };
        },
        update: async (order: OrderInfo) => {
            let ret: Promise<OrderProviderResult>;
            setLoadingUpdate(true);
            let brt = await OrderFactory.OrderBusiness.update(order);
            setLoadingUpdate(false);
            if (brt.sucesso) {
                setOrder(brt.dataResult);
                return {
                    ...ret,
                    sucesso: true,
                    order: brt.dataResult,
                    mensagemSucesso: "Order updated"
                };
            }
            return { ...ret, sucesso: false, mensagemErro: brt.mensagem };
        }
    }

    return (
        <OrderContext.Provider value={orderProviderValue}>
            {props.children}
        </OrderContext.Provider>
    );
}
