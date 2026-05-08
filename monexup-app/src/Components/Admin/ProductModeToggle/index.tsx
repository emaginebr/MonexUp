import { useTranslation } from "react-i18next";
import { ProductFormModeEnum } from "../../../DTO/Enum/ProductFormModeEnum";

interface Props {
    mode: ProductFormModeEnum;
    onModeChange: (mode: ProductFormModeEnum) => void;
}

export default function ProductModeToggle({ mode, onModeChange }: Props) {
    const { t } = useTranslation();

    return (
        <div className="btn-group" role="group" aria-label="Form mode">
            <button
                type="button"
                className={`btn ${mode === ProductFormModeEnum.Simple ? "btn-primary" : "btn-outline-primary"}`}
                onClick={() => onModeChange(ProductFormModeEnum.Simple)}
            >
                {t("admin_product_mode_simple", "Simples")}
            </button>
            <button
                type="button"
                className={`btn ${mode === ProductFormModeEnum.Advanced ? "btn-primary" : "btn-outline-primary"}`}
                onClick={() => onModeChange(ProductFormModeEnum.Advanced)}
            >
                {t("admin_product_mode_advanced", "Avançado")}
            </button>
        </div>
    );
}
