import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Col from "react-bootstrap/esm/Col";
import Container from "react-bootstrap/esm/Container";
import Row from "react-bootstrap/esm/Row";
import { faEnvelope, faUserCircle } from '@fortawesome/free-solid-svg-icons';
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import { Link, useNavigate, useParams } from "react-router-dom";
import { useContext, useEffect } from "react";
import NetworkContext from "../../Contexts/Network/NetworkContext";
import Skeleton from "react-loading-skeleton";
import { UserRoleEnum } from "../../DTO/Enum/UserRoleEnum";
import UserNetworkInfo from "../../DTO/Domain/UserNetworkInfo";
import UserAddressInfo from "../../DTO/Domain/UserAddressInfo";
import { showProfile } from "../../Components/Functions";

export default function TeamPart() {

    let navigate = useNavigate();

    let { networkSlug } = useParams();

    const networkContext = useContext(NetworkContext);

    useEffect(() => {
        networkContext.listByNetwork(networkSlug).then((ret) => {
            if (!ret.sucesso) {
                alert(ret.mensagemErro);
            }
        });
    }, []);

    const showDescription = (user: UserNetworkInfo) => {
        if (user.user?.addresses && user.user?.addresses.length > 0) {
            let address: UserAddressInfo = user.user.addresses[0];
            return address.city + "/" + address.state;
        }
        return "";
    };

    return (
        <>
            <Container className="mb-3">
                <Row>
                    <Col md={12} className="text-center">
                        <div className="lc-block mb-1">
                            <h2 className="display-2 mb-0"><b>Team</b></h2>
                            <p> Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc et metus id<br /> ligula malesuada placerat sit amet quis enim.</p>
                        </div>
                    </Col>
                </Row>
                <Row className="pt-4">
                    {networkContext.loadingTeam ?
                        <>
                            {[1, 2, 3]?.map((index) => {
                                return (
                                    <Col md={4} className="text-center py-4">
                                        <div className="lc-block">
                                            <Skeleton circle={true} style={{ width: "10vh", height: "10vh" }} />
                                            <h5><Skeleton /></h5>
                                            <small className="text-secondary"><Skeleton /></small>
                                        </div>
                                        <div className="lc-block mt-2 border-top">
                                            <a className="text-dark text-decoration-none" href="#">
                                                <FontAwesomeIcon icon={faEnvelope} />
                                            </a>
                                            &nbsp;
                                            <a className="text-dark text-decoration-none" href="#">
                                                <FontAwesomeIcon icon={faWhatsapp} />
                                            </a>
                                        </div>
                                    </Col>
                                );
                            })}
                        </>
                        :
                        <>
                            {networkContext.teams?.map((user) => {
                                return (
                                    <Col md={4} className="text-center py-4">
                                        <div className="lc-block">
                                            <Link to={"/" + networkSlug + "/@/" + user.user?.slug}>
                                                <FontAwesomeIcon icon={faUserCircle} size="5x" className="rounded-circle mb-3" style={{ height: "10vh" }} />
                                            </Link>
                                            <h5>
                                                <Link to={"/" + networkSlug + "/@/" + user.user?.slug}>
                                                    <strong>{user.user?.name}</strong>
                                                </Link>
                                            </h5>
                                            <small className="text-secondary" style={{ letterSpacing: "1px" }}>{showProfile(user)}</small>
                                        </div>
                                        <div className="lc-block mt-2 border-top">
                                            <a className="text-dark text-decoration-none" href="#">
                                                <FontAwesomeIcon icon={faEnvelope} />
                                            </a>
                                            &nbsp;
                                            <a className="text-dark text-decoration-none" href="#">
                                                <FontAwesomeIcon icon={faWhatsapp} />
                                            </a>
                                        </div>
                                    </Col>
                                );
                            })}
                        </>
                    }
                </Row>
            </Container>
        </>
    );
}