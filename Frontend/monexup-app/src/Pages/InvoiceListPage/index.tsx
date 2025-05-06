import { useContext, useEffect, useState } from "react";
import Col from "react-bootstrap/esm/Col";
import Container from "react-bootstrap/esm/Container";
import Row from "react-bootstrap/esm/Row";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendar, faDollar, faEdit, faEnvelope, faPlus, faSearch, faTrash } from '@fortawesome/free-solid-svg-icons';
import Table from "react-bootstrap/esm/Table";
import { Link, useNavigate } from "react-router-dom";
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import Dropdown from 'react-bootstrap/Dropdown';
import Pagination from 'react-bootstrap/Pagination';
import Breadcrumb from 'react-bootstrap/Breadcrumb';

export default function InvoiceListPage() {


    let navigate = useNavigate();

    return (
        <>
            <Container>
                <Row>
                    <Col md="6">
                        <h3>
                            <nav aria-label="breadcrumb">
                                <ol className="breadcrumb">
                                    <li className="breadcrumb-item"><Link to="/minha-rede/dashboard">Minha Rede</Link></li>
                                    <li className="breadcrumb-item active" aria-current="page">Invoices List</li>
                                </ol>
                            </nav>
                        </h3>
                    </Col>
                    <Col md="6" style={{ textAlign: "right" }}>
                        <InputGroup className="pull-right">
                            <Form.Control
                                placeholder="Search for Keyword"
                                aria-label="Search for Keyword"
                            />
                            <Button variant="outline-secondary"><FontAwesomeIcon icon={faSearch} fixedWidth /></Button>
                            <Dropdown>
                                <Dropdown.Toggle variant="danger" id="dropdown-basic">
                                    Filter by: All Status
                                </Dropdown.Toggle>

                                <Dropdown.Menu>
                                    <Dropdown.Item href="#/action-1">Action</Dropdown.Item>
                                    <Dropdown.Item href="#/action-2">Another action</Dropdown.Item>
                                    <Dropdown.Item href="#/action-3">Something else</Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown>
                        </InputGroup>
                    </Col>
                </Row>
                <Row className="py-4">
                    <Col md="12">
                        <Table striped bordered hover>
                            <thead>
                                <tr>
                                    <th>Product</th>
                                    <th style={{ textAlign: "right" }}>Price</th>
                                    <th>Buyer</th>
                                    <th>Seller</th>
                                    <th>Due Date</th>
                                    <th>Paid Date</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>Doação Básica</td>
                                    <td style={{ textAlign: "right" }}>R$ 29,90</td>
                                    <td>Roberval Pereira</td>
                                    <td>Rodrigo L.</td>
                                    <td>03/03/2025</td>
                                    <td>03/03/2025</td>
                                    <td>Paid</td>
                                    <td>
                                        <Link to="/minha-rede/orders">
                                            <FontAwesomeIcon icon={faEdit} fixedWidth />
                                        </Link>
                                    </td>
                                </tr>
                                <tr>
                                    <td>Doação Básica</td>
                                    <td style={{ textAlign: "right" }}>R$ 29,90</td>
                                    <td>Roberval Pereira</td>
                                    <td>Rodrigo L.</td>
                                    <td>03/04/2025</td>
                                    <td>&nbsp;</td>
                                    <td>Outstanding</td>
                                    <td>
                                        <Link to="/minha-rede/orders">
                                            <FontAwesomeIcon icon={faEdit} fixedWidth />
                                        </Link>
                                    </td>
                                </tr>
                            </tbody>
                        </Table>
                    </Col>
                </Row>
                <Row>
                    <Col md={12} className="text-center">
                        <Pagination className="justify-content-center">
                            <Pagination.First />
                            <Pagination.Prev />
                            <Pagination.Item>{1}</Pagination.Item>
                            <Pagination.Ellipsis />

                            <Pagination.Item>{10}</Pagination.Item>
                            <Pagination.Item>{11}</Pagination.Item>
                            <Pagination.Item active>{12}</Pagination.Item>
                            <Pagination.Item>{13}</Pagination.Item>
                            <Pagination.Item disabled>{14}</Pagination.Item>

                            <Pagination.Ellipsis />
                            <Pagination.Item>{20}</Pagination.Item>
                            <Pagination.Next />
                            <Pagination.Last />
                        </Pagination>
                    </Col>
                </Row>
            </Container>
        </>
    );
}