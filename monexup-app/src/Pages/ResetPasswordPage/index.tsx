import { useState } from "react";
import Container from "react-bootstrap/esm/Container";
import Row from "react-bootstrap/esm/Row";
import Col from "react-bootstrap/esm/Col";
import Card from 'react-bootstrap/Card';
import { useNavigate, useSearchParams } from "react-router-dom";
import { ResetPasswordForm } from 'nauth-react';
import MessageToast from "../../Components/MessageToast";
import { MessageToastEnum } from "../../DTO/Enum/MessageToastEnum";
import { useTranslation } from "react-i18next";

export default function ResetPasswordPage() {

    const { t } = useTranslation();
    const navigate = useNavigate();
    const [queryParams] = useSearchParams();

    const recoveryHash = queryParams.get("hash") || "";

    const [dialog, setDialog] = useState<MessageToastEnum>(MessageToastEnum.Error);
    const [showMessage, setShowMessage] = useState<boolean>(false);
    const [messageText, setMessageText] = useState<string>("");

    const handleSuccess = () => {
        setDialog(MessageToastEnum.Success);
        setMessageText(t("reset_password_success") || "Password reset successfully");
        setShowMessage(true);
        setTimeout(() => navigate("/account/login"), 2000);
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
                                    {t('reset_password_title') || 'Reset Password'}
                                </h3>
                            </Card.Header>
                            <Card.Body>
                                <ResetPasswordForm
                                    recoveryHash={recoveryHash}
                                    onSuccess={handleSuccess}
                                    onError={handleError}
                                />

                                <div className="text-center mt-3">
                                    <a href="#" onClick={(e) => {
                                        e.preventDefault();
                                        navigate("/account/login");
                                    }}
                                    style={{ color: 'var(--mnx-orange)' }}>
                                        {t('back_to_login') || 'Back to Login'}
                                    </a>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </>
    );
}
