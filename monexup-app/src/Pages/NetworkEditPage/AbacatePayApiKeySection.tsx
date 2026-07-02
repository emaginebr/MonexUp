import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { KeyRound, CheckCircle2, AlertCircle, Save } from "lucide-react";

import ProxyPayStoreFactory from "../../Business/Factory/ProxyPayStoreFactory";
import SectionHeader from "./SectionHeader";
import FormField from "./FormField";

interface Props {
  networkId: number | null | undefined;
  storeId: number | null | undefined;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

/**
 * Seção write-only para a API Key do AbacatePay da rede.
 * - Indicador "Configurada / Não configurada" via MonexUp API (hasAbacatePayApiKey).
 * - As chamadas (status/save) usam `networkId` — a API MonexUp é por rede.
 * - Input nunca reexibe o valor; após salvar (204) limpa o campo e re-checa.
 * - `storeId` é usado apenas para decidir o hint de "loja ainda não provisionada".
 */
export default function AbacatePayApiKeySection({
  networkId,
  storeId,
  onSuccess,
  onError,
}: Props) {
  const { t } = useTranslation();

  const [apiKey, setApiKey] = useState<string>("");
  const [hasKey, setHasKey] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);

  const hasStore = !!storeId && storeId > 0;

  const refreshIndicator = () => {
    if (!hasStore || !networkId) return;
    ProxyPayStoreFactory.ProxyPayStoreBusiness.getHasAbacatePayApiKey(networkId)
      .then((value) => setHasKey(value))
      .catch(() => setHasKey(false));
  };

  useEffect(() => {
    refreshIndicator();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [networkId, storeId]);

  const handleSave = async () => {
    const trimmed = apiKey.trim();
    if (!trimmed) {
      onError(t("network_edit_abacatepay_empty_validation"));
      return;
    }
    setSaving(true);
    const ret = await ProxyPayStoreFactory.ProxyPayStoreBusiness.setAbacatePayApiKey(
      networkId as number,
      trimmed
    );
    setSaving(false);
    if (ret.sucesso) {
      setApiKey("");
      onSuccess(t("network_edit_abacatepay_save_success"));
      refreshIndicator();
    } else {
      onError(ret.mensagem || t("network_edit_abacatepay_save_error"));
    }
  };

  return (
    <section
      aria-labelledby="network-edit-abacatepay-title"
      className="auth-card relative p-6 sm:p-8 mt-6 animate-fade-up"
    >
      <SectionHeader
        id="network-edit-abacatepay-title"
        icon={KeyRound}
        title={t("network_edit_abacatepay_section_title")}
        subtitle={t("network_edit_abacatepay_section_subtitle")}
      />

      {!hasStore ? (
        <p className="text-sm text-graphite-500">
          {t("network_edit_abacatepay_no_store_hint")}
        </p>
      ) : (
        <div className="space-y-5">
          <div className="flex items-center gap-2" aria-live="polite">
            {hasKey ? (
              <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-700">
                <CheckCircle2 size={16} aria-hidden="true" />
                {t("network_edit_abacatepay_configured")}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-graphite-500">
                <AlertCircle size={16} aria-hidden="true" />
                {t("network_edit_abacatepay_not_configured")}
              </span>
            )}
          </div>

          <FormField
            id="network-edit-abacatepay-key"
            label={t("network_edit_abacatepay_field_label")}
            icon={KeyRound}
          >
            <input
              id="network-edit-abacatepay-key"
              type="password"
              autoComplete="off"
              placeholder={t("network_edit_abacatepay_field_placeholder")}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="flex-1 min-w-0 h-full px-2 bg-transparent border-0 outline-none text-graphite-900 placeholder:text-graphite-400 font-mono text-sm"
            />
          </FormField>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="cta-primary inline-flex h-12 items-center justify-center gap-2 px-6 rounded-md bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold shadow-glow-md transition-colors duration-fast disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:bg-orange-500"
          >
            {saving ? (
              t("loading")
            ) : (
              <>
                <Save size={16} aria-hidden="true" />
                {t("network_edit_abacatepay_save_button")}
              </>
            )}
          </button>
        </div>
      )}
    </section>
  );
}
