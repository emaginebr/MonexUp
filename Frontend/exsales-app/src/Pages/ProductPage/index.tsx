import { useContext, useEffect, useState } from "react";
import Col from "react-bootstrap/esm/Col";
import Container from "react-bootstrap/esm/Container";
import Row from "react-bootstrap/esm/Row";
import { Link, useNavigate, useParams } from "react-router-dom";
import ReactQuill from "react-quill";
import {
    Editor,
    Frame,
    Element,
    useEditor,
    useNode,
} from "@craftjs/core";
import "react-quill/dist/quill.snow.css";
import { CustomToolbar } from "../../Components/CustomToolbar";
import ProductContext from "../../Contexts/Product/ProductContext";
import { MessageToastEnum } from "../../DTO/Enum/MessageToastEnum";
import MessageToast from "../../Components/MessageToast";
import NetworkContext from "../../Contexts/Network/NetworkContext";
import Skeleton from "react-loading-skeleton";
import AuthContext from "../../Contexts/Auth/AuthContext";
import { showFrequencyMax, showFrequencyMin } from "../../Components/Functions";
import ProductPayment from "./ProductPayment";

export default function ProductPage() {

    let navigate = useNavigate();

    let { networkSlug, productSlug } = useParams();

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
        /*
        networkContext.getUserNetworkBySlug(networkSlug).then((retUserNetwork) => {
            if (!retUserNetwork.sucesso) {
                throwError(retUserNetwork.mensagemErro);
            }
        });
        */
    }, []);

    // Componente editável com Bootstrap
    const HeaderText = () => {
        const {
            connectors: { connect, drag },
            actions: { setProp },
            props,
        } = useNode((node) => ({
            props: node.data.props,
        }));

        const { query } = useEditor();

        const [editorContent, setEditorContent] = useState(props.html || "");

        useEffect(() => {
            setProp((props: any) => (props.html = editorContent));
        }, [editorContent, setProp]);

        const handleSave = () => {
            const json = query.serialize();
        };

        return (
            <div ref={(ref) => connect(drag(ref))} className="p-3 bg-light">
                <CustomToolbar onSave={handleSave} />
                <ReactQuill
                    theme="snow"
                    value={editorContent}
                    onChange={setEditorContent}
                    modules={{
                        toolbar: {
                            container: "#custom-toolbar",
                        },
                    }}
                    formats={[
                        "header",
                        "bold",
                        "italic",
                        "underline",
                        "size",
                        "link",
                        "clean",
                    ]}
                />
            </div>
        );

    };

    HeaderText.craft = {
        props: { html: "<h2>Minha Rede Principal</h2><p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum</p>" },
        displayName: "HeaderText",
    };

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
                                        <h2 className="display-2 mb-0 text-center">
                                            {networkContext.loading ? <Skeleton /> : networkContext.network?.name}
                                        </h2>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col md="12">
                                        {networkContext.editMode ?
                                            <Editor resolver={{ HeaderText }}>
                                                <Frame>
                                                    <Element is="div" canvas>
                                                        <HeaderText />
                                                    </Element>
                                                </Frame>
                                            </Editor>
                                            :
                                            <div>
                                                <h2>Minha Rede Principal</h2><p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum</p>
                                            </div>
                                        }
                                    </Col>
                                </Row>
                                <hr />
                                <h1>{productContext.product?.name}</h1>
                                <p dangerouslySetInnerHTML={{__html: productContext.product?.description}}></p>
                            </Col>
                            <Col md={4}>
                                <div className="card">
                                    <div className="card-header">
                                        <h4 className="my-0">Credit Card Payment</h4>
                                    </div>
                                    <div className="card-body text-center">
                                        <ProductPayment productSlug={productSlug} />
                                        {/*
                                        <h5 className="card-title">
                                            <span className="display-4"><b>$ {productContext.product?.price}</b></span>
                                            <span className="lead">/{showFrequencyMin(productContext.product?.frequency)}</span>
                                        </h5>

                                        <div className="card-text my-4 lc-block">
                                            <div>
                                                <ul className="list-unstyled">
                                                    <li>{showFrequencyMax(productContext.product?.frequency)}</li>
                                                </ul>
                                            </div>
                                        </div>
                                        */}
                                    </div>
                                </div>
                            </Col>
                        </Row>

                    </Col>
                </Row>
            </Container>
        </>
    );
}