import { useTranslation } from "react-i18next";
import { useActiveNetwork } from "../../../Hooks/useActiveNetwork";

export default function NetworkSwitcher() {
    const { t } = useTranslation();
    const { activeNetwork, availableNetworks, setActiveNetwork } = useActiveNetwork();

    if (availableNetworks.length < 2) return null;

    return (
        <div className="d-flex align-items-center gap-2">
            <label className="form-label mb-0 small">{t("admin_network_switcher_label", "Rede ativa")}</label>
            <select
                className="form-select form-select-sm"
                style={{ minWidth: 200 }}
                value={activeNetwork?.networkId ?? ""}
                onChange={(e) => setActiveNetwork(Number(e.target.value))}
            >
                {availableNetworks.map((un) => (
                    <option key={un.networkId} value={un.networkId}>
                        {un.network?.name ?? `#${un.networkId}`}
                    </option>
                ))}
            </select>
        </div>
    );
}
