import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import OrderContext from "../../Contexts/Order/OrderContext";
import IOrderProvider from "../../DTO/Contexts/IOrderProvider";
import PixQrView from "../StorefrontPage/PixQrView";

interface PixPaymentFormProps {
    productSlug: string;
    networkSlug?: string;
    sellerSlug?: string;
    setMessageError: (msg: string) => void;
    setMessageSuccess: (msg: string) => void;
}

export default function PixPaymentForm(props: PixPaymentFormProps) {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const orderContext = useContext<IOrderProvider>(OrderContext);
    const [cpf, setCpf] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [showQrCode, setShowQrCode] = useState<boolean>(false);

    const handleSubmit = async () => {
        if (!cpf || cpf.trim().length < 11) {
            props.setMessageError(t('cpf_invalid'));
            return;
        }
        setLoading(true);
        const result = await orderContext.createPixPayment(props.productSlug, cpf, "", props.networkSlug, props.sellerSlug);
        setLoading(false);
        if (result.sucesso) {
            setShowQrCode(true);
        } else {
            props.setMessageError(result.mensagemErro || t('payment_error'));
        }
    };

    if (showQrCode && orderContext.pixPaymentResult?.qrCode) {
        const qr = orderContext.pixPaymentResult.qrCode;
        return (
            <div className="text-center p-4">
                <h5 className="mb-3">{t('pix_payment_title')}</h5>
                <PixQrView
                    invoiceId={qr.invoiceId}
                    brCode={qr.brCode}
                    brCodeBase64={qr.brCodeBase64}
                    expiredAt={qr.expiredAt}
                    onPaid={() => {
                        props.setMessageSuccess(t('payment_success'));
                        navigate('/checkout/success');
                    }}
                    onError={(msg) => {
                        props.setMessageError(msg || t('payment_error'));
                        setShowQrCode(false);
                    }}
                />
            </div>
        );
    }

    return (
        <div className="p-3">
            <div className="mb-3">
                <label className="form-label">{t('cpf_label')}</label>
                <input
                    type="text"
                    className="form-control"
                    placeholder={t('cpf_placeholder')}
                    value={cpf}
                    onChange={(e) => setCpf(e.target.value.replace(/\D/g, ''))}
                    maxLength={11}
                />
            </div>
            <button
                className="btn btn-primary w-100"
                onClick={handleSubmit}
                disabled={loading}
            >
                {loading ? t('processing') : t('continue_to_payment')}
            </button>
        </div>
    );
}
