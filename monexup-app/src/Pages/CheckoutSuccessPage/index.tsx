import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

export default function CheckoutSuccessPage() {
    const { t } = useTranslation();
    const navigate = useNavigate();

    return (
        <div className="container text-center mt-5">
            <div className="card p-5">
                <i className="fas fa-check-circle text-success" style={{ fontSize: '4rem' }}></i>
                <h2 className="mt-3">{t('checkout_success_title')}</h2>
                <p className="text-muted">{t('checkout_success_message')}</p>
                <button className="btn btn-primary mt-3" onClick={() => navigate('/admin/dashboard')}>
                    {t('back_to_dashboard')}
                </button>
            </div>
        </div>
    );
}
