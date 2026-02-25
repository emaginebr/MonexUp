import { useContext, useEffect, useState } from "react";
import Col from "react-bootstrap/esm/Col";
import { useTranslation } from "react-i18next";
import Container from "react-bootstrap/esm/Container";
import Row from "react-bootstrap/esm/Row";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import Table from "react-bootstrap/esm/Table";
import { Link, useNavigate } from "react-router-dom";
import Button from 'react-bootstrap/Button';
import ProfileContext from "../../Contexts/Profile/ProfileContext";
import NetworkContext from "../../Contexts/Network/NetworkContext";
import { MessageToastEnum } from "../../DTO/Enum/MessageToastEnum";
import MessageToast from "../../Components/MessageToast";

export default function ProfileListPage() {

    const { t } = useTranslation();

    let navigate = useNavigate();

    const networkContext = useContext(NetworkContext);
    const profileContext = useContext(ProfileContext);

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
    const showDeleteMessage = (message: string) => {
        setDialog(MessageToastEnum.Confirmation);
        setMessageText(message);
        setShowMessage(true);
    };

    useEffect(() => {
        if (networkContext.userNetwork) {
            profileContext.listByNetwork(networkContext.userNetwork.networkId).then((ret) => {
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
                onYes={async () => {
                    if (profileContext.profile) {
                        let ret = await profileContext.delete(profileContext.profile.profileId);
                        if (ret.sucesso) {
                            showSuccessMessage(t("profileListPage.profileSuccessfullyDeleted"));
                            let retList = await profileContext.listByNetwork(networkContext.userNetwork.networkId);
                            if (!retList.sucesso) {
                                throwError(ret.mensagemErro);
                            }
                        }
                        else {
                            throwError(ret.mensagemErro);
                        }
                    }
                    setShowMessage(false);
                }}
                onNo={() => setShowMessage(false)}
            ></MessageToast>
            <Container>
                <Row>
                    <Col md="8">
                        <h3>
                            <nav aria-label="breadcrumb">
                                <ol className="breadcrumb">
                                    <li className="breadcrumb-item"><Link to="/admin/dashboard">{t("profileListPage.myNetwork")}</Link></li>
                                    <li className="breadcrumb-item active" aria-current="page">{t("profileListPage.networkTeamStructure")}</li>
                                </ol>
                            </nav>
                        </h3>
                    </Col>
                    <Col md="4" className="text-end">
                        <Button variant="primary" onClick={(e) => {
                            e.preventDefault();
                            navigate("/admin/team-structure/new");
                        }}><FontAwesomeIcon icon={faPlus} fixedWidth /> {t("new")}</Button>
                    </Col>
                </Row>
                <Row className="py-4">
                    <Col md="12">
                        <div className="table-responsive">
                        <Table striped hover>
                            <thead>
                                <tr>
                                    <th>{t("profileListPage.profileName")}</th>
                                    <th className="text-end">{t("profileListPage.level")}</th>
                                    <th className="text-end">{t("profileListPage.commission")} (%)</th>
                                    <th className="text-end">{t("profileListPage.members")}</th>
                                    <th>{t("profileListPage.actions")}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    profileContext.loading &&
                                    <tr>
                                        <td colSpan={5}>
                                            <div className="d-flex justify-content-center">
                                                <div className="spinner-border" role="status">
                                                    <span className="visually-hidden">{t("loading")}...</span>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                }
                                {!profileContext.loading && profileContext.profiles.map((profile) => {
                                    return (
                                        <tr>
                                            <td><Link to={"/admin/team-structure/" + profile.profileId}>{profile.name}</Link></td>
                                            <td className="text-end">{profile.level}</td>
                                            <td className="text-end">{profile.commission}%</td>
                                            <td className="text-end">{profile.members}</td>
                                            <td>
                                                <Link to={"/admin/team-structure/" + profile.profileId}>
                                                    <FontAwesomeIcon icon={faEdit} fixedWidth />
                                                </Link>
                                                <a href="#" onClick={(e) => {
                                                    e.preventDefault();
                                                    showDeleteMessage(t("areYouSure"));
                                                }}><FontAwesomeIcon icon={faTrash} fixedWidth /></a>
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