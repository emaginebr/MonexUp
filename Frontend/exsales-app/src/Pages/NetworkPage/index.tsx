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
import AuthContext from "../../Contexts/Auth/AuthContext";
import NetworkContext from "../../Contexts/Network/NetworkContext";
import UserContext from "../../Contexts/User/UserContext";
import Skeleton from "react-loading-skeleton";
import NetworkFooter from "./NetworkFooter";
import { MessageToastEnum } from "../../DTO/Enum/MessageToastEnum";
import MessageToast from "../../Components/MessageToast";
import PlansInThreeColumnsPart from "./PlansInThreeColumnsPart";

export default function NetworkPage() {

    let navigate = useNavigate();

    let { networkSlug } = useParams();

    const authContext = useContext(AuthContext);
    const networkContext = useContext(NetworkContext);

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
        networkContext.getUserNetworkBySlug(networkSlug).then((retUserNetwork) => {
            if (!retUserNetwork.sucesso) {
                throwError(retUserNetwork.mensagemErro);
            }
        });
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
            </Container>
            <PlansInThreeColumnsPart />
            <NetworkFooter />
        </>
    );
}