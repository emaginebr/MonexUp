import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ProductStatusEnum } from "lofn-react";
import {
    Tag,
    Image as ImageIcon,
    DollarSign,
    Percent,
    HandCoins,
    Layers,
    ArrowLeft,
    Save,
} from "lucide-react";
import MDEditor from "@uiw/react-md-editor";

import FormField from "../../NetworkEditPage/FormField";
import {
    DonationModeEnum,
    ProductInfoExt,
    ProductTypeExtended,
} from "../../../DTO/Lofn/ProductExt";

export interface SimpleFormValues {
    name: string;
    description: string;
    productType: ProductTypeExtended;
    donationMode: DonationModeEnum;
    price: number;
    minimumDonationAmount: number;
    discount: number;
    status: ProductStatusEnum;
    imageFile: File | null;
    existingImageUrl: string | null;
}

interface Props {
    initial?: ProductInfoExt | null;
    onSubmit: (values: SimpleFormValues) => Promise<void>;
    onCancel: () => void;
    submitting: boolean;
}

const DEFAULTS: SimpleFormValues = {
    name: "",
    description: "",
    productType: ProductTypeExtended.Physical,
    donationMode: DonationModeEnum.Fixed,
    price: 0,
    minimumDonationAmount: 0,
    discount: 0,
    status: ProductStatusEnum.Active,
    imageFile: null,
    existingImageUrl: null,
};

export default function SimpleForm({ initial, onSubmit, onCancel, submitting }: Props) {
    const { t } = useTranslation();
    const [values, setValues] = useState<SimpleFormValues>(DEFAULTS);

    useEffect(() => {
        if (initial) {
            setValues({
                name: initial.name ?? "",
                description: initial.description ?? "",
                productType: (initial.productType as ProductTypeExtended) ?? ProductTypeExtended.Physical,
                donationMode: (initial.donationMode as DonationModeEnum) ?? DonationModeEnum.Fixed,
                price: Number(initial.price ?? 0),
                minimumDonationAmount: Number(initial.minimumDonationAmount ?? 0),
                discount: Number(initial.discount ?? 0),
                status: initial.status ?? ProductStatusEnum.Active,
                imageFile: null,
                existingImageUrl: initial.images?.[0]?.imageUrl ?? null,
            });
        }
    }, [initial]);

    const isDonation = values.productType === ProductTypeExtended.Donation;
    const isFreeDonation = isDonation && values.donationMode === DonationModeEnum.Free;
    const isFixedDonation = isDonation && values.donationMode === DonationModeEnum.Fixed;
    const priceDisabled = isFreeDonation;
    const discountDisabled = isDonation;
    const donationModeDisabled = !isDonation;
    const minimumDonationDisabled = !isDonation || isFixedDonation;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!values.name.trim() || values.name.trim().length < 3) return;
        if (!priceDisabled && values.price < 0) return;
        if (values.discount < 0) return;
        if (values.minimumDonationAmount < 0) return;
        await onSubmit(values);
    };

    const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] ?? null;
        setValues((v) => ({ ...v, imageFile: file }));
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            {/* 1. Foto -------------------------------------------------- */}
            <div>
                <div className="flex items-baseline justify-between mb-1.5">
                    <label className="block text-sm font-medium text-graphite-700">
                        {t("admin_product_field_image", "Foto")}
                    </label>
                </div>
                <div className="flex items-start gap-4">
                    <div className="w-24 h-24 rounded-md border border-mnx-neutral-300 bg-mnx-neutral-50 flex items-center justify-center overflow-hidden shrink-0">
                        {values.imageFile ? (
                            <img
                                src={URL.createObjectURL(values.imageFile)}
                                alt=""
                                className="w-full h-full object-cover"
                            />
                        ) : values.existingImageUrl ? (
                            <img
                                src={values.existingImageUrl}
                                alt=""
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <ImageIcon size={28} className="text-graphite-300" aria-hidden="true" />
                        )}
                    </div>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={onFileChange}
                        className="block flex-1 text-sm text-graphite-700 file:mr-3 file:rounded-md file:border-0 file:bg-orange-500 file:text-white file:font-semibold file:px-4 file:py-2 file:cursor-pointer hover:file:bg-orange-600"
                    />
                </div>
            </div>

            {/* 2. Nome -------------------------------------------------- */}
            <FormField
                id="simple-name"
                label={t("admin_product_field_name", "Nome")}
                icon={Tag}
            >
                <input
                    id="simple-name"
                    type="text"
                    value={values.name}
                    onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
                    required
                    minLength={3}
                    maxLength={120}
                    className="flex-1 min-w-0 h-full bg-transparent text-sm text-graphite-900 placeholder:text-graphite-400 focus:outline-none pr-3"
                />
            </FormField>

            {/* 3. Descrição (Markdown) ---------------------------------- */}
            <div data-color-mode="light">
                <div className="flex items-baseline justify-between mb-1.5">
                    <label className="block text-sm font-medium text-graphite-700">
                        {t("admin_product_field_description", "Descrição")}
                    </label>
                    <span className="text-xs text-graphite-400">Markdown</span>
                </div>
                <div className="rounded-md border border-mnx-neutral-300 overflow-hidden focus-within:border-orange-500 focus-within:ring-3 focus-within:ring-orange-500/20 transition-colors duration-fast">
                    <MDEditor
                        value={values.description}
                        onChange={(val) =>
                            setValues((v) => ({ ...v, description: val ?? "" }))
                        }
                        height={280}
                        preview="edit"
                    />
                </div>
            </div>

            {/* 4 + 5. Tipo + Modo de doação ----------------------------- */}
            <div className="grid sm:grid-cols-2 gap-5">
                <FormField
                    id="simple-product-type"
                    label={t("admin_product_field_type", "Tipo")}
                    icon={Layers}
                >
                    <select
                        id="simple-product-type"
                        value={values.productType}
                        onChange={(e) =>
                            setValues((v) => ({
                                ...v,
                                productType: Number(e.target.value) as ProductTypeExtended,
                            }))
                        }
                        className="flex-1 min-w-0 h-full bg-transparent text-sm text-graphite-900 focus:outline-none pr-3 appearance-none cursor-pointer"
                    >
                        <option value={ProductTypeExtended.Physical}>
                            {t("admin_product_type_physical", "Físico")}
                        </option>
                        <option value={ProductTypeExtended.InfoProduct}>
                            {t("admin_product_type_infoproduct", "Infoproduto")}
                        </option>
                        <option value={ProductTypeExtended.Donation}>
                            {t("admin_product_type_donation", "Doação")}
                        </option>
                    </select>
                </FormField>

                <FormField
                    id="simple-donation-mode"
                    label={t("admin_product_field_donation_mode", "Modo de doação")}
                    icon={HandCoins}
                >
                    <select
                        id="simple-donation-mode"
                        value={values.donationMode}
                        disabled={donationModeDisabled}
                        onChange={(e) =>
                            setValues((v) => ({
                                ...v,
                                donationMode: Number(e.target.value) as DonationModeEnum,
                            }))
                        }
                        className="flex-1 min-w-0 h-full bg-transparent text-sm text-graphite-900 focus:outline-none pr-3 appearance-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <option value={DonationModeEnum.Fixed}>
                            {t("admin_product_donation_mode_fixed", "Fixo")}
                        </option>
                        <option value={DonationModeEnum.Free}>
                            {t("admin_product_donation_mode_free", "Livre")}
                        </option>
                    </select>
                </FormField>
            </div>

            {/* 6 + 7. Preço + Valor Mínimo ------------------------------ */}
            <div className="grid sm:grid-cols-2 gap-5">
                <FormField
                    id="simple-price"
                    label={t("admin_product_field_price", "Preço")}
                    icon={DollarSign}
                    suffix="R$"
                >
                    <input
                        id="simple-price"
                        type="number"
                        step="0.01"
                        min="0"
                        value={values.price}
                        disabled={priceDisabled}
                        onChange={(e) =>
                            setValues((v) => ({ ...v, price: Number(e.target.value) }))
                        }
                        required={!priceDisabled}
                        className="flex-1 min-w-0 h-full bg-transparent text-sm text-graphite-900 mnx-num focus:outline-none pr-3 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                </FormField>

                <FormField
                    id="simple-min-donation"
                    label={t("admin_product_field_minimum_donation_amount", "Valor mínimo")}
                    icon={DollarSign}
                    suffix="R$"
                >
                    <input
                        id="simple-min-donation"
                        type="number"
                        step="0.01"
                        min="0"
                        value={values.minimumDonationAmount}
                        disabled={minimumDonationDisabled}
                        onChange={(e) =>
                            setValues((v) => ({
                                ...v,
                                minimumDonationAmount: Number(e.target.value),
                            }))
                        }
                        className="flex-1 min-w-0 h-full bg-transparent text-sm text-graphite-900 mnx-num focus:outline-none pr-3 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                </FormField>
            </div>

            {/* 8 + 9. Desconto + Situação ------------------------------- */}
            <div className="grid sm:grid-cols-2 gap-5">
                <FormField
                    id="simple-discount"
                    label={t("admin_product_field_discount", "Desconto")}
                    icon={Percent}
                    suffix="%"
                >
                    <input
                        id="simple-discount"
                        type="number"
                        step="0.01"
                        min="0"
                        value={values.discount}
                        disabled={discountDisabled}
                        onChange={(e) =>
                            setValues((v) => ({ ...v, discount: Number(e.target.value) }))
                        }
                        className="flex-1 min-w-0 h-full bg-transparent text-sm text-graphite-900 mnx-num focus:outline-none pr-3 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                </FormField>

                <FormField
                    id="simple-status"
                    label={t("admin_product_field_status", "Situação")}
                    icon={Layers}
                >
                    <select
                        id="simple-status"
                        value={values.status}
                        onChange={(e) =>
                            setValues((v) => ({
                                ...v,
                                status: Number(e.target.value) as ProductStatusEnum,
                            }))
                        }
                        className="flex-1 min-w-0 h-full bg-transparent text-sm text-graphite-900 focus:outline-none pr-3 appearance-none cursor-pointer"
                    >
                        <option value={ProductStatusEnum.Active}>
                            {t("admin_product_status_active", "Ativo")}
                        </option>
                        <option value={ProductStatusEnum.Inactive}>
                            {t("admin_product_status_inactive", "Inativo")}
                        </option>
                        <option value={ProductStatusEnum.Expired}>
                            {t("admin_product_status_expired", "Expirado")}
                        </option>
                    </select>
                </FormField>
            </div>

            {/* Bottom action row --------------------------------------- */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-mnx-neutral-100">
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={submitting}
                    className="inline-flex h-10 items-center gap-2 px-4 rounded-md border border-mnx-neutral-300 text-sm font-semibold text-graphite-700 hover:border-graphite-900 hover:bg-mnx-neutral-100 transition-colors duration-fast disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <ArrowLeft size={16} aria-hidden="true" />
                    {t("back_button", "Voltar")}
                </button>
                <button
                    type="submit"
                    disabled={submitting}
                    className="cta-primary inline-flex h-10 items-center gap-2 px-5 rounded-md bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold shadow-glow-md transition-colors duration-fast disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:bg-orange-500"
                >
                    {submitting ? (
                        t("loading", "Carregando...")
                    ) : (
                        <>
                            <Save size={16} aria-hidden="true" />
                            {t("save_button", "Salvar")}
                        </>
                    )}
                </button>
            </div>
        </form>
    );
}
