import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link, useNavigate } from "react-router-dom";
import Container from "react-bootstrap/esm/Container";
import Row from "react-bootstrap/esm/Row";
import Col from "react-bootstrap/esm/Col";
import { faBoltLightning, faLock, faFileUpload, faCalendarAlt, faFileWord, faBoxOpen, faLockOpen, faUserDoctor, faBuilding } from '@fortawesome/free-solid-svg-icons';
import { faBitcoin } from "@fortawesome/free-brands-svg-icons";
import { useContext, useEffect } from "react";
import NetworkContext from "../../Contexts/Network/NetworkContext";
import Skeleton from "react-loading-skeleton";

export default function NetworkPart() {

    let navigate = useNavigate();

    const networkContext = useContext(NetworkContext);

    useEffect(() => {
        networkContext.listAll().then((ret) => {
            if (!ret.sucesso) {
                alert(ret.mensagemErro);
            }
        });
    }, []);

    return (
        <>
            <section id="how-it-works" className="bg-light py-5">
                <Container>
                    <Row className="mb-4">
                        <Col md={12} className="text-center">
                            <h4 className="display-2 mb-0">TOP 4 Networks</h4>
                        </Col>
                    </Row>
                    <Row>
                        {networkContext.loading ?
                            [1,2,3,4].map((index) => {
                                return (
                                    <Col lg={3} sm={6} className="mb-4">
                                        <div className="lc-block">
                                            <h3 className="my-sm-3 mb-2">
                                                <FontAwesomeIcon icon={faBuilding} />
                                                <span className="ms-2"><Skeleton /></span>
                                            </h3>
                                            <div>
                                                <p><Skeleton /></p>
                                            </div>
                                        </div>
                                    </Col>
                                )
                            })
                            :
                            networkContext.networks.map((network) => {
                                return (
                                    <Col lg={3} sm={6} className="mb-4">
                                        <div className="lc-block">
                                            <h3 className="my-sm-3 mb-2">
                                                <FontAwesomeIcon icon={faBuilding} />
                                                <span className="ms-2"><Link to={"/" + network.slug}>{network.name}</Link></span>
                                            </h3>
                                            <div>
                                                <p>
                                                    {network.qtdyUsers} affiliate sellers and&nbsp;
                                                    {network.maxUsers - network.qtdyUsers} open positions
                                                </p>
                                            </div>
                                        </div>
                                    </Col>
                                )
                            })
                        }
                    </Row>
                </Container>
            </section>
        </>
    );
}