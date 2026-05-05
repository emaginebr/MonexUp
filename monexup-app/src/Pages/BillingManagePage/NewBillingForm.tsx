import { useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import { BillingPayment, BillingFrequency, PaymentMethod } from "proxypay-react";
import NetworkContext from "../../Contexts/Network/NetworkContext";
import BillingContext from "../../Contexts/Billing/BillingContext";

interface Props {
  onCancel: () => void;
  onSuccess: (msg: string) => void;
  onError: (msg: string) => void;
}

const COMPLETION_BASE = process.env.REACT_APP_PROXYPAY_COMPLETION_URL_BASE
  || `${window.location.origin}/billing/payment-completed`;
const RETURN_BASE = process.env.REACT_APP_PROXYPAY_RETURN_URL_BASE
  || `${window.location.origin}/admin/billing`;

export default function NewBillingForm(props: Props) {
  const { t } = useTranslation();
  const networkContext = useContext(NetworkContext);
  const billingContext = useContext(BillingContext);

  const [customerName, setCustomerName] = useState<string>("");
  const [customerEmail, setCustomerEmail] = useState<string>("");
  const [customerCpf, setCustomerCpf] = useState<string>("");
  const [customerPhone, setCustomerPhone] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [unitPrice, setUnitPrice] = useState<number>(0);
  const [frequency, setFrequency] = useState<BillingFrequency>(BillingFrequency.Monthly);
  const [paymentMethod] = useState<PaymentMethod>(PaymentMethod.Pix);
  const [billingStartDate, setBillingStartDate] = useState<string>(
    new Date().toISOString().slice(0, 10)
  );
  const [provisioning, setProvisioning] = useState<boolean>(false);
  const [readyToPay, setReadyToPay] = useState<boolean>(false);

  const network = networkContext?.network;
  if (!network) return null;

  const ensureStoreThenContinue = async () => {
    if (!customerName || !customerEmail || !description || unitPrice <= 0) {
      props.onError(t("billing_form_invalid", "Preencha todos os campos obrigatórios."));
      return;
    }
    if (!network.proxypayClientId) {
      setProvisioning(true);
      const r = await billingContext.ensureStore(network.networkId);
      setProvisioning(false);
      if (!r.sucesso) {
        props.onError(r.mensagemErro || t("billing_ensure_store_error", "Falha ao provisionar a loja."));
        return;
      }
      await networkContext.listByUser();
    }
    setReadyToPay(true);
  };

  if (readyToPay && network.proxypayClientId) {
    const completionUrl = `${COMPLETION_BASE}?n=${network.networkId}`;
    const returnUrl = RETURN_BASE;
    return (
      <div className="card">
        <div className="card-body">
          <h5>{t("billing_review_title", "Confirme e siga para o pagamento")}</h5>
          <p>
            <strong>{t("billing_customer", "Cliente")}:</strong> {customerName} &lt;{customerEmail}&gt;
          </p>
          <p>
            <strong>{t("billing_item", "Item")}:</strong> {description} — R$ {unitPrice.toFixed(2)}
          </p>
          <BillingPayment
            customer={{
              name: customerName,
              documentId: customerCpf,
              cellphone: customerPhone,
              email: customerEmail,
            }}
            items={[{ description, quantity: 1, unitPrice, discount: 0 }]}
            frequency={frequency}
            paymentMethod={paymentMethod}
            billingStartDate={billingStartDate}
            completionUrl={completionUrl}
            returnUrl={returnUrl}
            onError={(err: Error) => props.onError(err.message)}
          >
            <button className="btn btn-success btn-lg">
              {t("billing_pay_now", "Pagar com ProxyPay")}
            </button>
          </BillingPayment>
          <button className="btn btn-link mt-2" onClick={() => setReadyToPay(false)}>
            {t("back", "Voltar")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-body">
        <h5>{t("billing_new", "Nova cobrança")}</h5>

        <div className="mb-3">
          <label className="form-label">{t("billing_customer_name", "Nome do cliente")}</label>
          <input
            type="text"
            className="form-control"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">{t("billing_customer_email", "Email do cliente")}</label>
          <input
            type="email"
            className="form-control"
            value={customerEmail}
            onChange={(e) => setCustomerEmail(e.target.value)}
          />
        </div>

        <div className="row">
          <div className="col-md-6 mb-3">
            <label className="form-label">{t("billing_customer_cpf", "CPF")}</label>
            <input
              type="text"
              className="form-control"
              value={customerCpf}
              onChange={(e) => setCustomerCpf(e.target.value.replace(/\D/g, ""))}
              maxLength={11}
            />
          </div>
          <div className="col-md-6 mb-3">
            <label className="form-label">{t("billing_customer_phone", "Telefone")}</label>
            <input
              type="text"
              className="form-control"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
            />
          </div>
        </div>

        <div className="mb-3">
          <label className="form-label">{t("billing_item_description", "Descrição do item")}</label>
          <input
            type="text"
            className="form-control"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="row">
          <div className="col-md-4 mb-3">
            <label className="form-label">{t("billing_unit_price", "Valor (R$)")}</label>
            <input
              type="number"
              step="0.01"
              className="form-control"
              value={unitPrice}
              onChange={(e) => setUnitPrice(parseFloat(e.target.value || "0"))}
            />
          </div>
          <div className="col-md-4 mb-3">
            <label className="form-label">{t("billing_frequency_label", "Frequência")}</label>
            <select
              className="form-select"
              value={frequency}
              onChange={(e) => setFrequency(parseInt(e.target.value, 10) as BillingFrequency)}
            >
              <option value={BillingFrequency.Monthly}>{t("billing_frequency_monthly", "Mensal")}</option>
              <option value={BillingFrequency.Quarterly}>{t("billing_frequency_quarterly", "Trimestral")}</option>
              <option value={BillingFrequency.Semiannual}>{t("billing_frequency_semiannual", "Semestral")}</option>
              <option value={BillingFrequency.Annual}>{t("billing_frequency_annual", "Anual")}</option>
            </select>
          </div>
          <div className="col-md-4 mb-3">
            <label className="form-label">{t("billing_start_date", "Início da cobrança")}</label>
            <input
              type="date"
              className="form-control"
              value={billingStartDate}
              onChange={(e) => setBillingStartDate(e.target.value)}
            />
          </div>
        </div>

        <div className="d-flex gap-2">
          <button
            className="btn btn-primary"
            onClick={ensureStoreThenContinue}
            disabled={provisioning}
          >
            {provisioning
              ? t("billing_provisioning", "Provisionando loja...")
              : t("billing_continue", "Continuar")}
          </button>
          <button className="btn btn-secondary" onClick={props.onCancel}>
            {t("cancel", "Cancelar")}
          </button>
        </div>
      </div>
    </div>
  );
}
