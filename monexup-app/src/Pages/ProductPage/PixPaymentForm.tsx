import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { PixPayment } from "proxypay-react";
import OrderContext from "../../Contexts/Order/OrderContext";
import IOrderProvider from "../../DTO/Contexts/IOrderProvider";

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
        const result = await orderContext.createPixPayment(props.productSlug, cpf, props.networkSlug, props.sellerSlug);
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
            <PixPayment
                customer={{ name: "", documentId: cpf, cellphone: "", email: "" }}
                items={[{ id: "1", description: "Payment", quantity: 1, unitPrice: 0, discount: 0 }]}
                onSuccess={() => {
                    props.setMessageSuccess(t('payment_success'));
                    navigate('/checkout/success');
                }}
                onError={(err: Error) => {
                    props.setMessageError(err.message || t('payment_error'));
                    setShowQrCode(false);
                }}
                pollInterval={5000}
            >
                <div className="text-center p-4">
                    <h5>{t('pix_payment_title')}</h5>
                    <button className="btn btn-success btn-lg">
                        {t('pay_with_pix')}
                    </button>
                </div>
            </PixPayment>
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
