import { useState } from "react";
import Col from "react-bootstrap/esm/Col";
import Container from "react-bootstrap/esm/Container";
import Row from "react-bootstrap/esm/Row";
import Card from 'react-bootstrap/Card';
import { ChangePasswordForm } from 'nauth-react';
import MessageToast from "../../Components/MessageToast";
import { MessageToastEnum } from "../../DTO/Enum/MessageToastEnum";
import { useTranslation } from "react-i18next";

export default function PasswordPage() {

    const { t } = useTranslation();

    const [dialog, setDialog] = useState<MessageToastEnum>(MessageToastEnum.Error);
    const [showMessage, setShowMessage] = useState<boolean>(false);
    const [messageText, setMessageText] = useState<string>("");

    const handleSuccess = () => {
        setDialog(MessageToastEnum.Success);
        setMessageText(t('password_page_change_success') || "Password changed successfully");
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
            <Container className="mt-4">
                <Row>
                    <Col md="6" className="offset-md-3">
                        <Card>
                            <Card.Header>
                                <h3 className="text-center">
                                    {t('password_page_change_password_title')}
                                </h3>
                            </Card.Header>
                            <Card.Body>
                                <ChangePasswordForm
                                    onSuccess={handleSuccess}
                                    onError={handleError}
                                />
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </>
    );
}
