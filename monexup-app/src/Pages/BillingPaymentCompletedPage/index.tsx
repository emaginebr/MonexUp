import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const API_URL = process.env.REACT_APP_API_URL || "";
const TENANT_ID = process.env.REACT_APP_TENANT_ID || "monexup";

type Status = "loading" | "success" | "pending" | "error";

export default function BillingPaymentCompletedPage() {
  const { t } = useTranslation();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<Status>("loading");
  const [message, setMessage] = useState<string>("");

  const networkId = params.get("n");
  const proxypayInvoiceId = params.get("i");
  const signature = params.get("s");

  useEffect(() => {
    if (!networkId || !proxypayInvoiceId || !signature) {
      setStatus("error");
      setMessage(t("billing_completion_missing_params", "Parâmetros inválidos."));
      return;
    }
    fetch(`${API_URL}/Billing/payment-completed`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Tenant-Id": TENANT_ID },
      body: JSON.stringify({
        networkId: Number(networkId),
        proxypayInvoiceId: Number(proxypayInvoiceId),
        signature,
      }),
    })
      .then(async (res) => {
        const body = await res.json().catch(() => ({}));
        if (res.status === 401) {
          setStatus("error");
          setMessage(body?.mensagemErro || t("billing_completion_unauthorized", "Assinatura inválida."));
        } else if (res.ok && body?.sucesso) {
          if (body?.mensagemSucesso?.toLowerCase().includes("pending")) {
            setStatus("pending");
          } else {
            setStatus("success");
          }
          setMessage(body?.mensagemSucesso || t("billing_completion_ok", "Pagamento confirmado."));
        } else {
          setStatus("error");
          setMessage(body?.mensagemErro || t("billing_completion_error", "Falha ao registrar comissão."));
        }
      })
      .catch((err: Error) => {
        setStatus("error");
        setMessage(err.message);
      });
  }, [networkId, proxypayInvoiceId, signature]);

  return (
    <div className="container py-5 text-center">
      {status === "loading" && <p>{t("billing_completion_loading", "Confirmando pagamento...")}</p>}
      {status === "success" && (
        <div className="alert alert-success">
          <h4>{t("billing_completion_success_title", "Pagamento confirmado")}</h4>
          <p>{message}</p>
          <button className="btn btn-primary" onClick={() => navigate("/admin/billing")}>
            {t("back_to_dashboard", "Voltar ao painel")}
          </button>
        </div>
      )}
      {status === "pending" && (
        <div className="alert alert-warning">
          <h4>{t("billing_completion_pending_title", "Aguardando confirmação")}</h4>
          <p>{message}</p>
        </div>
      )}
      {status === "error" && (
        <div className="alert alert-danger">
          <h4>{t("billing_completion_error_title", "Erro")}</h4>
          <p>{message}</p>
        </div>
      )}
    </div>
  );
}
