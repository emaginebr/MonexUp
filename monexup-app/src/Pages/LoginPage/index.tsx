import { useContext, useState } from "react";
import Card from 'react-bootstrap/Card';
import { useNavigate, useSearchParams } from "react-router-dom";
import { LoginForm } from 'nauth-react';
import type { UserInfo } from 'nauth-react';
import MessageToast from "../../Components/MessageToast";
import { MessageToastEnum } from "../../DTO/Enum/MessageToastEnum";
import NetworkContext from "../../Contexts/Network/NetworkContext";
import { useTranslation } from "react-i18next";

export default function LoginPage() {

    const { t } = useTranslation();

    const [showMessage, setShowMessage] = useState<boolean>(false);
    const [messageText, setMessageText] = useState<string>("");

    const throwError = (message: string) => {
        setMessageText(message);
        setShowMessage(true);
    };

    const networkContext = useContext(NetworkContext);

    const navigate = useNavigate();
    const [queryParams] = useSearchParams();

    const getReturnUrl = () => {
        if (queryParams.has("returnUrl")) {
            return queryParams.get("returnUrl");
        }
        return "/";
    };

    const handleLoginSuccess = async (user: UserInfo) => {
        try {
            const netRet = await networkContext.listByUser();
            if (netRet.sucesso) {
                navigate(getReturnUrl());
            } else {
                throwError(netRet.mensagemErro);
            }
        } catch (err: any) {
            throwError(err?.message || 'Failed to load networks');
        }
    };

    const handleLoginError = (error: Error) => {
        throwError(error.message);
    };

    return (
        <>
            <MessageToast
                dialog={MessageToastEnum.Error}
                showMessage={showMessage}
                messageText={messageText}
                onClose={() => setShowMessage(false)}
            />
            <div className="mnx-auth-page">
                <div className="mnx-auth-card">
                    <Card>
                        <Card.Body>
                            <div className="auth-logo">
                                <img src={process.env.PUBLIC_URL + '/logo.jpg'} alt="MonexUp" />
                            </div>
                            <h3 className="auth-title">{t('login_title')}</h3>
                            <p className="auth-subtitle">{t('login_instruction')}</p>

                            <LoginForm
                                onSuccess={handleLoginSuccess}
                                onError={handleLoginError}
                                showRememberMe={true}
                            />

                            <div className="d-flex justify-content-center mt-3">
                                <a href="#" onClick={(e) => { e.preventDefault(); navigate("/account/recovery-password"); }}
                                   className="text-decoration-none" style={{ color: 'var(--mnx-orange)' }}>
                                    {t('login_recovery_password') || 'Recovery Password?'}
                                </a>
                            </div>
                            <div className="auth-footer">
                                {t('login_no_account') || "Don't have an account?"}{' '}
                                <a href="#" onClick={(e) => { e.preventDefault(); navigate("/account/new-account"); }}>
                                    {t('login_create_account_button')}
                                </a>
                            </div>
                        </Card.Body>
                    </Card>
                </div>
            </div>
        </>
    );
}
