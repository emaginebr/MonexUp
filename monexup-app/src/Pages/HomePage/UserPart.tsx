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
import { useTranslation } from "react-i18next";
import UserInfo from "../../DTO/Domain/UserInfo";

interface IUserParam {
    loading: boolean,
    users: UserInfo[]
}

export default function UserPart(param: IUserParam) {

    const { t } = useTranslation();

    return (
        <>
            <section className="mnx-section" style={{ background: 'var(--mnx-bg-page)' }}>
                <Container className="mb-3">
                    <Row>
                        <Col md={12} className="text-center">
                            <h2 className="mnx-section-title">{t('home_userpart_title')}</h2>
                        </Col>
                    </Row>
                    <Row className="pt-4">
                        {param.loading ?
                            <>
                                {[1, 2, 3, 4]?.map((index) => {
                                    return (
                                        <Col md={3} className="text-center py-4">
                                            <div className="lc-block">
                                                <Skeleton circle={true} className="mb-3" style={{ width: "10rem", height: "10rem" }} />
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
                                {param.users?.map((user) => {
                                    return (
                                        <Col md={3} className="text-center py-4">
                                            <div className="lc-block">
                                                {user.imageUrl ?
                                                    <Link to={"/@/" + user.slug}>
                                                        <img src={user.imageUrl} className="rounded-circle mb-3" style={{ width: "10rem", height: "10rem" }} />
                                                    </Link>
                                                    :
                                                    <Link to={"/@/" + user.slug}>
                                                        <FontAwesomeIcon icon={faUserCircle} size="8x" className="rounded-circle mb-3" style={{ height: "10rem" }} />
                                                    </Link>
                                                }
                                                <h5>
                                                    <Link to={"/@/" + user.slug}>
                                                        <strong>{user.name}</strong>
                                                    </Link>
                                                </h5>
                                            </div>
                                            <div className="lc-block mt-2">
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
            </section>
        </>
    );
}