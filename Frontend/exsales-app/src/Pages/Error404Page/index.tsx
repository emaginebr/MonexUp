import Card from "react-bootstrap/esm/Card";
import CardBody from "react-bootstrap/esm/CardBody";
import Col from "react-bootstrap/esm/Col";
import Container from "react-bootstrap/esm/Container";
import Row from "react-bootstrap/esm/Row";
import { Link, useNavigate } from "react-router-dom";

export default function Error404Page() {

    let navigate = useNavigate();

    return (

        <div className="page-wrap d-flex flex-row align-items-center py-5">
            <Container>
                <Row className="justify-content-center">
                    <Col md={6} className="text-center">
                        <Card>
                            <CardBody>
                                <span className="display-1 d-block">404</span>
                                <div className="mb-4 lead">The page you are looking for was not found.</div>
                                <Link to="/" className="btn btn-link">Back to Home</Link>
                            </CardBody>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </div>
    );
}