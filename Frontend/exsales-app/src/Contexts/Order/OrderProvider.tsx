import { useState } from "react";
import ProviderResult from "../../DTO/Contexts/ProviderResult";
import UserProfileInfo from "../../DTO/Domain/UserProfileInfo";
import IProfileProvider from "../../DTO/Contexts/IProfileProvider";
import ProfileFactory from "../../Business/Factory/ProfileFactory";
import OrderInfo from "../../DTO/Domain/OrderInfo";
import IOrderProvider from "../../DTO/Contexts/IOrderProvider";
import OrderContext from "./OrderContext";
import OrderProviderResult from "../../DTO/Contexts/OrderProviderResult";
import OrderFactory from "../../Business/Factory/OrderFactory";

export default function OrderProvider(props: any) {

    const [loading, setLoading] = useState<boolean>(false);
    const [loadingUpdate, setLoadingUpdate] = useState<boolean>(false);

    const [order, setOrder] = useState<OrderInfo>(null);
    const [clientSecret, setClientSecret] = useState<string>("");

    const orderProviderValue: IOrderProvider = {
        loading: loading,
        loadingUpdate: loadingUpdate,

        order: order,
        clientSecret: clientSecret,

        createSubscription: async (productSlug: string) => {
            let ret: Promise<OrderProviderResult>;
            setLoadingUpdate(true);
            //try {
            let brt = await OrderFactory.OrderBusiness.createSubscription(productSlug);
            if (brt.sucesso) {
                setLoadingUpdate(false);
                setClientSecret(brt.dataResult);
                return {
                    ...ret,
                    sucesso: true,
                    clientSecret: brt.dataResult,
                    mensagemSucesso: "Profile added"
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
            /*
            }
            catch (err) {
                setLoadingUpdate(false);
                return {
                    ...ret,
                    sucesso: false,
                    mensagemErro: JSON.stringify(err)
                };
            }
            */
        }
    }

    return (
        <OrderContext.Provider value={orderProviderValue}>
            {props.children}
        </OrderContext.Provider>
    );
}