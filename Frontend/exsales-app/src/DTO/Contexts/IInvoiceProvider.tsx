import InvoiceListPagedInfo from "../Domain/InvoiceListPagedInfo";
import ProviderResult from "./ProviderResult";


interface IInvoiceProvider {
    loadingSearch: boolean;

    searchResult: InvoiceListPagedInfo;
    
    search: (networkId: number, userId: number, sellerId: number, pageNum: number) => Promise<ProviderResult>;
}

export default IInvoiceProvider;