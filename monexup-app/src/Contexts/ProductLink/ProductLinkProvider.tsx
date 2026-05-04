import { useState } from "react";
import IProductLinkProvider from "../../DTO/Contexts/IProductLinkProvider";
import ProviderResult from "../../DTO/Contexts/ProviderResult";
import ProductLinkInfo from "../../DTO/Domain/ProductLinkInfo";
import ProductLinkFactory from "../../Business/Factory/ProductLinkFactory";
import ProductLinkContext from "./ProductLinkContext";

const PENDING_KEY = "mnx.productLink.pending";

interface PendingPayload {
  lofnProductId: number;
  networkId: number;
  userId: number;
  attemptedAt: string;
}

function persistPending(p: PendingPayload) {
  try {
    window.localStorage.setItem(PENDING_KEY, JSON.stringify(p));
  } catch {
    /* ignore */
  }
}

function clearPending() {
  try {
    window.localStorage.removeItem(PENDING_KEY);
  } catch {
    /* ignore */
  }
}

export default function ProductLinkProvider(props: any) {
  const [loading, setLoading] = useState<boolean>(false);
  const [links, setLinks] = useState<ProductLinkInfo[]>([]);
  const [lastLink, setLastLink] = useState<ProductLinkInfo | null>(null);

  const value: IProductLinkProvider = {
    loading,
    links,
    lastLink,

    async upsert(lofnProductId: number, networkId: number, userId: number) {
      const ret = {} as ProviderResult;
      setLoading(true);
      persistPending({ lofnProductId, networkId, userId, attemptedAt: new Date().toISOString() });

      const brt = await ProductLinkFactory.ProductLinkBusiness.upsert(lofnProductId, networkId, userId);

      setLoading(false);
      if (brt.sucesso) {
        clearPending();
        setLastLink(brt.dataResult);
        return { ...ret, sucesso: true, mensagemSucesso: "Produto vinculado." };
      }
      return { ...ret, sucesso: false, mensagemErro: brt.mensagem || "Falha ao vincular produto." };
    },

    async listByNetwork(networkId: number) {
      const ret = {} as ProviderResult;
      setLoading(true);
      const brt = await ProductLinkFactory.ProductLinkBusiness.listByNetwork(networkId);
      setLoading(false);
      if (brt.sucesso) {
        setLinks(brt.dataResult || []);
        return { ...ret, sucesso: true };
      }
      return { ...ret, sucesso: false, mensagemErro: brt.mensagem };
    },

    async listByUser(userId: number) {
      const ret = {} as ProviderResult;
      setLoading(true);
      const brt = await ProductLinkFactory.ProductLinkBusiness.listByUser(userId);
      setLoading(false);
      if (brt.sucesso) {
        setLinks(brt.dataResult || []);
        return { ...ret, sucesso: true };
      }
      return { ...ret, sucesso: false, mensagemErro: brt.mensagem };
    },

    async deleteByNetwork(networkId: number) {
      const ret = {} as ProviderResult;
      setLoading(true);
      const brt = await ProductLinkFactory.ProductLinkBusiness.deleteByNetwork(networkId);
      setLoading(false);
      return brt.sucesso
        ? { ...ret, sucesso: true, mensagemSucesso: "Links removidos." }
        : { ...ret, sucesso: false, mensagemErro: brt.mensagem };
    },
  };

  return <ProductLinkContext.Provider value={value}>{props.children}</ProductLinkContext.Provider>;
}
