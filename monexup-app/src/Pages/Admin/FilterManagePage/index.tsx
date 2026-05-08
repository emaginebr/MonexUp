import { useTranslation } from "react-i18next";

// US5 stub — implementação completa na Phase 7 (admin-only via RequireAdmin no router)
export default function FilterManagePage() {
    const { t } = useTranslation();
    return (
        <div className="container py-4">
            <h2>{t("admin_filter_title", "Filtros (admin)")}</h2>
            <p className="text-muted">Em construção (US5)</p>
        </div>
    );
}
