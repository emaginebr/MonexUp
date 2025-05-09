import { useContext, useEffect, useState } from "react";
import Col from "react-bootstrap/esm/Col";
import Container from "react-bootstrap/esm/Container";
import Row from "react-bootstrap/esm/Row";
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import AuthContext from "../../Contexts/Auth/AuthContext";
import Button from "react-bootstrap/esm/Button";
import Card from 'react-bootstrap/Card';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBitcoinSign, faBoltLightning, faCheck, faClose, faEnvelope, faLock, faMailBulk, faSave, faSign, faSignIn, faSignInAlt, faTrash, faUser } from '@fortawesome/free-solid-svg-icons';
import Table from "react-bootstrap/esm/Table";
import { Link, useNavigate, useParams } from "react-router-dom";
import NetworkContext from "../../Contexts/Network/NetworkContext";
import Skeleton from "react-loading-skeleton";
import { MessageToastEnum } from "../../DTO/Enum/MessageToastEnum";
import { UserNetworkStatusEnum } from "../../DTO/Enum/UserNetworkStatusEnum";
import MessageToast from "../../Components/MessageToast";

export default function RequestAccessPage() {

    let navigate = useNavigate();

    const authContext = useContext(AuthContext);
    const networkContext = useContext(NetworkContext);

    let { networkSlug } = useParams();

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

    useEffect(() => {
        //authContext.loadUserSession();
        networkContext.getBySlug(networkSlug).then((ret) => {
            if (ret.sucesso) {
                if (authContext.sessionInfo) {
                    networkContext.getUserNetwork(ret.network.networkId).then((retUserNetwork) => {
                        if (!retUserNetwork.sucesso) {
                            throwError(retUserNetwork.mensagemErro);
                        }
                    });
                }
            }
            else {
                throwError(ret.mensagemErro);
            }
        });
    }, []);

    const MessageActive = () => {
        return (
            <>
                <Card>
                    <Card.Body className="text-center">
                        <h3 className="text-center">You're Approved!</h3>
                        {networkContext.loading ?
                            <p><Skeleton /></p>
                            :
                            <p>Welcome to <strong>{networkContext.network?.name}</strong>!</p>
                        }
                        <p>Your request to join the network has been approved.</p>
                        <p>
                            You can now: Start selling products; Invite new representatives; Track your earnings and progress.
                        </p>
                        <p>
                            Everything is ready. Let’s get started!
                        </p>
                        <div className="lc-block d-grid gap-3 d-md-block">
                            <Button variant="success" size="lg" className="me-md-2" onClick={(e) => {
                                e.preventDefault();
                                navigate("/admin/dashboard");
                            }}><FontAwesomeIcon icon={faBoltLightning} fixedWidth />Go to Dashboard!</Button>
                        </div>
                    </Card.Body>
                </Card>
            </>
        );
    };

    const MessageInactive = () => {
        return (
            <>
                <Card>
                    <Card.Body className="text-center">
                        <h3 className="text-center">Access Denied!</h3>
                        {networkContext.loading ?
                            <p><Skeleton /></p>
                            :
                            <p>
                                We're sorry, but your request to join <strong>{networkContext.network?.name}</strong>
                                &nbsp;was <strong>not approved</strong>.
                            </p>
                        }
                        <p>
                            This decision may be due to internal criteria or incomplete information.
                            You may try again later or contact the network manager for more details.
                        </p>
                    </Card.Body>
                </Card>
            </>
        );
    };

    const MessageWaitForApproval = () => {
        return (
            <>
                <Card>
                    <Card.Body>
                        <h3 className="text-center">Request sent successfully!</h3>
                        <p>Your request to join the <strong>{networkContext.network?.name}</strong> network has been successfully received.</p>
                        <p>
                            Now all you have to do is wait for the network manager to approve it. As soon as your participation is approved,
                            you will receive a notification and you can start selling, recruiting new reps and tracking your earnings!
                        </p>
                        <p>
                            <strong>Important</strong>: While your request is pending, you can still explore other public networks available.
                        </p>
                    </Card.Body>
                </Card>
            </>
        );
    };

    const MessageBlocked = () => {
        return (
            <>
                <Card>
                    <Card.Body className="text-center">
                        <h3 className="text-center">Access Blocked!</h3>
                        {networkContext.loading ?
                            <p><Skeleton /></p>
                            :
                            <p>
                                Your access to the <strong>{networkContext.network?.name}</strong> network has been <strong>blocked</strong>.
                            </p>
                        }
                        <p>
                            This may be due to a violation of the network's terms of service or an administrative decision by the network manager.
                        </p>
                        <p>
                            While your access is blocked, you will not be able to participate in network activities, including selling products or recruiting new members.
                        </p>
                        <p>
                            Please contact the network manager for more information or clarification regarding this status.
                        </p>
                    </Card.Body>
                </Card>
            </>
        );
    };


    const MessageWithUserNetwork = (status: UserNetworkStatusEnum) => {
        switch (status) {
            case UserNetworkStatusEnum.Active:
                return MessageActive();
                break;
            case UserNetworkStatusEnum.Inactive:
                return MessageInactive();
                break;
            case UserNetworkStatusEnum.Blocked:
                return MessageBlocked();
                break;
            case UserNetworkStatusEnum.WaitForApproval:
                return MessageWaitForApproval();
                break;
        }
    };

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
                    <Col md="6" className='offset-md-3'>
                        {networkContext.userNetwork ?
                            <>
                                {MessageWithUserNetwork(networkContext.userNetwork?.status)}
                            </>
                            :
                            <>
                                <h3 className="text-center">{networkContext.loading ? <Skeleton></Skeleton> : "Do you want to join the " + networkContext.network?.name + "?"}</h3>
                                <Card>
                                    <Card.Body>
                                        {networkContext.loading ?
                                            <>
                                                <p><Skeleton count={3}></Skeleton></p>
                                                <p><Skeleton count={1}></Skeleton></p>
                                                <p><Skeleton count={1}></Skeleton></p>
                                            </>
                                            :
                                            <>
                                                <p>
                                                    By joining this network, you will be able to: Sell the network's products and earn commissions;
                                                    Recruit new representatives to grow your team; and Track your performance and earnings in real-time.
                                                </p>
                                                <p><strong>Note:</strong> Your request will be sent to the network manager for approval.</p>
                                                <p>Do you want to request access to this network?</p>
                                            </>
                                        }

                                        <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                                            <Button variant="success" size="lg" onClick={async (e) => {
                                                e.preventDefault();
                                                let ret = await networkContext.requestAccess(networkContext.network?.networkId);
                                                if (ret.sucesso) {
                                                    showSuccessMessage(ret.mensagemSucesso);
                                                }
                                                else {
                                                    throwError(ret.mensagemErro);
                                                }

                                            }} disabled={networkContext.loadingRequestAccess}>{networkContext.loadingRequestAccess ?
                                                "Loading..."
                                                :
                                                <>
                                                    <FontAwesomeIcon icon={faCheck} fixedWidth /> Yes, I want to join
                                                </>
                                                }</Button>
                                            <Button variant="danger" size="lg" onClick={(e) => {
                                                e.preventDefault();
                                                navigate("/" + networkContext.network?.slug);
                                            }}><FontAwesomeIcon icon={faClose} fixedWidth /> No, go back</Button>
                                        </div>
                                    </Card.Body>
                                </Card>
                            </>
                        }
                    </Col>
                </Row>
            </Container>
        </>
    );
}