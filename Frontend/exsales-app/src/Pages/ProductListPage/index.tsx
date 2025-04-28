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

export default function ProductListPage() {


    let navigate = useNavigate();

    return (
        <>
            <Container>
                <Row>
                    <Col md="6">
                        <h3>
                            <nav aria-label="breadcrumb">
                                <ol className="breadcrumb">
                                    <li className="breadcrumb-item"><Link to="/admin/dashboard">Minha Rede</Link></li>
                                    <li className="breadcrumb-item active" aria-current="page">Products List</li>
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
                            <Button variant="success" onClick={() => {
                                navigate("/admin/products/new");
                            }}><FontAwesomeIcon icon={faPlus} fixedWidth />&nbsp;New Product</Button>
                        </InputGroup>
                    </Col>
                </Row>
                <Row className="py-4">
                    <Col md="12">
                        <Table striped bordered hover>
                            <thead>
                                <tr>
                                    <th>Product</th>
                                    <th>Frequency</th>
                                    <th style={{ textAlign: "right" }}>Price</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td><Link to="/admin/products/new">Doação Básica / Mensal</Link></td>
                                    <td>Mensal</td>
                                    <td style={{ textAlign: "right" }}>R$ 29,90</td>
                                    <td>Active</td>
                                    <td>
                                        <Link to="/admin/products/new">
                                            <FontAwesomeIcon icon={faEdit} fixedWidth />
                                        </Link>
                                        <Link to="/admin/products/new">
                                            <FontAwesomeIcon icon={faTrash} fixedWidth />
                                        </Link>
                                    </td>
                                </tr>
                                <tr>
                                    <td><Link to="/admin/products/new">Doação Avançada / Mensal</Link></td>
                                    <td>Mensal</td>
                                    <td style={{ textAlign: "right" }}>R$ 99,90</td>
                                    <td>Active</td>
                                    <td>
                                        <Link to="/admin/products/new">
                                            <FontAwesomeIcon icon={faEdit} fixedWidth />
                                        </Link>
                                        <Link to="/admin/products/new">
                                            <FontAwesomeIcon icon={faTrash} fixedWidth />
                                        </Link>
                                    </td>
                                </tr>
                                <tr>
                                    <td><Link to="/admin/products/new">Doação Suprema / Mensal</Link></td>
                                    <td>Mensal</td>
                                    <td style={{ textAlign: "right" }}>R$ 199,90</td>
                                    <td>Active</td>
                                    <td>
                                        <Link to="/admin/products/new">
                                            <FontAwesomeIcon icon={faEdit} fixedWidth />
                                        </Link>
                                        <Link to="/admin/products/new">
                                            <FontAwesomeIcon icon={faTrash} fixedWidth />
                                        </Link>
                                    </td>
                                </tr>
                                <tr>
                                    <td><Link to="/admin/products/new">Doação Básica / Trimestral</Link></td>
                                    <td>Trimestral</td>
                                    <td style={{ textAlign: "right" }}>R$ 89,70</td>
                                    <td>Active</td>
                                    <td>
                                        <Link to="/admin/products/new">
                                            <FontAwesomeIcon icon={faEdit} fixedWidth />
                                        </Link>
                                        <Link to="/admin/products/new">
                                            <FontAwesomeIcon icon={faTrash} fixedWidth />
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