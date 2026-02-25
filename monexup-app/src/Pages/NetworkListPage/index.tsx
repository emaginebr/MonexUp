import { useContext, useEffect, useState } from "react";
import Col from "react-bootstrap/esm/Col";
import Container from "react-bootstrap/esm/Container";
import Row from "react-bootstrap/esm/Row";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendar, faDollar, faSearch, faTrash } from '@fortawesome/free-solid-svg-icons';
import Table from "react-bootstrap/esm/Table";
import { Link, useNavigate } from "react-router-dom";
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import NetworkContext from "../../Contexts/Network/NetworkContext";
import { useTranslation } from "react-i18next";
import MessageToast from "../../Components/MessageToast";
import { MessageToastEnum } from "../../DTO/Enum/MessageToastEnum";

export default function NetworkListPage() {


    const { t } = useTranslation();

    let navigate = useNavigate();
    const networkContext = useContext(NetworkContext);

    const [showMessage, setShowMessage] = useState<boolean>(false);
    const [messageText, setMessageText] = useState<string>("");

    const throwError = (message: string) => {
        setMessageText(message);
        setShowMessage(true);
    };

    useEffect(() => {
        networkContext.listByUser().then((ret) => {
            if (!ret.sucesso) {
                throwError(ret.mensagemErro);
            }
        });
    }, []);

    return (
        <>
            <MessageToast
                dialog={MessageToastEnum.Error}
                showMessage={showMessage}
                messageText={messageText}
                onClose={() => setShowMessage(false)}
            />
            <Container>
                <Row>
                    <Col md="12">
                        <InputGroup>
                            <Form.Control
                                placeholder={t('network_list_search_placeholder')}
                                aria-label={t('network_list_search_aria_label')}
                            />
                            <Button variant="outline-secondary"><FontAwesomeIcon icon={faSearch} fixedWidth /></Button>
                        </InputGroup>
                    </Col>
                </Row>
                <Row className="py-4">
                    <Col md="12">
                        <div className="table-responsive">
                        <Table striped hover>
                            <thead>
                                <tr>
                                    <th>{t('network_list_header_network')}</th>
                                    <th className="text-end">{t('network_list_header_commission')}</th>
                                    <th>{t('network_list_header_owner')}</th>
                                    <th className="text-end">{t('network_list_header_members')}</th>
                                    <th>{t('network_list_header_actions')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    networkContext.loading &&
                                    <tr>
                                        <td colSpan={5}>
                                            <div className="d-flex justify-content-center">
                                                <div className="spinner-border" role="status">
                                                    <span className="visually-hidden">{t('loading')}</span>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                }
                                {!networkContext.loading && networkContext.userNetworks && networkContext.userNetworks.map((network) => {
                                    return (
                                        <tr>
                                            <td><a href="#" onClick={(e) => {
                                                e.preventDefault();
                                                networkContext.setNetwork(network.network);
                                                navigate("/admin/dashboard");

                                            }}>{network.network.name}</a></td>
                                            <td className="text-end">{network.network.comission}%</td>
                                            <td>{t('unknown')}</td>
                                            <td className="text-end">{network.network.qtdyUsers}/{network.network.maxUsers}</td>
                                            <td>
                                                <Link to={"/" + network.network.slug}>
                                                    <FontAwesomeIcon icon={faSearch} fixedWidth />
                                                </Link>
                                                <Link to="/admin/dashboard">
                                                    <FontAwesomeIcon icon={faTrash} fixedWidth />
                                                </Link>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </Table>
                        </div>
                    </Col>
                </Row>
            </Container>
        </>
    );
}