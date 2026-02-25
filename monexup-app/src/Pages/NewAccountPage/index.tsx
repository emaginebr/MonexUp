import { useState } from "react";
import Card from 'react-bootstrap/Card';
import { useNavigate } from "react-router-dom";
import { RegisterForm } from 'nauth-react';
import type { UserInfo } from 'nauth-react';
import MessageToast from "../../Components/MessageToast";
import { MessageToastEnum } from "../../DTO/Enum/MessageToastEnum";
import { useTranslation } from "react-i18next";

export default function NewAccountPage() {

    const { t } = useTranslation();
    const navigate = useNavigate();

    const [dialog, setDialog] = useState<MessageToastEnum>(MessageToastEnum.Error);
    const [showMessage, setShowMessage] = useState<boolean>(false);
    const [messageText, setMessageText] = useState<string>("");

    const handleSuccess = (user: UserInfo) => {
        setDialog(MessageToastEnum.Success);
        setMessageText(t("userPage.registrationSuccess") || "Account created successfully");
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
            <div className="mnx-auth-page">
                <div className="mnx-auth-card" style={{ maxWidth: '600px' }}>
                    <Card>
                        <Card.Body>
                            <div className="auth-logo">
                                <img src={process.env.PUBLIC_URL + '/logo.jpg'} alt="MonexUp" />
                            </div>

                            <RegisterForm
                                onSuccess={handleSuccess}
                                onError={handleError}
                                steps={['basic']}
                                showProgressBar={false}
                            />

                            <div className="auth-footer">
                                {t('register_already_have_account') || "Already have an account?"}{' '}
                                <a href="#" onClick={(e) => { e.preventDefault(); navigate("/account/login"); }}>
                                    {t('login_button') || "Sign In"}
                                </a>
                            </div>
                        </Card.Body>
                    </Card>
                </div>
            </div>
        </>
    );
}
