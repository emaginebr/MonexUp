import React, { useContext, useEffect, useState } from 'react';
import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/esm/Button';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import { Link, useNavigate } from 'react-router-dom';
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
import InvoiceContext from '../Contexts/Invoice/InvoiceContext';
import StatementSearchParam from '../DTO/Domain/StatementSearchParam';


export default function Menu() {

  const [showAlert, setShowAlert] = useState<boolean>(true);

  const [showMessage, setShowMessage] = useState<boolean>(false);
  const [messageText, setMessageText] = useState<string>("");

  const throwError = (message: string) => {
    setMessageText(message);
    setShowMessage(true);
  };

  const showRoleText = (role: UserRoleEnum) => {
    switch (role) {
      case UserRoleEnum.NoRole:
        return (
          <>
            <FontAwesomeIcon icon={faCancel} fixedWidth />&nbsp;No role
          </>
        );
        break;
      case UserRoleEnum.User:
        return (
          <>
            <FontAwesomeIcon icon={faUser} fixedWidth />&nbsp;User
          </>
        );
        break;
      case UserRoleEnum.Seller:
        return (
          <>
            <FontAwesomeIcon icon={faUserMd} fixedWidth />&nbsp;Seller
          </>
        );
        break;
      case UserRoleEnum.NetworkManager:
        return (
          <>
            <FontAwesomeIcon icon={faUserGroup} fixedWidth />&nbsp;Network Manager
          </>
        );
        break;
      case UserRoleEnum.Administrator:
        return (
          <>
            <FontAwesomeIcon icon={faUserGear} fixedWidth />&nbsp;Adminstrator
          </>
        );
        break;
    }
  };

  let navigate = useNavigate();

  const authContext = useContext(AuthContext);
  const networkContext = useContext(NetworkContext);
  const invoiceContext = useContext(InvoiceContext);

  useEffect(() => {
    authContext.loadUserSession().then((authRet) => {
      if (authRet.sucesso) {
        networkContext.listByUser().then((ret) => {
          if (!ret.sucesso) {
            throwError(ret.mensagemErro);
          }
        });
      }
    });
  }, []);
  return (
    <>
      <MessageToast
        dialog={MessageToastEnum.Error}
        showMessage={showMessage}
        messageText={messageText}
        onClose={() => setShowMessage(false)}
      ></MessageToast>
      <Navbar expand="lg" className="navbar-dark bg-dark mb-3 border-bottom">
        <Container>
          <Link className='navbar-brand' to="/">{process.env.REACT_APP_PROJECT_NAME}</Link>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Link className='nav-link' to="/"><FontAwesomeIcon icon={faHome} fixedWidth /> Home</Link>
              {!authContext.sessionInfo &&
                <Link className='nav-link' to="/new-seller"><FontAwesomeIcon icon={faUser} fixedWidth /> Seja um representante</Link>
              }
              <Link className='nav-link' to="/network"><FontAwesomeIcon icon={faBuilding} fixedWidth /> Crie sua rede</Link>
              {authContext.sessionInfo && networkContext.currentRole >= UserRoleEnum.Seller &&
                <NavDropdown title={
                  <>
                    <FontAwesomeIcon icon={faUserGroup} />&nbsp;My Network
                  </>
                } id="basic-nav-dropdown">
                  {networkContext.currentRole == UserRoleEnum.NetworkManager &&
                    <>
                      <NavDropdown.ItemText className='small text-center'>Network</NavDropdown.ItemText>
                      <NavDropdown.Item onClick={() => {
                        navigate("/admin/network");
                      }}><FontAwesomeIcon icon={faCog} fixedWidth />&nbsp;Preferences</NavDropdown.Item>
                      <NavDropdown.Item onClick={() => {
                        navigate("/admin/team-structure");
                      }}><FontAwesomeIcon icon={faUserCog} fixedWidth />&nbsp;Team Structure</NavDropdown.Item>
                      <NavDropdown.Item onClick={() => {
                        navigate("/admin/teams");
                      }}><FontAwesomeIcon icon={faUserGroup} fixedWidth />&nbsp;Teams</NavDropdown.Item>
                      <NavDropdown.Divider />
                    </>
                  }
                  {networkContext.currentRole >= UserRoleEnum.Seller &&
                    <>
                      <NavDropdown.ItemText className='small text-center'>Finances</NavDropdown.ItemText>
                      <NavDropdown.Item onClick={() => {
                        navigate("/admin/orders");
                      }}><FontAwesomeIcon icon={faFileWord} fixedWidth />&nbsp;Orders</NavDropdown.Item>
                      <NavDropdown.Item onClick={() => {
                        navigate("/admin/invoices");
                      }}><FontAwesomeIcon icon={faDollar} fixedWidth />&nbsp;Invoices</NavDropdown.Item>
                      <NavDropdown.Item onClick={() => {
                        navigate("/admin/products");
                      }}><FontAwesomeIcon icon={faBox} fixedWidth />&nbsp;Products</NavDropdown.Item>
                    </>
                  }
                </NavDropdown>
              }
            </Nav>
          </Navbar.Collapse>
          <Navbar.Collapse>

            <Nav className="ms-auto justify-content-end">
              {authContext.sessionInfo &&
                <>
                  {networkContext.userNetworks &&
                    <NavDropdown title={
                      <>
                        {networkContext.userNetwork ?
                          <>
                            <FontAwesomeIcon icon={faUserGroup} />&nbsp;{networkContext.userNetwork?.network.name}
                          </>
                          :
                          <>
                            <FontAwesomeIcon icon={faCancel} />&nbsp;No network selected
                          </>
                        }
                      </>
                    } id="basic-nav-dropdown">
                      <NavDropdown.ItemText className='small'>Select network to connect</NavDropdown.ItemText>
                      <NavDropdown.Divider />
                      {networkContext.userNetworks.map((network) => {
                        return (
                          <NavDropdown.Item onClick={() => {
                            networkContext.setUserNetwork(network);
                            navigate("/admin/dashboard");
                          }}><FontAwesomeIcon icon={faUserGroup} />&nbsp;{network.network.name}</NavDropdown.Item>
                        )
                      })}
                      <NavDropdown.Divider />
                      <NavDropdown.Item onClick={() => {
                        navigate("/network/search");
                      }}><FontAwesomeIcon icon={faSearch} />&nbsp;Buscar uma rede</NavDropdown.Item>
                    </NavDropdown>
                  }
                  <NavDropdown title={showRoleText(networkContext.currentRole)} id="basic-nav-dropdown">
                    <NavDropdown.ItemText className='small'>Select the chain you will connect to</NavDropdown.ItemText>
                    <NavDropdown.Divider />
                    {networkContext.userNetwork?.role >= UserRoleEnum.User &&
                      <NavDropdown.Item onClick={(e) => {
                        e.preventDefault();
                        networkContext.setCurrentRole(UserRoleEnum.User);
                        navigate("/admin/dashboard");
                      }}>{showRoleText(UserRoleEnum.User)}</NavDropdown.Item>
                    }
                    {networkContext.userNetwork?.role >= UserRoleEnum.Seller &&
                      <NavDropdown.Item onClick={async (e) => {
                        e.preventDefault();
                        networkContext.setCurrentRole(UserRoleEnum.Seller);
                        var retBal = await invoiceContext.getBalance();
                        if (!retBal.sucesso) {
                          throwError(retBal.mensagemErro);
                        }
                        var retABal = await invoiceContext.getAvailableBalance();
                        if (!retABal.sucesso) {
                          throwError(retBal.mensagemErro);
                        }
                        let param: StatementSearchParam;
                        param = {
                          ...param,
                          userId: networkContext.userNetwork.userId,
                          pageNum: 1
                        };
                        var ret = await invoiceContext.searchStatement(param);
                        if (!ret.sucesso) {
                          throwError(ret.mensagemErro);
                        }
                        navigate("/admin/dashboard");
                      }}>{showRoleText(UserRoleEnum.Seller)}</NavDropdown.Item>
                    }
                    {networkContext.userNetwork?.role >= UserRoleEnum.NetworkManager &&
                      <NavDropdown.Item onClick={async (e) => {
                        e.preventDefault();
                        networkContext.setCurrentRole(UserRoleEnum.NetworkManager);
                        var retBal = await invoiceContext.getBalance(networkContext.userNetwork.networkId);
                        if (!retBal.sucesso) {
                          throwError(retBal.mensagemErro);
                        }

                        let param: StatementSearchParam;
                        param = {
                          ...param,
                          networkId: networkContext.userNetwork.networkId,
                          pageNum: 1
                        };
                        var ret = await invoiceContext.searchStatement(param);
                        if (!ret.sucesso) {
                          throwError(ret.mensagemErro);
                        }

                        navigate("/admin/dashboard");
                      }}>{showRoleText(UserRoleEnum.NetworkManager)}</NavDropdown.Item>
                    }
                    {networkContext.userNetwork?.role >= UserRoleEnum.Administrator &&
                      <NavDropdown.Item onClick={(e) => {
                        e.preventDefault();
                        networkContext.setCurrentRole(UserRoleEnum.Administrator);
                        navigate("/admin/dashboard");
                      }}>{showRoleText(UserRoleEnum.Administrator)}</NavDropdown.Item>
                    }
                  </NavDropdown>
                  {/*
                  <NavDropdown title={
                    <>
                      <FontAwesomeIcon icon={faCheckCircle} />&nbsp;Edição Ativada
                    </>
                  } id="basic-nav-dropdown">
                    <NavDropdown.ItemText className='small'>Ative o modo de edição para alterar as páginas da rede</NavDropdown.ItemText>
                    <NavDropdown.Divider />
                    <NavDropdown.Item><FontAwesomeIcon icon={faCheckCircle} />&nbsp;Ativar Edição</NavDropdown.Item>
                    <NavDropdown.Item><FontAwesomeIcon icon={faCircle} />&nbsp;Desativar Edição</NavDropdown.Item>
                  </NavDropdown>
                  */}
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
                      navigate("/account/edit-account");
                    }}><FontAwesomeIcon icon={faPencil} fixedWidth /> Edit Account</NavDropdown.Item>
                    <NavDropdown.Item onClick={async () => {
                      navigate("/account/change-password");
                    }}><FontAwesomeIcon icon={faLock} fixedWidth /> Change Password</NavDropdown.Item>
                    <NavDropdown.Divider />
                    <NavDropdown.Item onClick={async () => {
                      let ret = authContext.logout();
                      if (!ret.sucesso) {
                        throwError(ret.mensagemErro);
                      }
                      navigate(0);
                    }}><FontAwesomeIcon icon={faClose} fixedWidth /> Logout</NavDropdown.Item>
                  </NavDropdown>
                  :
                  <>
                    <Nav.Item>
                      <Button variant="danger" onClick={async () => {
                        navigate("/account/login");
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
        <Container>
          <Alert key="danger" variant="danger" onClose={() => setShowAlert(false)} dismissible>
            <FontAwesomeIcon icon={faWarning} /> This is a <strong>trial version</strong>, do not make payments with your real data.
          </Alert>
        </Container>
      }
    </>
  );
}
