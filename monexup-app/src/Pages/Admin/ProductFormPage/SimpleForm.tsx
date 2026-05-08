import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ProductStatusEnum } from "lofn-react";
import type { ProductInfo } from "lofn-react";

export interface SimpleFormValues {
    name: string;
    description: string;
    price: number;
    status: ProductStatusEnum;
    imageFile: File | null;
    existingImageUrl: string | null;
}

interface Props {
    initial?: ProductInfo | null;
    onSubmit: (values: SimpleFormValues) => Promise<void>;
    onCancel: () => void;
    submitting: boolean;
}

export default function SimpleForm({ initial, onSubmit, onCancel, submitting }: Props) {
    const { t } = useTranslation();
    const [values, setValues] = useState<SimpleFormValues>({
        name: "",
        description: "",
        price: 0,
        status: ProductStatusEnum.Active,
        imageFile: null,
        existingImageUrl: null,
    });

    useEffect(() => {
        if (initial) {
            setValues({
                name: initial.name ?? "",
                description: initial.description ?? "",
                price: Number(initial.price ?? 0),
                status: initial.status ?? ProductStatusEnum.Active,
                imageFile: null,
                existingImageUrl: initial.images?.[0]?.imageUrl ?? null,
            });
        }
    }, [initial]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!values.name.trim() || values.price < 0) return;
        await onSubmit(values);
    };

    const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] ?? null;
        setValues((v) => ({ ...v, imageFile: file }));
    };

    return (
        <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
            <div>
                <label className="form-label">{t("admin_product_field_name", "Nome")}</label>
                <input
                    type="text"
                    className="form-control"
                    value={values.name}
                    onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
                    required
                    minLength={3}
                    maxLength={120}
                />
            </div>

            <div>
                <label className="form-label">{t("admin_product_field_description", "Descrição")}</label>
                <textarea
                    className="form-control"
                    rows={3}
                    value={values.description}
                    onChange={(e) => setValues((v) => ({ ...v, description: e.target.value }))}
                />
            </div>

            <div>
                <label className="form-label">{t("admin_product_field_price", "Preço")}</label>
                <input
                    type="number"
                    step="0.01"
                    min="0"
                    className="form-control"
                    value={values.price}
                    onChange={(e) => setValues((v) => ({ ...v, price: Number(e.target.value) }))}
                    required
                />
            </div>

            <div>
                <label className="form-label">{t("admin_product_field_image", "Foto")}</label>
                {values.existingImageUrl && !values.imageFile && (
                    <div className="mb-2">
                        <img src={values.existingImageUrl} alt="" style={{ maxHeight: 100 }} />
                    </div>
                )}
                <input
                    type="file"
                    className="form-control"
                    accept="image/*"
                    onChange={onFileChange}
                    required={!initial && !values.existingImageUrl}
                />
            </div>

            <div className="form-check">
                <input
                    type="checkbox"
                    className="form-check-input"
                    id="simple-status-active"
                    checked={values.status === ProductStatusEnum.Active}
                    onChange={(e) =>
                        setValues((v) => ({
                            ...v,
                            status: e.target.checked ? ProductStatusEnum.Active : ProductStatusEnum.Inactive,
                        }))
                    }
                />
                <label className="form-check-label" htmlFor="simple-status-active">
                    {t("admin_product_field_status", "Ativo")}
                </label>
            </div>

            <div className="d-flex gap-2">
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                    {submitting ? t("loading", "Carregando...") : t("admin_product_save", "Salvar")}
                </button>
                <button type="button" className="btn btn-outline-secondary" onClick={onCancel} disabled={submitting}>
                    {t("cancel", "Cancelar")}
                </button>
            </div>
        </form>
    );
}
