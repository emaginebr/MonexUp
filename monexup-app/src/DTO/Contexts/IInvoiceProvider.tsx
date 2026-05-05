import StatementListPagedInfo from "../Domain/StatementListPagedInfo";
import StatementSearchParam from "../Domain/StatementSearchParam";
import ProviderResult from "./ProviderResult";


interface IInvoiceProvider {
    loadingSearch: boolean;
    loadingBalance: boolean;
    loadingAvailableBalance: boolean;

    balance: number,
    availableBalance: number,

    statementResult: StatementListPagedInfo;

    searchStatement: (param: StatementSearchParam) => Promise<ProviderResult>;
    getBalance: (networkId?: number) => Promise<ProviderResult>;
    getAvailableBalance: () => Promise<ProviderResult>;
}

export default IInvoiceProvider;
