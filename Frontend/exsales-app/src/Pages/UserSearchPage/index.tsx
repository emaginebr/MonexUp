import { useContext, useEffect, useState } from "react";
import Col from "react-bootstrap/esm/Col";
import Container from "react-bootstrap/esm/Container";
import Row from "react-bootstrap/esm/Row";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendar, faCheck, faCheckCircle, faClose, faCross, faDollar, faEdit, faEnvelope, faPlus, faSearch, faTrash } from '@fortawesome/free-solid-svg-icons';
import Table from "react-bootstrap/esm/Table";
import { Link, useNavigate, useParams } from "react-router-dom";
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import Dropdown from 'react-bootstrap/Dropdown';
import Pagination from 'react-bootstrap/Pagination';
import MessageToast from "../../Components/MessageToast";
import { MessageToastEnum } from "../../DTO/Enum/MessageToastEnum";
import NetworkContext from "../../Contexts/Network/NetworkContext";
import UserContext from "../../Contexts/User/UserContext";
import { UserRoleEnum } from "../../DTO/Enum/UserRoleEnum";
import { UserNetworkStatusEnum } from "../../DTO/Enum/UserNetworkStatusEnum";

export default function UserSearchPage() {


    let navigate = useNavigate();

    const userContext = useContext(UserContext);
    const networkContext = useContext(NetworkContext);

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

    const showRole = (role: UserRoleEnum) => {
        let ret: string;
        switch (role) {
            case UserRoleEnum.NoRole:
                ret = "No Role"
                break;
            case UserRoleEnum.User:
                ret = "User"
                break;
            case UserRoleEnum.Seller:
                ret = "Seller"
                break;
            case UserRoleEnum.NetworkManager:
                ret = "Network Manager"
                break;
            case UserRoleEnum.Administrator:
                ret = "Administrator"
                break;
        }
        return ret;
    };

    const showStatus = (status: UserNetworkStatusEnum) => {
        let ret: string;
        switch (status) {
            case UserNetworkStatusEnum.Active:
                ret = "Active"
                break;
            case UserNetworkStatusEnum.Blocked:
                ret = "Blocked"
                break;
            case UserNetworkStatusEnum.Inactive:
                ret = "Inactive"
                break;
            case UserNetworkStatusEnum.WaitForApproval:
                ret = "Wait For Approval"
                break;
        }
        return ret;
    };

    const searchUsers = (pageNum: number) => {
        userContext.search(networkContext.userNetwork.networkId, "", pageNum, null).then((ret) => {
            if (!ret.sucesso) {
                throwError(ret.mensagemErro);
            }
        });
    };

    useEffect(() => {
        if (networkContext.userNetwork) {
            let pageNumInt: number = parseInt(pageNum);
            if (!pageNumInt) {
                pageNumInt = 1;
            }
            searchUsers(pageNumInt);
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
                                    <li className="breadcrumb-item active" aria-current="page">Network Team</li>
                                </ol>
                            </nav>
                        </h3>
                    </Col>
                    <Col md="6" style={{ textAlign: "right" }}>
                        <InputGroup className="pull-right">
                            <Form.Control
                                placeholder="Search for Seller"
                                aria-label="Search for Seller"
                            />
                            <Button variant="outline-secondary"><FontAwesomeIcon icon={faSearch} fixedWidth /></Button>
                            <Dropdown>
                                <Dropdown.Toggle variant="danger" id="dropdown-basic">
                                    Filter by: All Profiles
                                </Dropdown.Toggle>

                                <Dropdown.Menu>
                                    <Dropdown.Item href="#/action-1">Action</Dropdown.Item>
                                    <Dropdown.Item href="#/action-2">Another action</Dropdown.Item>
                                    <Dropdown.Item href="#/action-3">Something else</Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown>
                            <Button variant="primary" disabled><FontAwesomeIcon icon={faEnvelope} fixedWidth /> Invite</Button>
                        </InputGroup>
                    </Col>
                </Row>
                <Row className="py-4">
                    <Col md="12">
                        <Table striped bordered hover>
                            <thead>
                                <tr>
                                    <th>Seller</th>
                                    <th>Profile</th>
                                    <th>Role</th>
                                    <th style={{ textAlign: "right" }}>Commission (%)</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    userContext.loadingSearch &&
                                    <tr>
                                        <td colSpan={6}>
                                            <div className="d-flex justify-content-center">
                                                <div className="spinner-border" role="status">
                                                    <span className="visually-hidden">Loading...</span>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                }
                                {!userContext.loadingSearch && userContext.searchResult?.users.map((user) => {
                                    return (
                                        <tr>
                                            <td>{user.name}</td>
                                            <td>{user.profile}</td>
                                            <td>{showRole(user.role)}</td>
                                            <td style={{ textAlign: "right" }}>{user.commission}%</td>
                                            <td>{showStatus(user.status)}</td>
                                            <td>
                                                <a href="#" className="text-success">
                                                    <FontAwesomeIcon icon={faCheck} fixedWidth /> Approve
                                                </a>
                                                <a href="#" className="text-danger">
                                                    <FontAwesomeIcon icon={faClose} fixedWidth /> Reprove
                                                </a>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </Table>
                    </Col>
                </Row>
                {!userContext.loadingSearch && userContext.searchResult &&
                    <Row>
                        <Col md={12} className="text-center">
                            <Pagination className="justify-content-center">
                                <Pagination.First
                                    disabled={!(userContext.searchResult?.pageNum > 1)}
                                    onClick={() => searchUsers(1)} />
                                <Pagination.Prev
                                    disabled={!(userContext.searchResult?.pageNum > 1)}
                                    onClick={() => searchUsers(userContext.searchResult?.pageNum - 1)} />
                                <Pagination.Ellipsis />

                                {userContext.searchResult?.pageNum - 2 > 1 &&
                                    <Pagination.Item
                                        onClick={() => searchUsers(userContext.searchResult?.pageNum - 2)}
                                        >{userContext.searchResult?.pageNum - 2}</Pagination.Item>
                                }
                                {userContext.searchResult?.pageNum - 1 > 1 &&
                                    <Pagination.Item
                                        onClick={() => searchUsers(userContext.searchResult?.pageNum - 1)}
                                        >{userContext.searchResult?.pageNum - 1}</Pagination.Item>
                                }
                                <Pagination.Item active>{userContext.searchResult?.pageNum}</Pagination.Item>
                                {userContext.searchResult?.pageNum + 1 <= userContext.searchResult?.pageCount &&
                                    <Pagination.Item
                                        onClick={() => searchUsers(userContext.searchResult?.pageNum + 1)}
                                        >{userContext.searchResult?.pageNum + 1}</Pagination.Item>
                                }
                                {userContext.searchResult?.pageNum + 2 <= userContext.searchResult?.pageCount &&
                                    <Pagination.Item
                                        onClick={() => searchUsers(userContext.searchResult?.pageNum + 2)}
                                        >{userContext.searchResult?.pageNum + 2}</Pagination.Item>
                                }

                                <Pagination.Ellipsis />
                                <Pagination.Next
                                    disabled={!(userContext.searchResult?.pageNum < userContext.searchResult?.pageCount)}
                                    onClick={() => searchUsers(userContext.searchResult?.pageCount)}
                                />
                                <Pagination.Last
                                    disabled={!(userContext.searchResult?.pageNum < userContext.searchResult?.pageCount)}
                                    onClick={() => searchUsers(userContext.searchResult?.pageCount)} />
                            </Pagination>
                        </Col>
                    </Row>
                }
            </Container>
        </>
    );
}