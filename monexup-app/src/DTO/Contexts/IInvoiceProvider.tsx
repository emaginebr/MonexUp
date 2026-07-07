import MemberBalanceInfo from "../Domain/MemberBalanceInfo";
import StatementListPagedInfo from "../Domain/StatementListPagedInfo";
import StatementSearchParam from "../Domain/StatementSearchParam";
import ProviderResult from "./ProviderResult";


interface IInvoiceProvider {
    loadingSearch: boolean;
    loadingBalance: boolean;
    loadingAvailableBalance: boolean;
    loadingMemberBalance: boolean;
    loadingNetworkBalance: boolean;

    balance: number,
    availableBalance: number,
    memberBalance: MemberBalanceInfo,
    networkBalance: MemberBalanceInfo,

    statementResult: StatementListPagedInfo;

    searchStatement: (param: StatementSearchParam) => Promise<ProviderResult>;
    getBalance: (networkId?: number) => Promise<ProviderResult>;
    getAvailableBalance: () => Promise<ProviderResult>;
    getMyBalance: (networkId: number) => Promise<ProviderResult>;
    getNetworkBalance: (networkId: number) => Promise<ProviderResult>;
}

export default IInvoiceProvider;
