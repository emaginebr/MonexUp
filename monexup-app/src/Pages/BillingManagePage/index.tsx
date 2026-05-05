import { useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import NetworkContext from "../../Contexts/Network/NetworkContext";
import AuthContext from "../../Contexts/Auth/AuthContext";
import BillingContext from "../../Contexts/Billing/BillingContext";
import MessageToast from "../../Components/MessageToast";
import { MessageToastEnum } from "../../DTO/Enum/MessageToastEnum";
import NewBillingForm from "./NewBillingForm";

export default function BillingManagePage() {
  const { t } = useTranslation();
  const networkContext = useContext(NetworkContext);
  const authContext = useContext(AuthContext);
  const billingContext = useContext(BillingContext);

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
    if (network?.networkId) {
      billingContext.list(network.networkId).then((r) => {
        if (!r.sucesso && r.mensagemErro) showError(r.mensagemErro);
      });
    }
  }, [network?.networkId]);

  if (!network) {
    return (
      <div className="container py-4">
        <p>{t("billing_manage_no_network", "Nenhuma rede selecionada.")}</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="container py-4">
        <p>{t("billing_manage_no_session", "Sessão expirada.")}</p>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>{t("billing_manage_title", "Cobranças recorrentes")}</h2>
        {!creating && (
          <button className="btn btn-primary" onClick={() => setCreating(true)}>
            {t("billing_new", "Nova cobrança")}
          </button>
        )}
      </div>

      {creating ? (
        <NewBillingForm
          onCancel={() => setCreating(false)}
          onSuccess={(msg) => {
            showSuccess(msg);
            setCreating(false);
            billingContext.list(network.networkId);
          }}
          onError={(msg) => showError(msg)}
        />
      ) : (
        <div className="card">
          <div className="card-body">
            {billingContext.loading && <p>{t("loading", "Carregando...")}</p>}
            {!billingContext.loading && billingContext.billings.length === 0 && (
              <p className="text-muted mb-0">{t("billing_empty", "Nenhuma cobrança registrada.")}</p>
            )}
            {!billingContext.loading && billingContext.billings.length > 0 && (
              <table className="table table-sm">
                <thead>
                  <tr>
                    <th>{t("billing_id", "ID")}</th>
                    <th>{t("billing_customer", "Cliente")}</th>
                    <th>{t("billing_frequency_label", "Frequência")}</th>
                    <th>{t("billing_next_charge", "Próxima cobrança")}</th>
                    <th>{t("billing_status", "Status")}</th>
                  </tr>
                </thead>
                <tbody>
                  {billingContext.billings.map((b) => (
                    <tr key={b.proxypayBillingId}>
                      <td>{b.proxypayBillingId}</td>
                      <td>{b.customerName}</td>
                      <td>{b.frequency}</td>
                      <td>{b.nextChargeDate ? new Date(b.nextChargeDate).toLocaleDateString() : "-"}</td>
                      <td>{b.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      <MessageToast
        dialog={toastKind}
        showMessage={toastShow}
        messageText={toastMsg}
        onClose={() => setToastShow(false)}
      />
    </div>
  );
}
