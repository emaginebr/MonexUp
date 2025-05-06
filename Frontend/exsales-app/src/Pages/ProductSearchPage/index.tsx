import { useContext, useEffect, useState } from "react";
import Col from "react-bootstrap/esm/Col";
import Container from "react-bootstrap/esm/Container";
import Row from "react-bootstrap/esm/Row";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendar, faDollar, faEdit, faEnvelope, faPlus, faSearch, faTrash } from '@fortawesome/free-solid-svg-icons';
import Table from "react-bootstrap/esm/Table";
import { Link, useNavigate, useParams } from "react-router-dom";
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import Dropdown from 'react-bootstrap/Dropdown';
import Pagination from 'react-bootstrap/Pagination';
import Breadcrumb from 'react-bootstrap/Breadcrumb';
import NetworkContext from "../../Contexts/Network/NetworkContext";
import ProductContext from "../../Contexts/Product/ProductContext";
import { MessageToastEnum } from "../../DTO/Enum/MessageToastEnum";
import MessageToast from "../../Components/MessageToast";
import { ProductStatusEnum } from "../../DTO/Enum/ProductStatusEnum";

export default function ProductSearchPage() {


    let navigate = useNavigate();

    const networkContext = useContext(NetworkContext);
    const productContext = useContext(ProductContext);

    let { pageNum } = useParams();

    const [dialog, setDialog] = useState<MessageToastEnum>(MessageToastEnum.Error);
    const [showMessage, setShowMessage] = useState<boolean>(false);
    const [messageText, setMessageText] = useState<string>("");

    const throwError = (message: string) => {
        setDialog(MessageToastEnum.Error);
        setMessageText(message);
        setShowMessage(true);
    };
    const showSuccessMessage = (message: string) => {
        setDialog(MessageToastEnum.Success);
        setMessageText(message);
        setShowMessage(true);
    };

    const searchProducts = (pageNum: number) => {
        productContext.search(networkContext.userNetwork.networkId, "", pageNum).then((ret) => {
            if (!ret.sucesso) {
                throwError(ret.mensagemErro);
            }
        });
    };

    const showFrequency = (frequency: number) => {
        let retorno: string;
        switch (frequency) {
            case 0:
                retorno = "Just one time";
                break;
            case 7:
                retorno = "Weekly";
                break;
            case 30:
                retorno = "Monthly";
                break;
            case 60:
                retorno = "Bimonthly";
                break;
            case 90:
                retorno = "Quarterly";
                break;
            case 180:
                retorno = "Half-yearly";
                break;
            case 365:
                retorno = "Annually";
                break;
        }
        return retorno;
    };

    const showStatus = (status: ProductStatusEnum) => {
        let retorno: string;
        switch (status) {
            case ProductStatusEnum.Active:
                retorno = "Active";
                break;
            case ProductStatusEnum.Inactive:
                retorno = "Inactive";
                break;
            case ProductStatusEnum.Expired:
                retorno = "Expired";
                break;
        }
        return retorno;
    };

    useEffect(() => {
        if (networkContext.userNetwork) {
            let pageNumInt: number = parseInt(pageNum);
            if (!pageNumInt) {
                pageNumInt = 1;
            }
            searchProducts(pageNumInt);
        }
    }, []);

    return (
        <>
            <MessageToast
                dialog={dialog}
                showMessage={showMessage}
                messageText={messageText}
                onClose={() => setShowMessage(false)}
            ></MessageToast>
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
                                {
                                    productContext.loadingSearch &&
                                    <tr>
                                        <td colSpan={5}>
                                            <div className="d-flex justify-content-center">
                                                <div className="spinner-border" role="status">
                                                    <span className="visually-hidden">Loading...</span>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                }
                                {!productContext.loadingSearch && productContext.searchResult?.products.map((product) => {
                                    return (
                                        <tr>
                                            <td><Link to={"/admin/products/" + product.productId}>{product.name}</Link></td>
                                            <td>{showFrequency(product.frequency)}</td>
                                            <td style={{ textAlign: "right" }}>R$ {product.price}</td>
                                            <td>{showStatus(product.status)}</td>
                                            <td>
                                                <Link to={"/admin/products/" + product.productId}>
                                                    <FontAwesomeIcon icon={faEdit} fixedWidth />
                                                </Link>
                                                <Link to="/admin/products/new">
                                                    <FontAwesomeIcon icon={faTrash} fixedWidth />
                                                </Link>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </Table>
                    </Col>
                </Row>
                {!productContext.loadingSearch && productContext.searchResult &&
                    <Row>
                        <Col md={12} className="text-center">
                            <Pagination className="justify-content-center">
                                <Pagination.First
                                    disabled={!(productContext.searchResult?.pageNum > 1)}
                                    onClick={() => searchProducts(1)} />
                                <Pagination.Prev
                                    disabled={!(productContext.searchResult?.pageNum > 1)}
                                    onClick={() => searchProducts(productContext.searchResult?.pageNum - 1)} />
                                <Pagination.Ellipsis />

                                {productContext.searchResult?.pageNum - 2 > 1 &&
                                    <Pagination.Item
                                        onClick={() => searchProducts(productContext.searchResult?.pageNum - 2)}
                                    >{productContext.searchResult?.pageNum - 2}</Pagination.Item>
                                }
                                {productContext.searchResult?.pageNum - 1 > 1 &&
                                    <Pagination.Item
                                        onClick={() => searchProducts(productContext.searchResult?.pageNum - 1)}
                                    >{productContext.searchResult?.pageNum - 1}</Pagination.Item>
                                }
                                <Pagination.Item active>{productContext.searchResult?.pageNum}</Pagination.Item>
                                {productContext.searchResult?.pageNum + 1 <= productContext.searchResult?.pageCount &&
                                    <Pagination.Item
                                        onClick={() => searchProducts(productContext.searchResult?.pageNum + 1)}
                                    >{productContext.searchResult?.pageNum + 1}</Pagination.Item>
                                }
                                {productContext.searchResult?.pageNum + 2 <= productContext.searchResult?.pageCount &&
                                    <Pagination.Item
                                        onClick={() => searchProducts(productContext.searchResult?.pageNum + 2)}
                                    >{productContext.searchResult?.pageNum + 2}</Pagination.Item>
                                }

                                <Pagination.Ellipsis />
                                <Pagination.Next
                                    disabled={!(productContext.searchResult?.pageNum < productContext.searchResult?.pageCount)}
                                    onClick={() => searchProducts(productContext.searchResult?.pageCount)}
                                />
                                <Pagination.Last
                                    disabled={!(productContext.searchResult?.pageNum < productContext.searchResult?.pageCount)}
                                    onClick={() => searchProducts(productContext.searchResult?.pageCount)} />
                            </Pagination>
                        </Col>
                    </Row>
                }
            </Container>
        </>
    );
}