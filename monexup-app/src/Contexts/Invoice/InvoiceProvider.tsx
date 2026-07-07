import { useState } from "react";
import ProviderResult from "../../DTO/Contexts/ProviderResult";
import IInvoiceProvider from "../../DTO/Contexts/IInvoiceProvider";
import InvoiceContext from "./InvoiceContext";
import InvoiceFactory from "../../Business/Factory/InvoiceFactory";
import MemberBalanceInfo from "../../DTO/Domain/MemberBalanceInfo";
import StatementListPagedInfo from "../../DTO/Domain/StatementListPagedInfo";
import StatementSearchParam from "../../DTO/Domain/StatementSearchParam";

export default function InvoiceProvider(props: any) {

    const [loadingSearch, setLoadingSearch] = useState<boolean>(false);
    const [loadingBalance, setLoadingBalance] = useState<boolean>(false);
    const [loadingAvailableBalance, setLoadingAvailableBalance] = useState<boolean>(false);
    const [loadingMemberBalance, setLoadingMemberBalance] = useState<boolean>(false);
    const [loadingNetworkBalance, setLoadingNetworkBalance] = useState<boolean>(false);

    const [balance, setBalance] = useState<number>(0);
    const [availableBalance, setAvailableBalance] = useState<number>(0);
    const [memberBalance, setMemberBalance] = useState<MemberBalanceInfo>(null);
    const [networkBalance, setNetworkBalance] = useState<MemberBalanceInfo>(null);

    const [statementResult, setStatementResult] = useState<StatementListPagedInfo>(null);

    const invoiceProviderValue: IInvoiceProvider = {
        loadingSearch: loadingSearch,
        loadingBalance: loadingBalance,
        loadingAvailableBalance: loadingAvailableBalance,
        loadingMemberBalance: loadingMemberBalance,
        loadingNetworkBalance: loadingNetworkBalance,

        balance: balance,
        availableBalance: availableBalance,
        memberBalance: memberBalance,
        networkBalance: networkBalance,

        statementResult: statementResult,

        searchStatement: async (param: StatementSearchParam) => {
            let ret: Promise<ProviderResult>;
            setLoadingSearch(true);
            let brt = await InvoiceFactory.InvoiceBusiness.searchStatement(param);
            if (brt.sucesso) {
                setLoadingSearch(false);
                setStatementResult(brt.dataResult);
                return {
                    ...ret,
                    sucesso: true,
                    clientSecret: brt.dataResult,
                    mensagemSucesso: "Statement loaded"
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
        getBalance: async (networkId?: number) => {
            let ret: Promise<ProviderResult>;
            setLoadingBalance(true);
            let brt = await InvoiceFactory.InvoiceBusiness.getBalance(networkId);
            if (brt.sucesso) {
                setLoadingBalance(false);
                setBalance(brt.dataResult);
                return {
                    ...ret,
                    sucesso: true,
                    clientSecret: brt.dataResult,
                    mensagemSucesso: "Balance loaded"
                };
            }
            else {
                setLoadingBalance(false);
                return {
                    ...ret,
                    sucesso: false,
                    mensagemErro: brt.mensagem
                };
            }
        },
        getAvailableBalance: async () => {
            let ret: Promise<ProviderResult>;
            setLoadingAvailableBalance(true);
            let brt = await InvoiceFactory.InvoiceBusiness.getAvailableBalance();
            if (brt.sucesso) {
                setLoadingAvailableBalance(false);
                setAvailableBalance(brt.dataResult);
                return {
                    ...ret,
                    sucesso: true,
                    clientSecret: brt.dataResult,
                    mensagemSucesso: "Available balance loaded"
                };
            }
            else {
                setLoadingAvailableBalance(false);
                return {
                    ...ret,
                    sucesso: false,
                    mensagemErro: brt.mensagem
                };
            }
        },
        getMyBalance: async (networkId: number) => {
            let ret: Promise<ProviderResult>;
            setLoadingMemberBalance(true);
            let brt = await InvoiceFactory.InvoiceBusiness.getMyBalance(networkId);
            if (brt.sucesso) {
                setLoadingMemberBalance(false);
                setMemberBalance(brt.dataResult);
                return {
                    ...ret,
                    sucesso: true,
                    clientSecret: brt.dataResult,
                    mensagemSucesso: "Member balance loaded"
                };
            }
            else {
                setLoadingMemberBalance(false);
                return {
                    ...ret,
                    sucesso: false,
                    mensagemErro: brt.mensagem
                };
            }
        },
        getNetworkBalance: async (networkId: number) => {
            let ret: Promise<ProviderResult>;
            setLoadingNetworkBalance(true);
            let brt = await InvoiceFactory.InvoiceBusiness.getNetworkBalance(networkId);
            if (brt.sucesso) {
                setLoadingNetworkBalance(false);
                setNetworkBalance(brt.dataResult);
                return {
                    ...ret,
                    sucesso: true,
                    clientSecret: brt.dataResult,
                    mensagemSucesso: "Network balance loaded"
                };
            }
            else {
                setLoadingNetworkBalance(false);
                return {
                    ...ret,
                    sucesso: false,
                    mensagemErro: brt.mensagem
                };
            }
        }
    }

    return (
        <InvoiceContext.Provider value={invoiceProviderValue}>
            {props.children}
        </InvoiceContext.Provider>
    );
}
