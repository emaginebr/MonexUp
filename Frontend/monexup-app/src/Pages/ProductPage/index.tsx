import { useContext, useEffect, useState } from "react";
import Col from "react-bootstrap/esm/Col";
import Container from "react-bootstrap/esm/Container";
import Row from "react-bootstrap/esm/Row";
import { Link, useNavigate, useParams } from "react-router-dom";
import ProductContext from "../../Contexts/Product/ProductContext";
import { MessageToastEnum } from "../../DTO/Enum/MessageToastEnum";
import MessageToast from "../../Components/MessageToast";
import NetworkContext from "../../Contexts/Network/NetworkContext";
import Skeleton from "react-loading-skeleton";
import AuthContext from "../../Contexts/Auth/AuthContext";
import SubscriptionForm from "./SubscriptionForm";
import NetworkFooter from "../NetworkPage/NetworkFooter";

export default function ProductPage() {

    let navigate = useNavigate();

    let { networkSlug, sellerSlug, productSlug } = useParams();

    const authContext = useContext(AuthContext);
    const networkContext = useContext(NetworkContext);
    const productContext = useContext(ProductContext);

    const [dialog, setDialog] = useState<MessageToastEnum>(MessageToastEnum.Error);
    const [showMessage, setShowMessage] = useState<boolean>(false);
    const [messageText, setMessageText] = useState<string>("");

    const throwError = (message: string) => {
        setDialog(MessageToastEnum.Error);
        setMessageText(message);
        setShowMessage(true);
    };
    const showSuccessMessage = (message: string) => {
        setDialog(MessageToastEnum.Success);
        setMessageText(message);
        setShowMessage(true);
    };

    useEffect(() => {
        authContext.loadUserSession();
        networkContext.getBySlug(networkSlug).then((ret) => {
            if (!ret.sucesso) {
                throwError(ret.mensagemErro);
            }
        });
        productContext.getBySlug(productSlug).then((retProd) => {
            if (!retProd.sucesso) {
                throwError(retProd.mensagemErro);
            }
        });
    }, []);



    return (
        <>
            <MessageToast
                dialog={dialog}
                showMessage={showMessage}
                messageText={messageText}
                onClose={() => setShowMessage(false)}
            ></MessageToast>
            <Container>
                <Row>
                    <Col md="12" className="py-4">
                        <Row>
                            <Col md={8}>
                                <Row>
                                    <Col md="12">
                                        <h2 className="display-2 mb-5 text-center">
                                            {networkContext.loading ? <Skeleton /> : networkContext.network?.name}
                                        </h2>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col md="12">
                                        {networkContext.editMode ?
                                            <div>
                                                <h2>Minha Rede Principal</h2><p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum</p>
                                            </div>
                                            :
                                            <div>
                                                <h2>Minha Rede Principal</h2><p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum</p>
                                            </div>
                                        }
                                    </Col>
                                </Row>
                                <hr />
                                <h1>{productContext.product?.name}</h1>
                                <p dangerouslySetInnerHTML={{ __html: productContext.product?.description }}></p>
                            </Col>
                            <Col md={4}>
                                <SubscriptionForm productSlug={productSlug} sellerSlug={sellerSlug} />
                            </Col>
                        </Row>

                    </Col>
                </Row>
            </Container>
            <NetworkFooter />
        </>
    );
}