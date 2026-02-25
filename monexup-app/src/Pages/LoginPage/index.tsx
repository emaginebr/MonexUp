import { useContext, useState } from "react";
import Col from "react-bootstrap/esm/Col";
import Container from "react-bootstrap/esm/Container";
import Row from "react-bootstrap/esm/Row";
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import AuthContext from "../../Contexts/Auth/AuthContext";
import Button from "react-bootstrap/esm/Button";
import Card from 'react-bootstrap/Card';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBitcoinSign, faClose, faEnvelope, faLock, faMailBulk, faSave, faSign, faSignIn, faSignInAlt, faTrash, faUser, faUserAlt } from '@fortawesome/free-solid-svg-icons';
import Table from "react-bootstrap/esm/Table";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import UserContext from "../../Contexts/User/UserContext";
import MessageToast from "../../Components/MessageToast";
import { MessageToastEnum } from "../../DTO/Enum/MessageToastEnum";
import { useLocation } from 'react-router-dom';
import NetworkContext from "../../Contexts/Network/NetworkContext";
import { useTranslation } from "react-i18next";

export default function LoginPage() {

    const { t } = useTranslation();

    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");

    const [showMessage, setShowMessage] = useState<boolean>(false);
    const [messageText, setMessageText] = useState<string>("");
  
    const throwError = (message: string) => {
      setMessageText(message);
      setShowMessage(true);
    };

    const authContext = useContext(AuthContext);
    const networkContext = useContext(NetworkContext);

    let navigate = useNavigate();
    const [queryParams] = useSearchParams();

    const getReturnUrl = () => {
        //const location = useLocation();
        console.log(JSON.stringify(queryParams));
        if (queryParams.has("returnUrl")) {
            return queryParams.get("returnUrl");
        }
        return "/";
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
                            <Form>
                                <Form.Group className="mb-3">
                                    <Form.Label>{t('login_email_label')}</Form.Label>
                                    <InputGroup>
                                        <InputGroup.Text><FontAwesomeIcon icon={faUser} fixedWidth /></InputGroup.Text>
                                        <Form.Control type="email" placeholder={t('login_email_placeholder')} value={email} onChange={(e) => {
                                            setEmail(e.target.value);
                                        }} />
                                    </InputGroup>
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>{t('login_password_label')}</Form.Label>
                                    <InputGroup>
                                        <InputGroup.Text><FontAwesomeIcon icon={faLock} fixedWidth /></InputGroup.Text>
                                        <Form.Control type="password" placeholder={t('login_password_placeholder')} value={password} onChange={(e) => {
                                            setPassword(e.target.value);
                                        }} />
                                    </InputGroup>
                                </Form.Group>
                                <div className="d-flex justify-content-between align-items-center mb-4">
                                    <Form.Check type="checkbox" label={t('login_remember_password_label')} />
                                    <a href="#" onClick={(e) => { e.preventDefault(); navigate("/account/recovery-password"); }} className="text-decoration-none" style={{ color: 'var(--mnx-orange)' }}>
                                        {t('login_recovery_password') || 'Recovery Password?'}
                                    </a>
                                </div>
                                <div className="d-grid mb-3">
                                    <Button variant="primary" disabled={authContext.loading} onClick={async (e) => {
                                        e.preventDefault();
                                        if (!email) {
                                            throwError(t('login_error_email_empty'));
                                            return;
                                        }
                                        if (!password) {
                                            throwError(t('login_error_password_empty'));
                                            return;
                                        }
                                        let ret = await authContext.loginWithEmail(email, password);
                                        if (ret.sucesso) {
                                            let netRet = await networkContext.listByUser();
                                            if (netRet.sucesso) {
                                                navigate(getReturnUrl());
                                            }
                                            else {
                                                throwError(ret.mensagemErro);
                                            }
                                        }
                                        else {
                                            throwError(ret.mensagemErro);
                                        }
                                    }}>
                                        <FontAwesomeIcon icon={faSignInAlt} fixedWidth /> {authContext.loading ? t('loading') : t('login_button')}
                                    </Button>
                                </div>
                                <div className="auth-footer">
                                    {t('login_no_account') || "Don't have an account?"}{' '}
                                    <a href="#" onClick={(e) => { e.preventDefault(); navigate("/account/new-account"); }}>
                                        {t('login_create_account_button')}
                                    </a>
                                </div>
                            </Form>
                        </Card.Body>
                    </Card>
                </div>
            </div>
        </>
    );
}