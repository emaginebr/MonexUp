import { useContext, useEffect, useState } from "react";
import Col from "react-bootstrap/esm/Col";
import Container from "react-bootstrap/esm/Container";
import Row from "react-bootstrap/esm/Row";
import Form from 'react-bootstrap/Form';
import AuthContext from "../../Contexts/Auth/AuthContext";
import Button from "react-bootstrap/esm/Button";
import Card from 'react-bootstrap/Card';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faArrowRight, faCancel, faEnvelope, faLock, faPercent, faUser } from '@fortawesome/free-solid-svg-icons';
import { Link, useNavigate } from "react-router-dom";
import InputGroup from 'react-bootstrap/InputGroup';
import UserContext from "../../Contexts/User/UserContext";
import MessageToast from "../../Components/MessageToast";
import Moment from 'moment';
import { MessageToastEnum } from "../../DTO/Enum/MessageToastEnum";
import NetworkContext from "../../Contexts/Network/NetworkContext";
import NetworkInsertInfo from "../../DTO/Domain/NetworkInsertInfo";

export default function NetworkInsertPage() {

    const authContext = useContext(AuthContext);
    const userContext = useContext(UserContext);
    const networkContext = useContext(NetworkContext);

    const [step, setStep] = useState<number>(1);
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [confirmPassword, setConfirmPassword] = useState<string>("");

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
        if (authContext.sessionInfo) {
            if (authContext.sessionInfo?.userId > 0) {
                userContext.getMe().then((ret) => {
                    if (ret.sucesso) {
                        setStep(2);
                    }
                    else {
                        setStep(1);
                    }
                });
            }
            else {
                setStep(1);
            }
        }
        else {
            setStep(1);
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
                    <Col md={12} className="text-center">
                        <ul id="progressbar" className="text-center align-items-center">
                            <li className="active" id="step1"><div className="d-none d-md-block">Register user</div></li>
                            <li className={step > 1 ? "active" : ""} id="step2"><div className="d-none d-md-block">Register network</div></li>
                            <li className={step > 2 ? "active" : ""} id="step3"><div className="d-none d-md-block">Payment</div></li>
                            <li className={step > 3 ? "active" : ""} id="step4"><div className="d-none d-md-block">Done</div></li>
                        </ul>
                    </Col>
                </Row>
            </Container>
            {step == 1 &&
                <>
                    <Container className="mb-5">
                        <Row>
                            <Col md="6">
                                <Card>
                                    <Card.Header>
                                        <h3 className="text-center">Login</h3>
                                    </Card.Header>
                                    <Card.Body>
                                        <Form>
                                            <Form.Group as={Row} className="mb-3">
                                                <Form.Label column sm="3">Email:</Form.Label>
                                                <Col sm="9">
                                                    <InputGroup>
                                                        <InputGroup.Text><FontAwesomeIcon icon={faUser} fixedWidth /></InputGroup.Text>
                                                        <Form.Control type="email" size="lg" placeholder="Your email" value={email} onChange={(e) => {
                                                            setEmail(e.target.value);
                                                        }} />
                                                    </InputGroup>
                                                </Col>
                                            </Form.Group>
                                            <Form.Group as={Row} className="mb-3">
                                                <Form.Label column sm="3">Password:</Form.Label>
                                                <Col sm="9">
                                                    <InputGroup>
                                                        <InputGroup.Text><FontAwesomeIcon icon={faLock} fixedWidth /></InputGroup.Text>
                                                        <Form.Control type="password" size="lg" placeholder="Your password" value={password} onChange={(e) => {
                                                            setPassword(e.target.value);
                                                        }} />
                                                    </InputGroup>
                                                </Col>
                                            </Form.Group>
                                            <Form.Group as={Row} className="mb-3">
                                                <Col sm="9" className="offset-sm-3">
                                                    <Form.Check type="checkbox" label="Remember password?" />
                                                </Col>
                                            </Form.Group>
                                            <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                                                <Button variant="danger" size="lg" onClick={() => {
                                                    navigate("/recovery-password");
                                                }}><FontAwesomeIcon icon={faEnvelope} fixedWidth /> Recovery Password?</Button>
                                                <Button variant="success" size="lg" disabled={authContext.loading} onClick={async (e) => {
                                                    e.preventDefault();
                                                    if (!email) {
                                                        throwError("Email is empty");
                                                        return;
                                                    }
                                                    if (!password) {
                                                        throwError("Password is empty");
                                                        return;
                                                    }
                                                    let ret = await authContext.loginWithEmail(email, password);
                                                    if (ret.sucesso) {
                                                        //navigate("/");
                                                        setStep(2);
                                                    }
                                                    else {
                                                        throwError(ret.mensagemErro);
                                                    }
                                                }}>
                                                    {authContext.loading ? "Loading..." : "Next"}
                                                    <FontAwesomeIcon icon={faArrowRight} fixedWidth />
                                                </Button>
                                            </div>
                                        </Form>
                                    </Card.Body>
                                </Card>
                            </Col>
                            <Col md="6">
                                <Card>
                                    <Card.Header>
                                        <h3 className="text-center">User registration</h3>
                                    </Card.Header>
                                    <Card.Body>
                                        <Form>
                                            <Form.Group as={Row} className="mb-3">
                                                <Form.Label column sm="2">Name:</Form.Label>
                                                <Col sm="10">
                                                    <InputGroup>
                                                        <InputGroup.Text><FontAwesomeIcon icon={faUser} fixedWidth /></InputGroup.Text>
                                                        <Form.Control type="text" size="lg"
                                                            placeholder="Your name"
                                                            value={userContext.user?.name}
                                                            onChange={(e) => {
                                                                userContext.setUser({
                                                                    ...userContext.user,
                                                                    name: e.target.value
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
                                                        <Form.Control type="text" size="lg"
                                                            placeholder="Your email"
                                                            value={userContext.user?.email}
                                                            onChange={(e) => {
                                                                userContext.setUser({
                                                                    ...userContext.user,
                                                                    email: e.target.value
                                                                });
                                                            }} />
                                                    </InputGroup>
                                                </Col>
                                            </Form.Group>
                                            <Form.Group as={Row} className="mb-3">
                                                <Form.Label column sm="2">Password:</Form.Label>
                                                <Col sm="10">
                                                    <InputGroup>
                                                        <InputGroup.Text><FontAwesomeIcon icon={faLock} fixedWidth /></InputGroup.Text>
                                                        <Form.Control type="password" size="lg"
                                                            placeholder="Your password"
                                                            value={userContext.user?.password}
                                                            onChange={(e) => {
                                                                userContext.setUser({
                                                                    ...userContext.user,
                                                                    password: e.target.value
                                                                });
                                                            }} />
                                                    </InputGroup>
                                                </Col>
                                            </Form.Group>
                                            <Form.Group as={Row} className="mb-3">
                                                <Form.Label column sm="2">Confirm:</Form.Label>
                                                <Col sm="10">
                                                    <InputGroup>
                                                        <InputGroup.Text><FontAwesomeIcon icon={faLock} fixedWidth /></InputGroup.Text>
                                                        <Form.Control type="password" size="lg"
                                                            placeholder="Confirm your password"
                                                            value={confirmPassword}
                                                            onChange={(e) => {
                                                                setConfirmPassword(e.target.value);
                                                            }} />
                                                    </InputGroup>
                                                </Col>
                                            </Form.Group>
                                            <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                                                <Button variant="success" size="lg" onClick={async (e) => {
                                                    if (!userContext.user?.name) {
                                                        throwError("Name is empty");
                                                        return;
                                                    }
                                                    if (!userContext.user?.email) {
                                                        throwError("Email is empty");
                                                        return;
                                                    }
                                                    if (userContext.user?.password != confirmPassword) {
                                                        throwError("Password and confirmation are different");
                                                        return;
                                                    }
                                                    let ret = await userContext.insert(userContext.user);
                                                    if (ret.sucesso) {
                                                        showSuccessMessage(ret.mensagemSucesso);
                                                        //alert(userContext.user?.id);
                                                        setStep(2);
                                                    }
                                                    else {
                                                        throwError(ret.mensagemErro);
                                                    }
                                                }}
                                                    disabled={userContext.loadingUpdate}
                                                > {userContext.loadingUpdate ? "Loading..." : "Next"}
                                                    <FontAwesomeIcon icon={faArrowRight} fixedWidth />
                                                </Button>
                                            </div>
                                        </Form>
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>
                    </Container>
                </>
            }
            {step == 2 &&
                <Container>
                    <Row>
                        <Col md="12">
                            <Card>
                                <Card.Header>
                                    <h3 className="text-center">Network registration</h3>
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
                                                        }}
                                                    />
                                                </InputGroup>
                                            </Col>
                                        </Form.Group>
                                        <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                                            <Button variant="danger" size="lg" onClick={() => {
                                                setStep(2);
                                            }}><FontAwesomeIcon icon={faArrowLeft} fixedWidth /> Back</Button>
                                            <Button variant="success" size="lg" onClick={async (e) => {
                                                let networkInsert: NetworkInsertInfo;
                                                let ret = await networkContext.insert({
                                                    ...networkInsert,
                                                    name: networkContext.network.name,
                                                    email: authContext.sessionInfo?.email,
                                                    comission: networkContext.network.comission,
                                                    plan: 1
                                                });
                                                if (ret.sucesso) {
                                                    showSuccessMessage(ret.mensagemSucesso);
                                                    //alert(userContext.user?.id);
                                                    setStep(4);
                                                }
                                                else {
                                                    throwError(ret.mensagemErro);
                                                }
                                            }}
                                                disabled={networkContext.loadingUpdate}
                                            >
                                                {networkContext.loadingUpdate ? "Loading..." :
                                                    <>
                                                        Next&nbsp;<FontAwesomeIcon icon={faArrowRight} fixedWidth />
                                                    </>}
                                            </Button>
                                        </div>
                                    </Form>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </Container>
            }
        </>
    );
}