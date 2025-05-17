import { useContext, useEffect, useState } from "react";
import Col from "react-bootstrap/esm/Col";
import Container from "react-bootstrap/esm/Container";
import Row from "react-bootstrap/esm/Row";
import Form from 'react-bootstrap/Form';
import AuthContext from "../../Contexts/Auth/AuthContext";
import Button from "react-bootstrap/esm/Button";
import Card from 'react-bootstrap/Card';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faCalendar, faDollar, faLevelUp, faPercent, faSave, faUser } from '@fortawesome/free-solid-svg-icons';
import { Link, useNavigate, useParams } from "react-router-dom";
import InputGroup from 'react-bootstrap/InputGroup';
import MessageToast from "../../Components/MessageToast";
import Moment from 'moment';
import { MessageToastEnum } from "../../DTO/Enum/MessageToastEnum";
import NetworkContext from "../../Contexts/Network/NetworkContext";
import ProfileContext from "../../Contexts/Profile/ProfileContext";
import UserProfileInfo from "../../DTO/Domain/UserProfileInfo";


export default function ProfileEditPage() {

    const authContext = useContext(AuthContext);
    const networkContext = useContext(NetworkContext);
    const profileContext = useContext(ProfileContext);

    let { profileId } = useParams();

    const [insertMode, setInsertMode] = useState<boolean>(false);

    const [dialog, setDialog] = useState<MessageToastEnum>(MessageToastEnum.Error);
    const [showMessage, setShowMessage] = useState<boolean>(false);
    const [messageText, setMessageText] = useState<string>("");

    let navigate = useNavigate();
    //Moment.locale('en');

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
        let profile: UserProfileInfo = null;
        profile = {
            ...profile,
            networkId: networkContext.userNetwork?.networkId,
            name: "",
            level: 0,
            commission: 0
        }
        if (authContext.sessionInfo) {
            let profileIdNum: number = parseInt(profileId);
            if (profileIdNum > 0) {
                profileContext.getById(profileIdNum).then((ret) => {
                    if (ret.sucesso) {
                        setInsertMode(false);
                    }
                    else {
                        setInsertMode(true);
                        profileContext.setProfile(profile);
                    }
                });
            }
            else {
                setInsertMode(true);
                profileContext.setProfile(profile);
            }
        }
        else {
            setInsertMode(true);
            profileContext.setProfile(profile);
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
                        <h3>
                            <nav aria-label="breadcrumb">
                                <ol className="breadcrumb">
                                    <li className="breadcrumb-item"><Link to="/admin/dashboard">My Network</Link></li>
                                    <li className="breadcrumb-item"><Link to="/admin/team-structure">Network Team Structure</Link></li>
                                    <li className="breadcrumb-item active" aria-current="page">New Team Structure</li>
                                </ol>
                            </nav>
                        </h3>
                    </Col>
                </Row>
                <Row>
                    <Col md="12">
                        <Card>
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
                                                    placeholder="Your profile name"
                                                    value={profileContext.profile?.name}
                                                    onChange={(e) => {
                                                        profileContext.setProfile({
                                                            ...profileContext.profile,
                                                            name: e.target.value
                                                        });
                                                    }} />
                                            </InputGroup>
                                        </Col>
                                    </Form.Group>
                                    <Form.Group as={Row} className="mb-3">
                                        <Form.Label column sm="2">Commission (%):</Form.Label>
                                        <Col sm="5">
                                            <InputGroup>
                                                <InputGroup.Text><FontAwesomeIcon icon={faPercent} fixedWidth /></InputGroup.Text>
                                                <Form.Control type="text" size="lg"
                                                    placeholder="Commission in percents"
                                                    value={profileContext.profile?.commission}
                                                    onChange={(e) => {
                                                        profileContext.setProfile({
                                                            ...profileContext.profile,
                                                            commission: parseFloat(e.target.value)
                                                        });
                                                    }} />
                                            </InputGroup>
                                        </Col>
                                        <Form.Label column sm="1">Level:</Form.Label>
                                        <Col sm="4">
                                            <InputGroup>
                                                <InputGroup.Text><FontAwesomeIcon icon={faLevelUp} fixedWidth /></InputGroup.Text>
                                                <Form.Control type="number" size="lg"
                                                    placeholder="Network level number"
                                                    value={profileContext.profile?.level}
                                                    onChange={(e) => {
                                                        profileContext.setProfile({
                                                            ...profileContext.profile,
                                                            level: parseInt(e.target.value)
                                                        });
                                                    }} />
                                            </InputGroup>
                                        </Col>
                                    </Form.Group>
                                    <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                                        <Button variant="danger" size="lg" onClick={() => {
                                            navigate("/admin/team-structure");
                                        }}><FontAwesomeIcon icon={faArrowLeft} fixedWidth /> Back</Button>
                                        <Button variant="success" size="lg" onClick={async (e) => {
                                            if (insertMode) {
                                                //profileContext.profile.networkId = NetworkContext.
                                                let ret = await profileContext.insert(profileContext.profile);
                                                if (ret.sucesso) {
                                                    showSuccessMessage(ret.mensagemSucesso);
                                                    //alert(userContext.user?.id);
                                                }
                                                else {
                                                    throwError(ret.mensagemErro);
                                                }
                                            }
                                            else {
                                                let ret = await profileContext.update(profileContext.profile);
                                                if (ret.sucesso) {
                                                    //alert(userContext.user?.id);
                                                    showSuccessMessage(ret.mensagemSucesso);
                                                }
                                                else {
                                                    throwError(ret.mensagemErro);
                                                }
                                            }
                                        }}
                                            disabled={profileContext.loadingUpdate}
                                        >
                                            {profileContext.loadingUpdate ? "Loading..." :
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