import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useNavigate } from "react-router-dom";
import Container from "react-bootstrap/esm/Container";
import Row from "react-bootstrap/esm/Row";
import Col from "react-bootstrap/esm/Col";
import { faBoltLightning, faLock, faFileUpload, faCalendarAlt, faFileWord, faBoxOpen, faLockOpen, faUserDoctor } from '@fortawesome/free-solid-svg-icons';
import { faBitcoin } from "@fortawesome/free-brands-svg-icons";
import { useTranslation } from "react-i18next";

export default function Features() { // Renamed component to Features to match filename, assuming Header was a typo

    const { t } = useTranslation();
    let navigate = useNavigate();

    return (
        <section className="mnx-section">
            <Container>
                <Row>
                    <Col md={12} className="text-center">
                        <h2 className="mnx-section-title">{t('home_features_title')}</h2>
                        <p className="mnx-section-subtitle">{t('home_features_subtitle')}</p>
                    </Col>
                </Row>

                <Row>
                    <Col md={4} className="mb-4">
                        <div className="mnx-feature-card">
                            <div className="feature-icon">
                                <FontAwesomeIcon icon={faBitcoin} />
                            </div>
                            <h4 className="my-3" dangerouslySetInnerHTML={{ __html: t('home_feature_product_catalog_title') }} />
                            <p>{t('home_feature_product_catalog_desc')}</p>
                        </div>
                    </Col>
                    <Col md={4} className="mb-4">
                        <div className="mnx-feature-card">
                            <div className="feature-icon">
                                <FontAwesomeIcon icon={faLock} />
                            </div>
                            <h4 className="my-3" dangerouslySetInnerHTML={{ __html: t('home_feature_multiple_networks_title') }} />
                            <p>{t('home_feature_multiple_networks_desc')}</p>
                        </div>
                    </Col>
                    <Col md={4} className="mb-4">
                        <div className="mnx-feature-card">
                            <div className="feature-icon">
                                <FontAwesomeIcon icon={faBoltLightning} />
                            </div>
                            <h4 className="my-3" dangerouslySetInnerHTML={{ __html: t('home_feature_products_services_title') }} />
                            <p>{t('home_feature_products_services_desc')}</p>
                        </div>
                    </Col>
                    <Col md={4} className="mb-4">
                        <div className="mnx-feature-card">
                            <div className="feature-icon">
                                <FontAwesomeIcon icon={faFileUpload} />
                            </div>
                            <h4 className="my-3" dangerouslySetInnerHTML={{ __html: t('home_feature_team_management_title') }} />
                            <p>{t('home_feature_team_management_desc')}</p>
                        </div>
                    </Col>
                    <Col md={4} className="mb-4">
                        <div className="mnx-feature-card">
                            <div className="feature-icon">
                                <FontAwesomeIcon icon={faCalendarAlt} />
                            </div>
                            <h4 className="my-3">{t('home_feature_admin_panel_title')}</h4>
                            <p>{t('home_feature_admin_panel_desc')}</p>
                        </div>
                    </Col>
                    <Col md={4} className="mb-4">
                        <div className="mnx-feature-card">
                            <div className="feature-icon">
                                <FontAwesomeIcon icon={faFileWord} />
                            </div>
                            <h4 className="my-3">{t('home_feature_reports_commissions_title')}</h4>
                            <p>{t('home_feature_reports_commissions_desc')}</p>
                        </div>
                    </Col>
                    <Col md={4} className="mb-4">
                        <div className="mnx-feature-card">
                            <div className="feature-icon">
                                <FontAwesomeIcon icon={faLockOpen} />
                            </div>
                            <h4 className="my-3">{t('home_feature_responsive_interface_title')}</h4>
                            <p>{t('home_feature_responsive_interface_desc')}</p>
                        </div>
                    </Col>
                    <Col md={4} className="mb-4">
                        <div className="mnx-feature-card">
                            <div className="feature-icon">
                                <FontAwesomeIcon icon={faUserDoctor} />
                            </div>
                            <h4 className="my-3">{t('home_feature_interactive_network_tree_title')}</h4>
                            <p>{t('home_feature_interactive_network_tree_desc')}</p>
                        </div>
                    </Col>
                    <Col md={4} className="mb-4">
                        <div className="mnx-feature-card">
                            <div className="feature-icon">
                                <FontAwesomeIcon icon={faBoxOpen} />
                            </div>
                            <h4 className="my-3">{t('home_feature_security_transparency_title')}</h4>
                            <p>{t('home_feature_security_transparency_desc')}</p>
                        </div>
                    </Col>
                </Row>
            </Container>
        </section>
    );
}