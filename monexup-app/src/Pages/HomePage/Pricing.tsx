import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useNavigate } from "react-router-dom";
import Container from "react-bootstrap/esm/Container";
import Row from "react-bootstrap/esm/Row";
import Col from "react-bootstrap/esm/Col";
import { faBoltLightning, faLock, faFileUpload, faCalendarAlt, faFileWord, faBoxOpen, faLockOpen, faUserDoctor } from '@fortawesome/free-solid-svg-icons';
import { faBitcoin } from "@fortawesome/free-brands-svg-icons";
import Card from "react-bootstrap/esm/Card";
import CardHeader from "react-bootstrap/esm/CardHeader";
import CardTitle from "react-bootstrap/esm/CardTitle";
import CardBody from "react-bootstrap/esm/CardBody";
import CardText from "react-bootstrap/esm/CardText";
import Button from "react-bootstrap/esm/Button";
import { useTranslation } from "react-i18next";

export default function Pricing() { // Renomeado de Header para Pricing

    const { t } = useTranslation();
    let navigate = useNavigate();

    return (
        <section id="plans" className="mnx-section" style={{ background: 'var(--mnx-bg-page)' }}>
            <Container>
                <Row>
                    <Col md={12} className="text-center">
                        <h2 className="mnx-section-title">{t('home_pricing_title')}</h2>
                    </Col>
                </Row>
                <Row className="justify-content-center mt-4">
                    <Col lg={4} md={6} className="mb-4">
                        <div className="mnx-pricing-card">
                            <h4 className="fw-normal mb-3">{t('home_pricing_free_plan')}</h4>
                            <div className="mb-3">
                                <span className="display-5 fw-bold">{t('home_pricing_free_price')}</span>
                                <span className="text-muted">{t('home_pricing_per_month')}</span>
                            </div>
                            <ul className="list-unstyled mb-4" style={{ color: 'var(--mnx-text-secondary)' }}>
                                <li className="mb-2">{t('home_pricing_free_feature1')}</li>
                                <li className="mb-2">{t('home_pricing_free_feature2')}</li>
                                <li className="mb-2">{t('home_pricing_free_feature3')}</li>
                                <li className="mb-2">{t('home_pricing_free_feature4')}</li>
                            </ul>
                            <div className="d-grid">
                                <Button variant="outline-primary" size="lg" onClick={() => {
                                    navigate("/network");
                                }}>{t('home_pricing_free_button')}</Button>
                            </div>
                        </div>
                    </Col>
                    <Col lg={4} md={6} className="mb-4">
                        <div className="mnx-pricing-card featured">
                            <h4 className="fw-normal mb-3">{t('home_pricing_pro_plan')}</h4>
                            <div className="mb-3">
                                <span className="display-5 fw-bold">{t('home_pricing_pro_price')}</span>
                                <span className="text-muted">{t('home_pricing_per_month')}</span>
                            </div>
                            <ul className="list-unstyled mb-4" style={{ color: 'var(--mnx-text-secondary)' }}>
                                <li className="mb-2">{t('home_pricing_pro_feature1')}</li>
                                <li className="mb-2">{t('home_pricing_pro_feature2')}</li>
                                <li className="mb-2">{t('home_pricing_pro_feature3')}</li>
                                <li className="mb-2">{t('home_pricing_pro_feature4')}</li>
                            </ul>
                            <div className="d-grid">
                                <Button variant="primary" size="lg" onClick={() => {
                                    navigate("/monexup/pro");
                                }}>{t('home_pricing_coming_soon')}</Button>
                            </div>
                        </div>
                    </Col>
                    <Col lg={4} md={6} className="mb-4">
                        <div className="mnx-pricing-card">
                            <h4 className="fw-normal mb-3">{t('home_pricing_enterprise_plan')}</h4>
                            <div className="mb-3">
                                <span className="display-5 fw-bold">{t('home_pricing_enterprise_price')}</span>
                                <span className="text-muted">{t('home_pricing_per_month')}</span>
                            </div>
                            <ul className="list-unstyled mb-4" style={{ color: 'var(--mnx-text-secondary)' }}>
                                <li className="mb-2">{t('home_pricing_enterprise_feature1')}</li>
                                <li className="mb-2">{t('home_pricing_enterprise_feature2')}</li>
                                <li className="mb-2">{t('home_pricing_enterprise_feature3')}</li>
                                <li className="mb-2">{t('home_pricing_enterprise_feature4')}</li>
                            </ul>
                            <div className="d-grid">
                                <Button variant="primary" size="lg" onClick={() => {
                                    navigate("/monexup/pro");
                                }}>{t('home_pricing_coming_soon')}</Button>
                            </div>
                        </div>
                    </Col>
                </Row>
            </Container>
        </section>
    );
}