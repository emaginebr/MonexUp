import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBoltLightning, faTextWidth, faWarning } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from "react-router-dom";
import Button from "react-bootstrap/esm/Button";
import { useTranslation, Trans } from "react-i18next";

export default function Header() {

    const { t } = useTranslation();
    let navigate = useNavigate();

    return (
        <section className="mnx-hero">
            <div className="container">
                <div className="row justify-content-center mb-4">
                    <div className="col-xl-8">
                        <h1 className="display-4 fw-bold mb-4">
                            <Trans i18nKey="header_main_title">
                                Connect. Sell. Grow. Be part, here your sales boost the success of <span className="text-accent">everyone</span>.
                            </Trans>
                        </h1>
                    </div>
                </div>
                <div className="row justify-content-center mb-4">
                    <div className="col-xl-6 lh-lg">
                        <p className="lead">{t('header_subtitle')}</p>
                    </div>
                </div>
                <div className="row justify-content-center">
                    <div className="col-auto">
                        <Button variant="primary" size="lg" className="px-5 py-3" onClick={() => {
                            navigate("/new-seller");
                        }}><FontAwesomeIcon icon={faBoltLightning} fixedWidth /> {t('be_a_representative')}</Button>
                    </div>
                </div>
            </div>
        </section>
    );
}