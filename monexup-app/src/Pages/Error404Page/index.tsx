import Card from "react-bootstrap/esm/Card";
import CardBody from "react-bootstrap/esm/CardBody";
import Col from "react-bootstrap/esm/Col";
import Container from "react-bootstrap/esm/Container";
import Row from "react-bootstrap/esm/Row";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

export default function Error404Page() {

    const { t } = useTranslation();

    return (

        <div className="d-flex flex-row align-items-center justify-content-center" style={{ minHeight: 'calc(100vh - var(--mnx-navbar-height))' }}>
            <Container>
                <Row className="justify-content-center">
                    <Col md={6} className="text-center">
                        <span className="display-1 d-block fw-bold text-graphite">404</span>
                        <div className="mb-4 lead" style={{ color: 'var(--mnx-text-secondary)' }}>{t('error404_message')}</div>
                        <Link to="/" className="btn btn-primary">{t('error404_back_to_home')}</Link>
                    </Col>
                </Row>
            </Container>
        </div>
    );
}