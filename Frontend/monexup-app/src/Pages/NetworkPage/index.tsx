import { useContext, useEffect, useState } from "react";
import Col from "react-bootstrap/esm/Col";
import Container from "react-bootstrap/esm/Container";
import Row from "react-bootstrap/esm/Row";
import { Link, useNavigate, useParams } from "react-router-dom";
import AuthContext from "../../Contexts/Auth/AuthContext";
import NetworkContext from "../../Contexts/Network/NetworkContext";
import UserContext from "../../Contexts/User/UserContext";
import Skeleton from "react-loading-skeleton";
import NetworkFooter from "./NetworkFooter";
import { MessageToastEnum } from "../../DTO/Enum/MessageToastEnum";
import MessageToast from "../../Components/MessageToast";
import PlanPart from "./PlanPart";
import TeamPart from "./TeamPart";
import HeroPart from "./HeroPart";

export default function NetworkPage() {

    let navigate = useNavigate();

    let { networkSlug } = useParams();

    const authContext = useContext(AuthContext);
    const networkContext = useContext(NetworkContext);

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
        authContext.loadUserSession();
        networkContext.getBySlug(networkSlug).then((ret) => {
            if (!ret.sucesso) {
                throwError(ret.mensagemErro);
            }
        });
        networkContext.getUserNetworkBySlug(networkSlug).then((retUserNetwork) => {
            if (!retUserNetwork.sucesso) {
                throwError(retUserNetwork.mensagemErro);
            }
        });
    }, []);

    return (
        <>
            <MessageToast
                dialog={dialog}
                showMessage={showMessage}
                messageText={messageText}
                onClose={() => setShowMessage(false)}
            ></MessageToast>
            {networkContext.editMode ?
                <HeroPart />
                :
                <HeroPart />
            }
            <hr />
            <PlanPart />
            <hr />
            <TeamPart />
            <NetworkFooter />
        </>
    );
}