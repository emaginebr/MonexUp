import Col from "react-bootstrap/esm/Col";
import Container from "react-bootstrap/esm/Container";
import Row from "react-bootstrap/esm/Row";
import Nav from 'react-bootstrap/Nav';
import Card from 'react-bootstrap/Card';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight, faCalendar, faCreditCard, faLock, faUser } from "@fortawesome/free-solid-svg-icons";
import Button from "react-bootstrap/esm/Button";

import { CheckoutProvider, Elements, EmbeddedCheckout, EmbeddedCheckoutProvider, PaymentElement } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import CheckoutForm from "./CheckoutForm";
import { useContext, useEffect } from "react";
import OrderContext from "../../Contexts/Order/OrderContext";

const stripePromise = loadStripe('pk_test_51QkuslD37qwDaRRTa9aljJbNC73hIl0kznGiY5d8kHrvxtNrbyg3YxVufK3KQZeLLTjK6UNVeulQ74JUz0Nda4ZR00vo6t2EML');

interface ProductPaymentParam {
    productSlug: string;
}

export default function ProductPayment(param: ProductPaymentParam) {

    const orderContext = useContext(OrderContext);

    /*
    const fetchClientSecret = () => {
        return fetch('/create-checkout-session', {method: 'POST'})
          .then((response) => response.json())
          .then((json) => json.checkoutSessionClientSecret)
    };
    */
    const fetchClientSecret = async () => {
        let ret = await orderContext.createSubscription(param.productSlug);
        if (ret.sucesso) {
            return ret.clientSecret;
        }
        else {
            alert(ret.mensagemErro);
            return "";
        }
    };

    return (
        <>
            <EmbeddedCheckoutProvider stripe={stripePromise} options={{ fetchClientSecret }}>
                <EmbeddedCheckout />
            </EmbeddedCheckoutProvider>

            {/*
            <Nav variant="pills" defaultActiveKey="credito" className="py-4">
                <Nav.Item>
                    <Nav.Link eventKey="credito">
                        Cartão de Crédito
                    </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                    <Nav.Link eventKey="boleto">
                        Boleto Bancário
                    </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                    <Nav.Link eventKey="pix">
                        PIX
                    </Nav.Link>
                </Nav.Item>
            </Nav>
            <Card>
                <Card.Header>
                    <h3 className="text-center">Credit Card</h3>
                </Card.Header>
                <Card.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Credit Card Number:</Form.Label>
                            <InputGroup>
                                <InputGroup.Text><FontAwesomeIcon icon={faCreditCard} fixedWidth /></InputGroup.Text>
                                <Form.Control type="text" size="lg" placeholder="Your Credit Card Number" />
                            </InputGroup>
                        </Form.Group>
                        <Row>
                            <Col md={3}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Expire Date:</Form.Label>
                                    <InputGroup>
                                        <InputGroup.Text><FontAwesomeIcon icon={faCalendar} fixedWidth /></InputGroup.Text>
                                        <Form.Control type="text" size="lg" placeholder="MM/YYYY" />
                                    </InputGroup>
                                </Form.Group>
                            </Col>
                            <Col md={3}>
                                <Form.Group className="mb-3">
                                    <Form.Label>CCV:</Form.Label>
                                    <InputGroup>
                                        <InputGroup.Text><FontAwesomeIcon icon={faLock} fixedWidth /></InputGroup.Text>
                                        <Form.Control type="text" size="lg" placeholder="000" />
                                    </InputGroup>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Name on Card:</Form.Label>
                                    <InputGroup>
                                        <InputGroup.Text><FontAwesomeIcon icon={faUser} fixedWidth /></InputGroup.Text>
                                        <Form.Control type="text" size="lg" placeholder="Your Name exact on credit card" />
                                    </InputGroup>
                                </Form.Group>
                            </Col>
                        </Row>

                        <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                            <Button variant="success" size="lg" onClick={() => {

                            }}>Pay <FontAwesomeIcon icon={faArrowRight} fixedWidth /></Button>
                        </div>
                    </Form>
                </Card.Body>
            </Card>
            */}
        </>
    );
}