import { faBox, faDollar, faUser } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useTranslation } from "react-i18next";

export default function CountPart() {

    const { t } = useTranslation();

    return (
        <div className="row row-cols-1 row-cols-md-3 g-3 mb-3">
            <div className="col">
                <div className="mnx-stat-card">
                    <div className="d-flex align-items-center gap-3">
                        <div className="mnx-stat-card-icon orange">
                            <FontAwesomeIcon icon={faBox} />
                        </div>
                        <div>
                            <div className="mnx-stat-card-value">7</div>
                            <div className="mnx-stat-card-label">{t('dashboard_count_sales')} {t('dashboard_count_done')}</div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="col">
                <div className="mnx-stat-card">
                    <div className="d-flex align-items-center gap-3">
                        <div className="mnx-stat-card-icon blue">
                            <FontAwesomeIcon icon={faUser} />
                        </div>
                        <div>
                            <div className="mnx-stat-card-value">6</div>
                            <div className="mnx-stat-card-label">{t('dashboard_count_customers')} {t('dashboard_count_added')}</div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="col">
                <div className="mnx-stat-card">
                    <div className="d-flex align-items-center gap-3">
                        <div className="mnx-stat-card-icon green">
                            <FontAwesomeIcon icon={faDollar} />
                        </div>
                        <div>
                            <div className="mnx-stat-card-value">15</div>
                            <div className="mnx-stat-card-label">{t('dashboard_count_paid')} {t('dashboard_count_invoices')}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}