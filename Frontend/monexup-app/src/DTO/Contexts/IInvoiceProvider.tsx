import InvoiceListPagedInfo from "../Domain/InvoiceListPagedInfo";
import StatementListPagedInfo from "../Domain/StatementListPagedInfo";
import StatementSearchParam from "../Domain/StatementSearchParam";
import ProviderResult from "./ProviderResult";


interface IInvoiceProvider {
    loadingSearch: boolean;
    loadingBalance: boolean;
    loadingAvailableBalance: boolean;

    balance: number,
    availableBalance: number,

    searchResult: InvoiceListPagedInfo;
    statementResult: StatementListPagedInfo;
    
    search: (networkId: number, userId: number, sellerId: number, pageNum: number) => Promise<ProviderResult>;
    searchStatement: (param: StatementSearchParam) => Promise<ProviderResult>;
    getBalance: (networkId?: number) => Promise<ProviderResult>;
    getAvailableBalance: () => Promise<ProviderResult>;
}

export default IInvoiceProvider;