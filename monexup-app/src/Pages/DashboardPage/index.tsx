import { useContext, useEffect, useState } from "react";
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
import CountPart from "./CountPart";
import InvoiceContext from "../../Contexts/Invoice/InvoiceContext";
import MessageToast from "../../Components/MessageToast";
import { MessageToastEnum } from "../../DTO/Enum/MessageToastEnum";
import Skeleton from "react-loading-skeleton";
import StatementPart from "./StatementPart";
import StatementSearchParam from "../../DTO/Domain/StatementSearchParam";
import { useTranslation } from "react-i18next";

export default function DashboardPage() {

    const authContext = useContext(AuthContext);
    const networkContext = useContext(NetworkContext);
    const invoiceContext = useContext(InvoiceContext);

    const { t } = useTranslation();

    let navigate = useNavigate();

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

    const searchStatements = async (pageNum: number) => {
        let param: StatementSearchParam;
        switch (networkContext.currentRole) {
            case UserRoleEnum.NetworkManager:
                param = {
                    ...param,
                    networkId: networkContext.userNetwork.networkId,
                    pageNum: 1
                };
                break;
            case UserRoleEnum.Seller:
                param = {
                    ...param,
                    userId: authContext.sessionInfo.userId,
                    pageNum: 1
                };
                break;
        }
        if (networkContext.currentRole != UserRoleEnum.User) {
            var ret = await invoiceContext.searchStatement(param);
            if (!ret.sucesso) {
                throwError(ret.mensagemErro);
            }
        }
    };

    useEffect(() => {
        searchStatements(1);
        switch (networkContext.currentRole) {
            case UserRoleEnum.NetworkManager:
                invoiceContext.getBalance(networkContext.userNetwork.networkId).then((ret) => {
                    if (!ret.sucesso) {
                        throwError(ret.mensagemErro);
                    }
                });
                break;
            case UserRoleEnum.Seller:
                invoiceContext.getBalance().then((ret) => {
                    if (!ret.sucesso) {
                        throwError(ret.mensagemErro);
                    }
                });
                invoiceContext.getAvailableBalance().then((ret) => {
                    if (!ret.sucesso) {
                        throwError(ret.mensagemErro);
                    }
                });
                break;
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
            <div className="mnx-page-header">
                <h2>Dashboard</h2>
            </div>
            {networkContext.currentRole != UserRoleEnum.User &&
                <Row className="mb-4">
                    <Col lg={8}>
                        <CountPart />
                    </Col>
                    <Col lg={4}>
                        <div className="mnx-balance-card">
                            <div className="balance-label">{t('dashboard_current_balance')}</div>
                            <div className="balance-value">
                                {invoiceContext.loadingBalance ?
                                    <Skeleton />
                                    :
                                    <><small>R$</small>{invoiceContext.balance}</>
                                }
                            </div>
                            {networkContext.currentRole == UserRoleEnum.Seller &&
                                <div className="balance-available">
                                    {invoiceContext.loadingAvailableBalance ?
                                        <Skeleton />
                                        :
                                        <span>{t('dashboard_amount_released_for_withdrawal')} <small>R$</small>{invoiceContext.availableBalance}</span>
                                    }
                                </div>
                            }
                            <Button variant="outline-light" size="sm" disabled>{t('dashboard_withdrawal')} <FontAwesomeIcon icon={faArrowRight} fixedWidth /></Button>
                        </div>
                    </Col>
                </Row>
            }
            <Row>
                <Col md={12}>
                    <Tabs
                        defaultActiveKey="balance"
                        id="uncontrolled-tab-example"
                        className="mb-3"
                    >
                        <Tab eventKey="balance" title={
                            <>
                                <FontAwesomeIcon icon={faDollar} fixedWidth />&nbsp;{t('dashboard_statement')}
                            </>
                        }>
                            <StatementPart
                                loading={invoiceContext.loadingSearch}
                                StatementResult={invoiceContext.statementResult}
                                onChangePage={(pagenum: number) => {
                                    searchStatements(pagenum);
                                }} />
                        </Tab>
                        <Tab eventKey="order" title={t('dashboard_orders_tab')} disabled>
                            Tab content for Profile
                        </Tab>
                    </Tabs>
                </Col>
            </Row>
        </>
    );

}