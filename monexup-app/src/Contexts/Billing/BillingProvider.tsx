import { useState } from "react";
import IBillingProvider from "../../DTO/Contexts/IBillingProvider";
import ProviderResult from "../../DTO/Contexts/ProviderResult";
import BillingListItemInfo from "../../DTO/Domain/BillingListItemInfo";
import EnsureStoreResponse from "../../DTO/Domain/EnsureStoreResponse";
import BillingFactory from "../../Business/Factory/BillingFactory";
import BillingContext from "./BillingContext";

export default function BillingProvider(props: any) {
  const [loading, setLoading] = useState<boolean>(false);
  const [billings, setBillings] = useState<BillingListItemInfo[]>([]);
  const [lastEnsuredStore, setLastEnsuredStore] = useState<EnsureStoreResponse | null>(null);

  const value: IBillingProvider = {
    loading,
    billings,
    lastEnsuredStore,

    async ensureStore(networkId: number) {
      const ret = {} as ProviderResult;
      setLoading(true);
      const brt = await BillingFactory.BillingBusiness.ensureStore(networkId);
      setLoading(false);
      if (brt.sucesso) {
        setLastEnsuredStore(brt.dataResult);
        return { ...ret, sucesso: true, mensagemSucesso: "Loja ProxyPay pronta." };
      }
      return { ...ret, sucesso: false, mensagemErro: brt.mensagem || "Falha ao provisionar a loja." };
    },

    async list(networkId: number, pageNum = 1, pageSize = 20) {
      const ret = {} as ProviderResult;
      setLoading(true);
      const brt = await BillingFactory.BillingBusiness.list(networkId, pageNum, pageSize);
      setLoading(false);
      if (brt.sucesso) {
        setBillings(brt.dataResult || []);
        return { ...ret, sucesso: true };
      }
      return { ...ret, sucesso: false, mensagemErro: brt.mensagem };
    },
  };

  return <BillingContext.Provider value={value}>{props.children}</BillingContext.Provider>;
}
