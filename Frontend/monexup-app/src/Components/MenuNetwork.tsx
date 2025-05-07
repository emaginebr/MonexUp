import React, { useContext, useEffect, useState } from 'react';
import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/esm/Button';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import { Link, useNavigate, useParams } from 'react-router-dom';
import AuthContext from '../Contexts/Auth/AuthContext';
import NavDropdown from 'react-bootstrap/NavDropdown';
import Alert from 'react-bootstrap/Alert';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWarning } from '@fortawesome/free-solid-svg-icons/faWarning'
import { faBitcoinSign, faBoltLightning, faBox, faBrazilianRealSign, faBuilding, faCancel, faCheck, faCheckCircle, faCircle, faCircleUser, faClose, faCog, faCoins, faDollar, faEthernet, faFileWord, faHome, faLock, faPencil, faSearch, faSignInAlt, faUser, faUserAlt, faUserCircle, faUserCog, faUserFriends, faUserGear, faUserGraduate, faUserGroup, faUserMd } from '@fortawesome/free-solid-svg-icons';
import MessageToast from './MessageToast';
import { MessageToastEnum } from '../DTO/Enum/MessageToastEnum';
import { UserRoleEnum } from '../DTO/Enum/UserRoleEnum';
import NetworkContext from '../Contexts/Network/NetworkContext';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';


export default function MenuNetwork() {

  const [showAlert, setShowAlert] = useState<boolean>(true);

  const [showMessage, setShowMessage] = useState<boolean>(false);
  const [messageText, setMessageText] = useState<string>("");

  const throwError = (message: string) => {
    setMessageText(message);
    setShowMessage(true);
  };

  let navigate = useNavigate();

  let { networkSlug, sellerSlug } = useParams();

  const authContext = useContext(AuthContext);
  const networkContext = useContext(NetworkContext);

  useEffect(() => {
    authContext.loadUserSession();
  }, []);
  return (
    <>
      <MessageToast
        dialog={MessageToastEnum.Error}
        showMessage={showMessage}
        messageText={messageText}
        onClose={() => setShowMessage(false)}
      ></MessageToast>
      <Navbar expand="lg" className="navbar-dark bg-dark">
        <Container>
          <Link className='navbar-brand' to={"/" + networkSlug}>
            {networkContext.loading ? <Skeleton width={140} /> : networkContext.network?.name}
          </Link>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Link className='nav-link' to={"/" + networkSlug}><FontAwesomeIcon icon={faHome} fixedWidth /> Home</Link>
              <Link className='nav-link' to={
                authContext.sessionInfo ?
                  sellerSlug ?
                    "/" + networkSlug + "/@/" + sellerSlug + "/request-access"
                    :
                    "/" + networkSlug + "/request-access"
                  :
                  sellerSlug ?
                    "/" + networkSlug + "/@/" + sellerSlug + "/new-seller"
                    :
                    "/" + networkSlug + "/new-seller"
              }><FontAwesomeIcon icon={faUser} fixedWidth /> Seja um representante</Link>
            </Nav>
          </Navbar.Collapse>
          <Navbar.Collapse>

            <Nav className="ms-auto justify-content-end">
              {authContext.sessionInfo && networkContext.currentRole >= UserRoleEnum.NetworkManager &&
                <>
                  <NavDropdown title={
                    <>
                      {networkContext.editMode ?
                        <><FontAwesomeIcon icon={faCheckCircle} />&nbsp;Edit Mode (On)</>
                        :
                        <><FontAwesomeIcon icon={faCircle} />&nbsp;Edit Mode (Off)</>
                      }
                    </>
                  } id="basic-nav-dropdown">
                    <NavDropdown.ItemText className='small'>Activate edit mode to change network pages</NavDropdown.ItemText>
                    <NavDropdown.Divider />
                    <NavDropdown.Item onClick={(e) => {
                      networkContext.setEditMode(true);
                    }}><FontAwesomeIcon icon={faCheckCircle} />&nbsp;Edit Mode (On)</NavDropdown.Item>
                    <NavDropdown.Item onClick={(e) => {
                      networkContext.setEditMode(false);
                    }}><FontAwesomeIcon icon={faCircle} />&nbsp;Edit Mode (Off)</NavDropdown.Item>
                  </NavDropdown>
                </>
              }
              {
                authContext.sessionInfo ?
                  <NavDropdown title={
                    <>
                      <FontAwesomeIcon icon={faCircleUser} />&nbsp;
                      <span>{authContext.sessionInfo.name}</span>
                    </>
                  } id="basic-nav-dropdown">
                    <NavDropdown.Item onClick={async () => {
                      navigate("/" + networkSlug + "/account/edit-account");
                    }}><FontAwesomeIcon icon={faPencil} fixedWidth /> Edit Account</NavDropdown.Item>
                    <NavDropdown.Item onClick={async () => {
                      navigate("/" + networkSlug + "/account/change-password");
                    }}><FontAwesomeIcon icon={faLock} fixedWidth /> Change Password</NavDropdown.Item>
                    <NavDropdown.Divider />
                    <NavDropdown.Item onClick={async () => {
                      let ret = authContext.logout();
                      if (!ret.sucesso) {
                        throwError(ret.mensagemErro);
                      }
                      navigate("/" + networkSlug);
                    }}><FontAwesomeIcon icon={faClose} fixedWidth /> Logout</NavDropdown.Item>
                  </NavDropdown>
                  :
                  <>
                    <Nav.Item>
                      <Button variant="danger" onClick={async () => {
                        navigate("/" + networkSlug + "/account/login");
                      }}>
                        <FontAwesomeIcon icon={faSignInAlt} fixedWidth /> Sign In
                      </Button>
                    </Nav.Item>
                  </>
              }
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      {showAlert &&
        <Container className="mt-3">
          <Alert key="danger" variant="danger" onClose={() => setShowAlert(false)} dismissible>
            <FontAwesomeIcon icon={faWarning} /> This is a <strong>trial version</strong>, do not make payments with your real data.
          </Alert>
        </Container>
      }
    </>
  );
}
