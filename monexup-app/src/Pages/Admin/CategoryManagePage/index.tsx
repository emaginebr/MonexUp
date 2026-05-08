import { useTranslation } from "react-i18next";

// US4 stub — implementação completa na Phase 5
export default function CategoryManagePage() {
    const { t } = useTranslation();
    return (
        <div className="container py-4">
            <h2>{t("admin_category_title", "Categorias")}</h2>
            <p className="text-muted">Em construção (US4)</p>
        </div>
    );
}
