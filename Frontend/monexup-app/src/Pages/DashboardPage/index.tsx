import { useContext, useState } from "react";
import AuthContext from "../../Contexts/Auth/AuthContext";
import Container from "react-bootstrap/esm/Container";
import Row from "react-bootstrap/esm/Row";
import Col from "react-bootstrap/esm/Col";
import Card from "react-bootstrap/esm/Card";
import Alert from 'react-bootstrap/Alert';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWarning, faPlus, faBurn, faFire, faSearch, faDollar, faClock, faBoltLightning, faLock, faFileUpload, faCalendar, faCalendarAlt, faFileWord, faBoxOpen, faSign, faLockOpen, faUserDoctor, faChartLine, faChartPie, faCoins, faArrowRight, faUserGroup, faBox, faCog, faCogs, faUserCog, faList, faUser } from '@fortawesome/free-solid-svg-icons';
import Button from "react-bootstrap/esm/Button";
import { useNavigate } from "react-router-dom";
import { faBitcoin, faOpencart } from "@fortawesome/free-brands-svg-icons";
import CardHeader from "react-bootstrap/esm/CardHeader";
import CardTitle from "react-bootstrap/esm/CardTitle";
import CardBody from "react-bootstrap/esm/CardBody";
import CardText from "react-bootstrap/esm/CardText";
import Table from "react-bootstrap/esm/Table";
import ListGroup from 'react-bootstrap/ListGroup';
import Badge from 'react-bootstrap/Badge';
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import NetworkContext from "../../Contexts/Network/NetworkContext";
import { UserRoleEnum } from "../../DTO/Enum/UserRoleEnum";



export default function DashboardPage() {

    const authContext = useContext(AuthContext);
    const networkContext = useContext(NetworkContext);

    let navigate = useNavigate();

    return (
        <>
            <Container>
                <Row>
                    <Col md={8}>
                        <div className="row row-cols-1 row-cols-md-2 justify-content-center row-cols-lg-3 py-4 g-4 counter-RANDOMID">
                            <div className="col">
                                <div className="card card-body shadow">
                                    <div className="d-inline-flex align-items-center" style={{ minHeight: "128px" }}>
                                        <div className="me-2">
                                            <div className="bg-light p-3 rounded-circle">
                                                <FontAwesomeIcon icon={faBox} fixedWidth size="2x" />
                                            </div>
                                        </div>
                                        <div>
                                            <span className="fw-bold display-5 mb-5">7</span>
                                            <p className="lead"><span><b>Sales</b></span> Done</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="col">
                                <div className="card card-body shadow">
                                    <div className="d-inline-flex align-items-center" style={{ minHeight: "128px" }}>
                                        <div className="me-2">
                                            <div className="bg-light p-3 rounded-circle">
                                                <FontAwesomeIcon icon={faUser} fixedWidth size="2x" />
                                            </div>
                                        </div>
                                        <div>
                                            <span className="fw-bold display-5 mb-5">6</span>
                                            <p className="lead"><b>Customers</b> Added</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="col">
                                <div className="card card-body shadow">
                                    <div className="d-inline-flex align-items-center" style={{ minHeight: "128px" }}>
                                        <div className="me-2">
                                            <div className="bg-light p-3 rounded-circle">
                                                <FontAwesomeIcon icon={faDollar} fixedWidth size="2x" />
                                            </div>
                                        </div>
                                        <div>
                                            <span className="fw-bold display-5 mb-5">15</span>
                                            <p className="lead"><b>Paid</b> invoices</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Col>
                    <Col md={4}>
                        <Card bg="danger" text="light">
                            <Card.Header>Current Balance</Card.Header>
                            <Card.Body style={{ textAlign: "center" }}>
                                <Card.Text>
                                    <p className="fw-bold display-5 text-right"><small>R$</small>1.239,57</p>
                                    <span>Next withdrawal avaliable in <strong>30/04/2025</strong></span>
                                </Card.Text>
                                <Button variant="danger">Sacar <FontAwesomeIcon icon={faArrowRight} fixedWidth /></Button>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
            <Container>
                <Row>
                    <Col md={8}>
                        <Tabs
                            defaultActiveKey="balance"
                            id="uncontrolled-tab-example"
                            className="mb-3"
                        >
                            <Tab eventKey="balance" title={
                                <>
                                    <FontAwesomeIcon icon={faDollar} fixedWidth />&nbsp;Balance
                                </>
                            }>
                                <Table striped bordered hover>
                                    <thead>
                                        <tr>
                                            <th>-</th>
                                            <th>Network</th>
                                            <th>Product</th>
                                            <th>Seller</th>
                                            <th style={{ textAlign: "right" }}>Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td><FontAwesomeIcon icon={faCalendar} fixedWidth /></td>
                                            <td colSpan={4} style={{ textAlign: "center" }}><strong>10/04/2025 (Quinta-feira)</strong></td>
                                        </tr>
                                        <tr>
                                            <td className="text-success"><FontAwesomeIcon icon={faDollar} fixedWidth /></td>
                                            <td>Rede Principal</td>
                                            <td>Doação 1 (10% de R$ 100,00)</td>
                                            <td>Rogêrio P.</td>
                                            <td style={{ textAlign: "right" }}>R$ 10,00</td>
                                        </tr>
                                        <tr>
                                            <td><FontAwesomeIcon icon={faCalendar} fixedWidth /></td>
                                            <td colSpan={4} style={{ textAlign: "center" }}><strong>11/04/2025 (Sexta-feira)</strong></td>
                                        </tr>
                                        <tr>
                                            <td className="text-success"><FontAwesomeIcon icon={faDollar} fixedWidth /></td>
                                            <td>Rede Principal</td>
                                            <td>Doação 2 (10% de R$ 200,00)</td>
                                            <td>Ana L. M. C.</td>
                                            <td style={{ textAlign: "right" }}>R$ 20,00</td>
                                        </tr>
                                        <tr>
                                            <td className="text-success"><FontAwesomeIcon icon={faDollar} fixedWidth /></td>
                                            <td>Rede Secundária</td>
                                            <td>Doação 3 (15% de R$ 100,00)</td>
                                            <td>Luiz H.</td>
                                            <td style={{ textAlign: "right" }}>R$ 15,00</td>
                                        </tr>
                                        <tr>
                                            <td><FontAwesomeIcon icon={faCalendar} fixedWidth /></td>
                                            <td colSpan={4} style={{ textAlign: "center" }}><strong>14/04/2025 (Segunda-feira)</strong></td>
                                        </tr>
                                        <tr>
                                            <td className="text-danger"><FontAwesomeIcon icon={faDollar} fixedWidth /></td>
                                            <td className="text-danger">Rede Principal</td>
                                            <td className="text-danger" colSpan={2}>-</td>
                                            <td className="text-danger" style={{ textAlign: "right" }}>-R$ 580,00</td>
                                        </tr>
                                        <tr>
                                            <td className="text-success"><FontAwesomeIcon icon={faDollar} fixedWidth /></td>
                                            <td>Rede Principal</td>
                                            <td>Doação 2 (10% de R$ 200,00)</td>
                                            <td>Ana L. M. C.</td>
                                            <td style={{ textAlign: "right" }}>R$ 20,00</td>
                                        </tr>
                                        <tr>
                                            <td><FontAwesomeIcon icon={faDollar} fixedWidth /></td>
                                            <td colSpan={3} style={{ textAlign: "right" }}><strong>Current Balance:</strong></td>
                                            <td style={{ textAlign: "right" }}><strong>R$ 1.239,57</strong></td>
                                        </tr>
                                    </tbody>
                                </Table>
                            </Tab>
                            <Tab eventKey="order" title="Orders" disabled>
                                Tab content for Profile
                            </Tab>
                        </Tabs>

                    </Col>
                    <Col md={4} className="py-4">
                        <ListGroup>
                            {networkContext.currentRole >= UserRoleEnum.NetworkManager &&
                                <>
                                    <ListGroup.Item variant="primary">
                                        <FontAwesomeIcon icon={faUserGroup} fixedWidth /> Networks
                                    </ListGroup.Item>
                                    <ListGroup.Item action onClick={() => {
                                        navigate("/admin/network");
                                    }}>
                                        <div className="ms-2 me-auto">
                                            <FontAwesomeIcon icon={faCog} fixedWidth /> Preferences
                                        </div>
                                    </ListGroup.Item>
                                    <ListGroup.Item action onClick={() => {
                                        navigate("/admin/team-structure");
                                    }}>
                                        <div className="ms-2 me-auto">
                                            <FontAwesomeIcon icon={faUserCog} fixedWidth /> Teams Structure
                                        </div>
                                    </ListGroup.Item>
                                    <ListGroup.Item action onClick={() => {
                                        navigate("/admin/teams");
                                    }}>
                                        <Badge bg="primary" pill style={{ float: "right" }}>7</Badge>
                                        <div className="ms-2 me-auto">
                                            <FontAwesomeIcon icon={faUserGroup} fixedWidth /> Teams
                                        </div>
                                    </ListGroup.Item>
                                </>
                            }
                            {networkContext.currentRole >= UserRoleEnum.Seller &&
                                <>
                                    <ListGroup.Item variant="primary">
                                        <FontAwesomeIcon icon={faBox} fixedWidth /> Finances
                                    </ListGroup.Item>
                                    <ListGroup.Item action onClick={() => {
                                        navigate("/admin/orders");
                                    }}>
                                        <Badge bg="primary" pill style={{ float: "right" }}>14</Badge>
                                        <div className="ms-2 me-auto">
                                            <FontAwesomeIcon icon={faList} fixedWidth /> List of Orders
                                        </div>
                                    </ListGroup.Item>
                                    <ListGroup.Item action onClick={() => {
                                        navigate("/admin/invoices");
                                    }}>
                                        <Badge bg="primary" pill style={{ float: "right" }}>37</Badge>
                                        <div className="ms-2 me-auto">
                                            <FontAwesomeIcon icon={faDollar} fixedWidth /> List of Invoices
                                        </div>
                                    </ListGroup.Item>
                                    <ListGroup.Item action onClick={() => {
                                        navigate("/admin/products");
                                    }}>
                                        <Badge bg="primary" pill style={{ float: "right" }}>14</Badge>
                                        <div className="ms-2 me-auto">
                                            <FontAwesomeIcon icon={faBox} fixedWidth /> List of Products
                                        </div>
                                    </ListGroup.Item>
                                </>
                            }
                        </ListGroup>
                    </Col>
                </Row>
            </Container>
        </>
    );

}