import { useContext, useEffect, useState } from "react";
import Col from "react-bootstrap/esm/Col";
import Container from "react-bootstrap/esm/Container";
import Row from "react-bootstrap/esm/Row";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCancel } from '@fortawesome/free-solid-svg-icons';
import Table from "react-bootstrap/esm/Table";
import { Link, useNavigate, useParams } from "react-router-dom";
import InputGroup from 'react-bootstrap/InputGroup';
import Dropdown from 'react-bootstrap/Dropdown';
import Pagination from 'react-bootstrap/Pagination';
import NetworkContext from "../../Contexts/Network/NetworkContext";
import { MessageToastEnum } from "../../DTO/Enum/MessageToastEnum";
import MessageToast from "../../Components/MessageToast";
import { UserRoleEnum } from "../../DTO/Enum/UserRoleEnum";
import AuthContext from "../../Contexts/Auth/AuthContext";
import OrderInfo from "../../DTO/Domain/OrderInfo";
import Moment from 'react-moment';
import InvoiceContext from "../../Contexts/Invoice/InvoiceContext";
import { InvoiceStatusEnum } from "../../DTO/Enum/InvoiceStatusEnum";

export default function InvoiceSearchPage() {


    let navigate = useNavigate();

    const authContext = useContext(AuthContext);
    const networkContext = useContext(NetworkContext);
    const invoiceContext = useContext(InvoiceContext);

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

    const showProducts = (order: OrderInfo) => {
        let ret: string = "";
        if (order.items) {
            order.items.map((item) => {
                if (item.product) {
                    ret = ret + item.product.name + " (" + item.quantity + "), ";
                }
            });
            if (ret.length > 0) {
                ret = ret.substring(0, ret.length - 2);
            }
            
        }
        if (ret.length == 0) {
            ret = "Unknow";
        }
        return ret;
    };

    const showTotal = (order: OrderInfo) => {
        let total: number = 0;
        if (order.items) {
            order.items.map((item) => {
                total += item.product.price * item.quantity;
            });
        }
        return total;
    };

    const searchInvoices = (pageNum: number) => {
        switch (networkContext.currentRole) {
            case UserRoleEnum.NetworkManager:
                invoiceContext.search(
                    networkContext.userNetwork.networkId, 
                    0, 
                    0, 
                    pageNum
                ).then((ret) => {
                    if (!ret.sucesso) {
                        throwError(ret.mensagemErro);
                    }
                });
                break;
            case UserRoleEnum.Seller:
                invoiceContext.search(
                    networkContext.userNetwork.networkId, 
                    0, 
                    authContext.sessionInfo?.userId, 
                    pageNum
                ).then((ret) => {
                    if (!ret.sucesso) {
                        throwError(ret.mensagemErro);
                    }
                });
                break;
            case UserRoleEnum.User:
                invoiceContext.search(
                    networkContext.userNetwork.networkId, 
                    authContext.sessionInfo?.userId,
                    0, 
                    pageNum
                ).then((ret) => {
                    if (!ret.sucesso) {
                        throwError(ret.mensagemErro);
                    }
                });
                break;
        }
    };

    const showStatus = (status: InvoiceStatusEnum) => {
        let retorno: string;
        switch (status) {
            case InvoiceStatusEnum.Draft:
                retorno = "Draft";
                break;
            case InvoiceStatusEnum.Open:
                retorno = "Open";
                break;
            case InvoiceStatusEnum.Paid:
                retorno = "Paid";
                break;
            case InvoiceStatusEnum.Cancelled:
                retorno = "Cancelled";
                break;
            case InvoiceStatusEnum.Lost:
                retorno = "Lost";
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
            searchInvoices(pageNumInt);
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
                                    <li className="breadcrumb-item active" aria-current="page">Invoice Search</li>
                                </ol>
                            </nav>
                        </h3>
                    </Col>
                    <Col md="6" style={{ textAlign: "right" }}>
                        <InputGroup className="pull-right">
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
                            {
                                invoiceContext.loadingSearch &&
                                <tr>
                                    <td colSpan={8}>
                                        <div className="d-flex justify-content-center">
                                            <div className="spinner-border" role="status">
                                                <span className="visually-hidden">Loading...</span>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            }
                            <tbody>
                                {!invoiceContext.loadingSearch && invoiceContext.searchResult?.invoices.map((invoice) => {
                                    return (
                                        <tr>
                                            <td>{showProducts(invoice.order)}</td>
                                            <td style={{ textAlign: "right" }}>R$ {showTotal(invoice.order)}</td>
                                            <td>{invoice.user?.name}</td>
                                            <td>{invoice.seller?.name}</td>
                                            <td><Moment format="DD/MM/YYYY" interval={0}>{invoice.dueDate}</Moment></td>
                                            <td><Moment format="DD/MM/YYYY" interval={0}>{invoice.paymentDate}</Moment></td>
                                            <td>{showStatus(invoice.status)}</td>
                                            <td>
                                                <Link to="/admin/orders">
                                                    <FontAwesomeIcon icon={faCancel} fixedWidth /> Suspend
                                                </Link>
                                            </td>
                                        </tr>
                                    );
                                })}

                            </tbody>
                        </Table>
                    </Col>
                </Row>
                {!invoiceContext.loadingSearch && invoiceContext.searchResult &&
                    <Row>
                        <Col md={12} className="text-center">
                            <Pagination className="justify-content-center">
                                <Pagination.First
                                    disabled={!(invoiceContext.searchResult?.pageNum > 1)}
                                    onClick={() => searchInvoices(1)} />
                                <Pagination.Prev
                                    disabled={!(invoiceContext.searchResult?.pageNum > 1)}
                                    onClick={() => searchInvoices(invoiceContext.searchResult?.pageNum - 1)} />
                                <Pagination.Ellipsis />

                                {invoiceContext.searchResult?.pageNum - 2 >= 1 &&
                                    <Pagination.Item
                                        onClick={() => searchInvoices(invoiceContext.searchResult?.pageNum - 2)}
                                    >{invoiceContext.searchResult?.pageNum - 2}</Pagination.Item>
                                }
                                {invoiceContext.searchResult?.pageNum - 1 >= 1 &&
                                    <Pagination.Item
                                        onClick={() => searchInvoices(invoiceContext.searchResult?.pageNum - 1)}
                                    >{invoiceContext.searchResult?.pageNum - 1}</Pagination.Item>
                                }
                                <Pagination.Item active>{invoiceContext.searchResult?.pageNum}</Pagination.Item>
                                {invoiceContext.searchResult?.pageNum + 1 <= invoiceContext.searchResult?.pageCount &&
                                    <Pagination.Item
                                        onClick={() => searchInvoices(invoiceContext.searchResult?.pageNum + 1)}
                                    >{invoiceContext.searchResult?.pageNum + 1}</Pagination.Item>
                                }
                                {invoiceContext.searchResult?.pageNum + 2 <= invoiceContext.searchResult?.pageCount &&
                                    <Pagination.Item
                                        onClick={() => searchInvoices(invoiceContext.searchResult?.pageNum + 2)}
                                    >{invoiceContext.searchResult?.pageNum + 2}</Pagination.Item>
                                }

                                <Pagination.Ellipsis />
                                <Pagination.Next
                                    disabled={!(invoiceContext.searchResult?.pageNum < invoiceContext.searchResult?.pageCount)}
                                    onClick={() => searchInvoices(invoiceContext.searchResult?.pageCount)}
                                />
                                <Pagination.Last
                                    disabled={!(invoiceContext.searchResult?.pageNum < invoiceContext.searchResult?.pageCount)}
                                    onClick={() => searchInvoices(invoiceContext.searchResult?.pageCount)} />
                            </Pagination>
                        </Col>
                    </Row>
                }
            </Container>
        </>
    );
}