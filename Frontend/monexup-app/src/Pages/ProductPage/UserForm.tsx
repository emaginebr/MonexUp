import Col from "react-bootstrap/esm/Col";
import Container from "react-bootstrap/esm/Container";
import Row from "react-bootstrap/esm/Row";
import Form from 'react-bootstrap/Form';
import AuthContext from "../../Contexts/Auth/AuthContext";
import Button from "react-bootstrap/esm/Button";
import Card from 'react-bootstrap/Card';
import InputGroup from 'react-bootstrap/InputGroup';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight, faEnvelope, faLock, faUser, faUserAlt } from "@fortawesome/free-solid-svg-icons";
import { useContext, useState } from "react";
import { createSearchParams, useNavigate } from "react-router-dom";
import UserContext from "../../Contexts/User/UserContext";

interface IUserParam {
    url: string;
    onThrowError: (msgErro: string) => void;
    onSuccess: (msgSuccess: string) => void;
};

export default function UserForm(param: IUserParam) {

    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [confirmPassword, setConfirmPassword] = useState<string>("");

    const authContext = useContext(AuthContext);
    const userContext = useContext(UserContext);

    let navigate = useNavigate();

    return (
        <>

            <Card>
                <Card.Header>
                    <h3 className="text-center">User registration</h3>
                </Card.Header>
                <Card.Body>
                    <Form>
                        <Form.Group as={Row} className="mb-3">
                            <Form.Label column sm="2">Name:</Form.Label>
                            <Col sm="10">
                                <InputGroup>
                                    <InputGroup.Text><FontAwesomeIcon icon={faUser} fixedWidth /></InputGroup.Text>
                                    <Form.Control type="text"
                                        placeholder="Your name"
                                        value={userContext.user?.name}
                                        onChange={(e) => {
                                            userContext.setUser({
                                                ...userContext.user,
                                                name: e.target.value
                                            });
                                        }} />
                                </InputGroup>
                            </Col>
                        </Form.Group>
                        <Form.Group as={Row} className="mb-3">
                            <Form.Label column sm="2">Email:</Form.Label>
                            <Col sm="10">
                                <InputGroup>
                                    <InputGroup.Text><FontAwesomeIcon icon={faEnvelope} fixedWidth /></InputGroup.Text>
                                    <Form.Control type="text"
                                        placeholder="Your email"
                                        value={userContext.user?.email}
                                        onChange={(e) => {
                                            userContext.setUser({
                                                ...userContext.user,
                                                email: e.target.value
                                            });
                                        }} />
                                </InputGroup>
                            </Col>
                        </Form.Group>
                        <Form.Group as={Row} className="mb-3">
                            <Form.Label column sm="2">Password:</Form.Label>
                            <Col sm="10">
                                <InputGroup>
                                    <InputGroup.Text><FontAwesomeIcon icon={faLock} fixedWidth /></InputGroup.Text>
                                    <Form.Control type="password"
                                        placeholder="Your password"
                                        value={userContext.user?.password}
                                        onChange={(e) => {
                                            userContext.setUser({
                                                ...userContext.user,
                                                password: e.target.value
                                            });
                                        }} />
                                </InputGroup>
                            </Col>
                        </Form.Group>
                        <Form.Group as={Row} className="mb-3">
                            <Form.Label column sm="2">Confirm:</Form.Label>
                            <Col sm="10">
                                <InputGroup>
                                    <InputGroup.Text><FontAwesomeIcon icon={faLock} fixedWidth /></InputGroup.Text>
                                    <Form.Control type="password"
                                        placeholder="Confirm your password"
                                        value={confirmPassword}
                                        onChange={(e) => {
                                            setConfirmPassword(e.target.value);
                                        }} />
                                </InputGroup>
                            </Col>
                        </Form.Group>
                        <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                            <Button variant="danger" onClick={() => {
                                navigate({
                                    pathname: "/account/login",
                                    search: createSearchParams({
                                        returnUrl: param.url
                                    }).toString()
                                });
                            }}><FontAwesomeIcon icon={faUserAlt} fixedWidth />SignIn</Button>
                            <Button variant="success" onClick={async (e) => {
                                if (!userContext.user?.name) {
                                    param.onThrowError("Name is empty");
                                    return;
                                }
                                if (!userContext.user?.email) {
                                    param.onThrowError("Email is empty");
                                    return;
                                }
                                if (userContext.user?.password != confirmPassword) {
                                    param.onThrowError("Password and confirmation are different");
                                    return;
                                }
                                let ret = await userContext.insert(userContext.user);
                                if (ret.sucesso) {
                                    param.onSuccess(ret.mensagemSucesso);
                                }
                                else {
                                    param.onThrowError(ret.mensagemErro);
                                }
                            }}
                                disabled={userContext.loadingUpdate}
                            > {userContext.loadingUpdate ? "Loading..." : "Next"}
                                <FontAwesomeIcon icon={faArrowRight} fixedWidth />
                            </Button>
                        </div>
                    </Form>
                </Card.Body>
            </Card>
        </>
    );
}