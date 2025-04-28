import { useContext, useEffect, useState } from "react";
import Col from "react-bootstrap/esm/Col";
import Container from "react-bootstrap/esm/Container";
import Row from "react-bootstrap/esm/Row";
import Form from 'react-bootstrap/Form';
import AuthContext from "../../Contexts/Auth/AuthContext";
import Button from "react-bootstrap/esm/Button";
import Card from 'react-bootstrap/Card';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAddressBook, faArrowLeft, faArrowRight, faBitcoinSign, faCalendar, faCalendarAlt, faCancel, faClose, faCode, faDollar, faEnvelope, faEthernet, faIdCard, faLock, faPercent, faPhone, faSave, faSignInAlt, faTrash, faUser } from '@fortawesome/free-solid-svg-icons';
import Table from "react-bootstrap/esm/Table";
import { Link, useNavigate } from "react-router-dom";
import InputGroup from 'react-bootstrap/InputGroup';
import UserContext from "../../Contexts/User/UserContext";
import MessageToast from "../../Components/MessageToast";
import Moment from 'moment';
import { MessageToastEnum } from "../../DTO/Enum/MessageToastEnum";
import NetworkContext from "../../Contexts/Network/NetworkContext";

export default function NetworkEditPage() {

    const authContext = useContext(AuthContext);
    //const userContext = useContext(UserContext);
    const networkContext = useContext(NetworkContext);


    const [dialog, setDialog] = useState<MessageToastEnum>(MessageToastEnum.Error);
    const [showMessage, setShowMessage] = useState<boolean>(false);
    const [messageText, setMessageText] = useState<string>("");

    let navigate = useNavigate();
    Moment.locale('en');

    const throwError = (message: string) => {
        setDialog(MessageToastEnum.Error)
        setMessageText(message);
        setShowMessage(true);
    };
    const showSuccessMessage = (message: string) => {
        setDialog(MessageToastEnum.Success)
        setMessageText(message);
        setShowMessage(true);
    };

    useEffect(() => {
        if (authContext.sessionInfo && networkContext.userNetwork) {
            networkContext.getById(networkContext.userNetwork.networkId).then((ret) => {
                if (!ret.sucesso) {
                    throwError(ret.mensagemErro);
                }
            });
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
                    <Col md="12">
                        <Card>
                            <Card.Header>
                                <h3 className="text-center">Network Preferences</h3>
                            </Card.Header>
                            <Card.Body>
                                <Form>
                                    <div className="text-center mb-3">
                                        Registration is not required to make swaps, but you can do so anyway to access your transaction history.
                                    </div>
                                    <Form.Group as={Row} className="mb-3">
                                        <Form.Label column sm="2">Name:</Form.Label>
                                        <Col sm="10">
                                            <InputGroup>
                                                <InputGroup.Text><FontAwesomeIcon icon={faUser} fixedWidth /></InputGroup.Text>
                                                <Form.Control type="text" size="lg"
                                                    placeholder="Your network name"
                                                    value={networkContext.network?.name}
                                                    onChange={(e) => {
                                                        networkContext.setNetwork({
                                                            ...networkContext.network,
                                                            name: e.target.value
                                                        });
                                                    }} />
                                            </InputGroup>
                                        </Col>
                                    </Form.Group>
                                    <Form.Group as={Row} className="mb-3">
                                        <Form.Label column sm="2">Slug:</Form.Label>
                                        <Col sm="10">
                                            <InputGroup>
                                                <InputGroup.Text><FontAwesomeIcon icon={faCode} fixedWidth /></InputGroup.Text>
                                                <Form.Control type="text" size="lg"
                                                    placeholder="Ex: https://monexup.io/{my-network-slug}"
                                                    value={networkContext.network?.slug}
                                                    onChange={(e) => {
                                                        networkContext.setNetwork({
                                                            ...networkContext.network,
                                                            slug: e.target.value
                                                        });
                                                    }} />
                                            </InputGroup>
                                        </Col>
                                    </Form.Group>
                                    <Form.Group as={Row} className="mb-3">
                                        <Form.Label column sm="2">Email:</Form.Label>
                                        <Col sm="10">
                                            <InputGroup>
                                                <InputGroup.Text><FontAwesomeIcon icon={faEnvelope} fixedWidth /></InputGroup.Text>
                                                <Form.Control type="email" size="lg"
                                                    placeholder="Your email"
                                                    value={networkContext.network?.email}
                                                    onChange={(e) => {
                                                        networkContext.setNetwork({
                                                            ...networkContext.network,
                                                            email: e.target.value
                                                        });
                                                    }} />
                                            </InputGroup>
                                        </Col>
                                    </Form.Group>
                                    <Form.Group as={Row} className="mb-3">
                                        <Form.Label column sm="2">Minimal Withdrawal:</Form.Label>
                                        <Col sm="4">
                                            <InputGroup>
                                                <InputGroup.Text><FontAwesomeIcon icon={faDollar} fixedWidth /></InputGroup.Text>
                                                <Form.Control type="number" size="lg"
                                                    placeholder="Mininal Withdrawal amount"
                                                    value={networkContext.network?.withdrawalMin}
                                                    onChange={(e) => {
                                                        networkContext.setNetwork({
                                                            ...networkContext.network,
                                                            withdrawalMin: parseFloat(e.target.value)
                                                        });
                                                    }} />
                                            </InputGroup>
                                        </Col>
                                        <Form.Label column sm="2">Withdrawal Period:</Form.Label>
                                        <Col sm="4">
                                            <InputGroup>
                                                <InputGroup.Text><FontAwesomeIcon icon={faCalendar} fixedWidth /></InputGroup.Text>
                                                <Form.Control type="number" size="lg"
                                                    placeholder="Withdrawal period value in days"
                                                    value={networkContext.network?.withdrawalPeriod}
                                                    onChange={(e) => {
                                                        networkContext.setNetwork({
                                                            ...networkContext.network,
                                                            withdrawalPeriod: parseInt(e.target.value)
                                                        });
                                                    }} />
                                            </InputGroup>
                                        </Col>
                                    </Form.Group>
                                    <Form.Group as={Row} className="mb-3">
                                        <Form.Label column sm="2">Commission:</Form.Label>
                                        <Col sm="4">
                                            <InputGroup>
                                                <InputGroup.Text><FontAwesomeIcon icon={faPercent} fixedWidth /></InputGroup.Text>
                                                <Form.Control type="number" size="lg"
                                                    placeholder="Network Percent Commission"
                                                    value={networkContext.network?.comission}
                                                    onChange={(e) => {
                                                        networkContext.setNetwork({
                                                            ...networkContext.network,
                                                            comission: parseInt(e.target.value)
                                                        });
                                                    }} />
                                            </InputGroup>
                                        </Col>
                                    </Form.Group>
                                    <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                                        <Button variant="danger" size="lg" onClick={() => {
                                            navigate("/admin/dashboard");
                                        }}><FontAwesomeIcon icon={faArrowLeft} fixedWidth /> Back</Button>
                                        <Button variant="success" size="lg" onClick={async (e) => {
                                            let ret = await networkContext.update(networkContext.network);
                                            if (ret.sucesso) {
                                                //alert(userContext.user?.id);
                                                showSuccessMessage(ret.mensagemSucesso);
                                            }
                                            else {
                                                throwError(ret.mensagemErro);
                                            }
                                        }}
                                            disabled={networkContext.loadingUpdate}
                                        >
                                            {networkContext.loadingUpdate ? "Loading..." :
                                                <>
                                                    <FontAwesomeIcon icon={faSave} fixedWidth />&nbsp;Save
                                                </>}
                                        </Button>
                                    </div>
                                </Form>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </>
    );
}