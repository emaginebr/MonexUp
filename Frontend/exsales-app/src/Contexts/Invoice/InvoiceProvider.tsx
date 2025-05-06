import { useState } from "react";
import ProviderResult from "../../DTO/Contexts/ProviderResult";
import InvoiceListPagedInfo from "../../DTO/Domain/InvoiceListPagedInfo";
import IInvoiceProvider from "../../DTO/Contexts/IInvoiceProvider";
import InvoiceContext from "./InvoiceContext";
import InvoiceFactory from "../../Business/Factory/InvoiceFactory";

export default function InvoiceProvider(props: any) {

    const [loadingSearch, setLoadingSearch] = useState<boolean>(false);

    const [searchResult, setSearchResult] = useState<InvoiceListPagedInfo>(null);

    const invoiceProviderValue: IInvoiceProvider = {
        loadingSearch: loadingSearch,

        searchResult: searchResult,

        search: async (networkId: number, userId: number, sellerId: number, pageNum: number) => {
            let ret: Promise<ProviderResult>;
            setLoadingSearch(true);
            //try {
            let brt = await InvoiceFactory.InvoiceBusiness.search(networkId, userId, sellerId, pageNum);
            if (brt.sucesso) {
                setLoadingSearch(false);
                console.log(JSON.stringify(brt.dataResult));
                setSearchResult(brt.dataResult);
                return {
                    ...ret,
                    sucesso: true,
                    clientSecret: brt.dataResult,
                    mensagemSucesso: "Profile added"
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
        <InvoiceContext.Provider value={invoiceProviderValue}>
            {props.children}
        </InvoiceContext.Provider>
    );
}