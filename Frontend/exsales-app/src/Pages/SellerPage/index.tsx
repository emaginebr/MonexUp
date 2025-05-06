import { useContext, useEffect, useState } from "react";
import Col from "react-bootstrap/esm/Col";
import Container from "react-bootstrap/esm/Container";
import Row from "react-bootstrap/esm/Row";
import { Link, useNavigate, useParams } from "react-router-dom";
import AuthContext from "../../Contexts/Auth/AuthContext";
import NetworkContext from "../../Contexts/Network/NetworkContext";
import UserContext from "../../Contexts/User/UserContext";
import Skeleton from "react-loading-skeleton";
import { MessageToastEnum } from "../../DTO/Enum/MessageToastEnum";
import MessageToast from "../../Components/MessageToast";
import PlanPart from "../NetworkPage/PlanPart";
import ProfilePart from "./ProfilePart";
import NetworkFooter from "../NetworkPage/NetworkFooter";

export default function SellerPage() {

    let navigate = useNavigate();

    let { networkSlug, sellerSlug } = useParams();

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
        networkContext.getSellerBySlug(networkSlug, sellerSlug).then((ret) => {
            if (!ret.sucesso) {
                throwError(ret.mensagemErro);
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
            <ProfilePart />
            <hr />
            <PlanPart />
            <NetworkFooter />
        </>
    );
}