import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useNavigate, useParams } from "react-router-dom";
import Container from "react-bootstrap/esm/Container";
import Row from "react-bootstrap/esm/Row";
import Col from "react-bootstrap/esm/Col";
import { faBoltLightning, faLock, faFileUpload, faCalendarAlt, faFileWord, faBoxOpen, faLockOpen, faUserDoctor } from '@fortawesome/free-solid-svg-icons';
import { faBitcoin } from "@fortawesome/free-brands-svg-icons";
import Card from "react-bootstrap/esm/Card";
import CardHeader from "react-bootstrap/esm/CardHeader";
import CardTitle from "react-bootstrap/esm/CardTitle";
import CardBody from "react-bootstrap/esm/CardBody";
import CardText from "react-bootstrap/esm/CardText";
import Button from "react-bootstrap/esm/Button";
import { useContext, useEffect } from "react";
import AuthContext from "../../Contexts/Auth/AuthContext";
import NetworkContext from "../../Contexts/Network/NetworkContext";
import ProductContext from "../../Contexts/Product/ProductContext";
import { showFrequencyMax, showFrequencyMin } from "../../Components/Functions";
import Skeleton from "react-loading-skeleton";

export default function PlansInThreeColumnsPart() {

    let navigate = useNavigate();

    let { networkSlug } = useParams();

    const productContext = useContext(ProductContext);

    useEffect(() => {
        productContext.listByNetworkSlug(networkSlug).then((ret) => {
            if (!ret.sucesso) {
                alert(ret.mensagemErro);
            }
        });
    }, []);

    return (
        <>
            <section id="network" className="py-5">
                <Container className="pb-5">
                    <Row>
                        <Col md={12} className="text-center">
                            <div className="lc-block mb-4">
                                <h2 className="display-2 mb-0"><b>Plans</b></h2>
                                <p> Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc et metus id<br /> ligula malesuada placerat sit amet quis enim.</p>
                            </div>
                        </Col>
                    </Row>
                    <Row md={4} className="text-center">
                        {productContext.loadingList ?
                            <>
                                {[1, 2, 3].map((index) => {
                                    return (
                                        <Col lg={4} md={6} className="text-dark my-2">
                                            <Card>
                                                <CardHeader>
                                                    <h4 className="my-0"><Skeleton /></h4>
                                                </CardHeader>
                                                <CardBody>
                                                    <CardTitle>
                                                        <span className="display-4"><Skeleton /></span>
                                                        <span className="lead"><Skeleton /></span>
                                                    </CardTitle>
                                                    <CardText className="my-4 lc-block">
                                                        <div>
                                                            <ul className="list-unstyled">
                                                                <li><Skeleton /></li>
                                                            </ul>
                                                        </div>
                                                    </CardText>
                                                    <div className="d-grid lc-block">
                                                        <Button variant="primary" size="lg" className="btn-outline-primary" disabled>Order Now</Button>
                                                    </div>
                                                </CardBody>
                                            </Card>
                                        </Col>
                                    );
                                })}
                            </>
                            :
                            productContext.products.map((product) => {
                                return (
                                    <Col lg={4} md={6} className="text-dark my-2">
                                        <Card>
                                            <CardHeader>
                                                <h4 className="my-0">{product.name}</h4>
                                            </CardHeader>
                                            <CardBody>
                                                <CardTitle>
                                                    <span className="display-4"><b>${product.price}</b></span>
                                                    <span className="lead">/{showFrequencyMin(product.frequency)}</span>
                                                </CardTitle>
                                                <CardText className="my-4 lc-block">
                                                    <div>
                                                        <ul className="list-unstyled">
                                                            <li>{showFrequencyMax(product.frequency)}</li>
                                                        </ul>
                                                    </div>
                                                </CardText>
                                                <div className="d-grid lc-block">
                                                    <Button variant="primary" size="lg" className="btn-outline-primary" onClick={(e) => {
                                                        navigate("/@/" + networkSlug + "/" + product.slug);
                                                    }}>Order Now</Button>
                                                </div>
                                            </CardBody>
                                        </Card>
                                    </Col>
                                );
                            })
                        }
                    </Row>
                </Container>
            </section>
        </>
    );
}