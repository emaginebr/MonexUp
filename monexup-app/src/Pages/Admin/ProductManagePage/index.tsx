import { useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ProductForm, ProductList } from "lofn-react";
import type { ProductInfo } from "lofn-react";
import NetworkContext from "../../../Contexts/Network/NetworkContext";
import AuthContext from "../../../Contexts/Auth/AuthContext";
import ProductLinkContext from "../../../Contexts/ProductLink/ProductLinkContext";
import MessageToast from "../../../Components/MessageToast";
import { MessageToastEnum } from "../../../DTO/Enum/MessageToastEnum";

export default function ProductManagePage() {
  const { t } = useTranslation();
  const networkContext = useContext(NetworkContext);
  const authContext = useContext(AuthContext);
  const productLinkContext = useContext(ProductLinkContext);

  const [editing, setEditing] = useState<ProductInfo | null>(null);
  const [creating, setCreating] = useState<boolean>(false);

  const [toastShow, setToastShow] = useState<boolean>(false);
  const [toastKind, setToastKind] = useState<MessageToastEnum>(MessageToastEnum.Success);
  const [toastMsg, setToastMsg] = useState<string>("");

  const network = networkContext?.network;
  const session = authContext?.sessionInfo;

  const showError = (m: string) => {
    setToastKind(MessageToastEnum.Error);
    setToastMsg(m);
    setToastShow(true);
  };
  const showSuccess = (m: string) => {
    setToastKind(MessageToastEnum.Success);
    setToastMsg(m);
    setToastShow(true);
  };

  useEffect(() => {
    setEditing(null);
    setCreating(false);
  }, [network?.networkId]);

  if (!network) {
    return (
      <div className="container py-4">
        <p>{t("product_manage_no_network", "Nenhuma rede selecionada.")}</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="container py-4">
        <p>{t("product_manage_no_session", "Sessão expirada.")}</p>
      </div>
    );
  }

  const onProductSaved = async (saved: ProductInfo) => {
    if (!editing) {
      const r = await productLinkContext.upsert(saved.productId, network.networkId, session.userId);
      if (!r.sucesso) {
        showError(r.mensagemErro || t("product_link_error_persisted", "Falha ao registrar o link, tente novamente."));
      } else {
        showSuccess(t("product_link_first_create_provisioning", "Produto criado e vinculado."));
      }
    } else {
      showSuccess(t("product_manage_updated", "Produto atualizado."));
    }
    setEditing(null);
    setCreating(false);
  };

  return (
    <div className="container py-4">
      <h2>{t("product_manage_title", "Produtos")}</h2>
      {creating || editing ? (
        <ProductForm
          storeSlug={String(network.lofnStoreId ?? network.networkId)}
          product={editing}
          onSuccess={onProductSaved}
          onCancel={() => {
            setEditing(null);
            setCreating(false);
          }}
        />
      ) : (
        <>
          <button className="btn btn-primary mb-3" onClick={() => setCreating(true)}>
            {t("product_manage_new", "Novo produto")}
          </button>
          <ProductList
            storeId={network.lofnStoreId ?? undefined}
            onEdit={(p) => setEditing(p)}
            onCreate={() => setCreating(true)}
          />
        </>
      )}
      <MessageToast
        showMessage={toastShow}
        dialog={toastKind}
        messageText={toastMsg}
        onClose={() => setToastShow(false)}
      />
    </div>
  );
}
