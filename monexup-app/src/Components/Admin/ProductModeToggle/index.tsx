import { useTranslation } from "react-i18next";
import { ProductFormModeEnum } from "../../../DTO/Enum/ProductFormModeEnum";

interface Props {
    mode: ProductFormModeEnum;
    onModeChange: (mode: ProductFormModeEnum) => void;
}

/**
 * ProductModeToggle — compact "Modo avançado" checkbox.
 *
 * Replaces the previous two-button group ([Simples] [Avançado]) with a
 * single labelled checkbox. Sits on the right of the page header where
 * the Save button used to be. Default is unchecked (Simple mode); the
 * parent owns persistence (localStorage `mnx.productForm.advancedMode`).
 */
export default function ProductModeToggle({ mode, onModeChange }: Props) {
    const { t } = useTranslation();
    const isAdvanced = mode === ProductFormModeEnum.Advanced;

    return (
        <label className="inline-flex items-center gap-2 text-sm text-graphite-700 cursor-pointer select-none">
            <input
                type="checkbox"
                className="h-4 w-4 rounded border-mnx-neutral-300 text-orange-500 focus:ring-2 focus:ring-orange-500/30 cursor-pointer"
                checked={isAdvanced}
                onChange={(e) =>
                    onModeChange(
                        e.target.checked
                            ? ProductFormModeEnum.Advanced
                            : ProductFormModeEnum.Simple,
                    )
                }
            />
            <span>{t("admin_product_mode_advanced", "Modo avançado")}</span>
        </label>
    );
}
