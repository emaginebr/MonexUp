import { useContext, useState } from "react";
import Row from "react-bootstrap/esm/Row";
import Col from "react-bootstrap/esm/Col";
import { UserEditForm } from 'nauth-react';
import type { UserInfo } from 'nauth-react';
import AuthContext from "../../Contexts/Auth/AuthContext";
import MessageToast from "../../Components/MessageToast";
import { MessageToastEnum } from "../../DTO/Enum/MessageToastEnum";
import { useTranslation } from "react-i18next";

export default function EditAccountPage() {

    const { t } = useTranslation();
    const authContext = useContext(AuthContext);

    const [dialog, setDialog] = useState<MessageToastEnum>(MessageToastEnum.Error);
    const [showMessage, setShowMessage] = useState<boolean>(false);
    const [messageText, setMessageText] = useState<string>("");

    const handleSuccess = (user: UserInfo) => {
        setDialog(MessageToastEnum.Success);
        setMessageText(t("userPage.updateSuccess") || "User updated successfully");
        setShowMessage(true);
    };

    const handleError = (error: Error) => {
        setDialog(MessageToastEnum.Error);
        setMessageText(error.message);
        setShowMessage(true);
    };

    return (
        <>
            <MessageToast
                dialog={dialog}
                showMessage={showMessage}
                messageText={messageText}
                onClose={() => setShowMessage(false)}
            />
            <div className="mnx-page-header">
                <h2>{t('edit_account')}</h2>
            </div>
            <Row className="justify-content-center">
                <Col lg={8}>
                    <UserEditForm
                        userId={authContext.sessionInfo?.userId}
                        onSuccess={handleSuccess}
                        onError={handleError}
                    />
                </Col>
            </Row>
        </>
    );
}
