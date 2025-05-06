import { useContext, useEffect, useState } from "react";
import Col from "react-bootstrap/esm/Col";
import Container from "react-bootstrap/esm/Container";
import Row from "react-bootstrap/esm/Row";
import Form from 'react-bootstrap/Form';
import AuthContext from "../../Contexts/Auth/AuthContext";
import Button from "react-bootstrap/esm/Button";
import Card from 'react-bootstrap/Card';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAddressBook, faArrowLeft, faArrowRight, faBitcoinSign, faCalendar, faCalendarAlt, faCancel, faClose, faDollar, faEnvelope, faEthernet, faIdCard, faLock, faPercent, faPhone, faSave, faSignInAlt, faTrash, faUser } from '@fortawesome/free-solid-svg-icons';
import Table from "react-bootstrap/esm/Table";
import { Link, useNavigate, useParams } from "react-router-dom";
import InputGroup from 'react-bootstrap/InputGroup';
import UserContext from "../../Contexts/User/UserContext";
import MessageToast from "../../Components/MessageToast";
import Moment from 'moment';
import { MessageToastEnum } from "../../DTO/Enum/MessageToastEnum";
import { CustomToolbar } from "../../Components/CustomToolbar";
import ReactQuill from "react-quill";
import NetworkContext from "../../Contexts/Network/NetworkContext";
import ProductContext from "../../Contexts/Product/ProductContext";
import ProductInfo from "../../DTO/Domain/ProductInfo";
import { ProductStatusEnum } from "../../DTO/Enum/ProductStatusEnum";

export default function ProductEditPage() {

    const authContext = useContext(AuthContext);
    const networkContext = useContext(NetworkContext);
    const productContext = useContext(ProductContext);

    let { productId } = useParams();

    const [insertMode, setInsertMode] = useState<boolean>(false);

    const [dialog, setDialog] = useState<MessageToastEnum>(MessageToastEnum.Error);
    const [showMessage, setShowMessage] = useState<boolean>(false);
    const [messageText, setMessageText] = useState<string>("");

    let navigate = useNavigate();
    Moment.locale('en');

    const throwError = (message: string) => {
        setDialog(MessageToastEnum.Error)
        setMessageText(message);
        setShowMessage(true);
    };
    const showSuccessMessage = (message: string) => {
        setDialog(MessageToastEnum.Success)
        setMessageText(message);
        setShowMessage(true);
    };


    //const [editorContent, setEditorContent] = useState("");

    //const handleSave = () => {};

useEffect(() => {
        let product: ProductInfo = null;
        product = {
            ...product,
            productId: 0,
            networkId: networkContext.userNetwork?.networkId,
            name: "",
            slug: "",
            description: "",
            frequency: 0,
            limit: 0,
            price: 0,
            status: ProductStatusEnum.Active
        };
        productContext.setProduct(product);
        if (authContext.sessionInfo) {
            let productIdNum: number = parseInt(productId);
            if (productIdNum > 0) {
                productContext.getById(productIdNum).then((ret) => {
                    if (ret.sucesso) {
                        setInsertMode(false);
                        productContext.setProduct(ret.product);
                    }
                    else {
                        setInsertMode(true);
                        //productContext.setProduct(product);
                    }
                });
            }
            else {
                setInsertMode(true);
                //productContext.setProduct(product);
            }
        }
        else {
            setInsertMode(true);
            //productContext.setProduct(product);
        }
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
                    <Col md="12">
                        <Card>
                            <Card.Header>
                                <h3 className="text-center">Edit Product</h3>
                            </Card.Header>
                            <Card.Body>
                                <Form>
                                    <div className="text-center mb-3">
                                        Registration is not required to make swaps, but you can do so anyway to access your transaction history.
                                    </div>
                                    <Form.Group as={Row} className="mb-3">
                                        <Form.Label column sm="2">Name:</Form.Label>
                                        <Col sm="5">
                                            <InputGroup>
                                                <InputGroup.Text><FontAwesomeIcon icon={faUser} fixedWidth /></InputGroup.Text>
                                                <Form.Control type="text" size="lg"
                                                    placeholder="Your Product name"
                                                    value={productContext.product?.name}
                                                    onChange={(e) => {
                                                        productContext.setProduct({
                                                            ...productContext.product,
                                                            name: e.target.value
                                                        });
                                                    }} />
                                            </InputGroup>
                                        </Col>
                                        <Form.Label column sm="1">Price:</Form.Label>
                                        <Col sm="4">
                                            <InputGroup>
                                                <InputGroup.Text><FontAwesomeIcon icon={faDollar} fixedWidth /></InputGroup.Text>
                                                <Form.Control type="number" size="lg"
                                                    placeholder="Product Price"
                                                    value={productContext.product?.price}
                                                    onChange={(e) => {
                                                        productContext.setProduct({
                                                            ...productContext.product,
                                                            price: parseFloat(e.target.value)
                                                        });
                                                    }} />
                                            </InputGroup>
                                        </Col>
                                    </Form.Group>
                                    <Form.Group as={Row} className="mb-3">
                                        <Form.Label column sm="2">Frequency:</Form.Label>
                                        <Col sm="5">
                                            <InputGroup>
                                                <InputGroup.Text><FontAwesomeIcon icon={faCalendar} fixedWidth /></InputGroup.Text>
                                                <Form.Select size="lg" 
                                                    value={productContext.product?.frequency}
                                                    onChange={(e) => {
                                                        //alert(e.target.value);
                                                        productContext.setProduct({
                                                            ...productContext.product,
                                                            frequency: parseInt(e.target.value)
                                                        });
                                                    }} 
                                                >
                                                    <option value={0}>Just only one time</option>
                                                    <option value={7}>Weekly</option>
                                                    <option value={30}>Monthly</option>
                                                    <option value={60}>Bimonthly</option>
                                                    <option value={90}>Quarterly</option>
                                                    <option value={180}>Half-yearly</option>
                                                    <option value={365}>Annually</option>
                                                </Form.Select>
                                            </InputGroup>
                                        </Col>
                                        <Form.Label column sm="1">Status:</Form.Label>
                                        <Col sm="4">
                                            <InputGroup>
                                                <InputGroup.Text><FontAwesomeIcon icon={faPercent} fixedWidth /></InputGroup.Text>
                                                <Form.Select size="lg" 
                                                    value={productContext.product?.status}
                                                    onChange={(e) => {
                                                        productContext.setProduct({
                                                            ...productContext.product,
                                                            status: parseInt(e.target.value)
                                                        });
                                                    }} >
                                                    <option value={ProductStatusEnum.Active}>Active</option>
                                                    <option value={ProductStatusEnum.Inactive}>Inactive</option>
                                                    <option value={ProductStatusEnum.Expired}>Expired</option>
                                                </Form.Select>
                                            </InputGroup>
                                        </Col>
                                    </Form.Group>
                                    <div className="py-3">
                                    <CustomToolbar />
                                    <ReactQuill
                                        theme="snow"
                                        value={productContext.product?.description}
                                        placeholder="Inform your product description"
                                        onChange={(value) => {
                                            productContext.setProduct({
                                                ...productContext.product,
                                                description: value
                                            });
                                        }}
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
                                    <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                                        <Button variant="danger" size="lg" onClick={() => {
                                            navigate("/admin/products");
                                        }}><FontAwesomeIcon icon={faArrowLeft} fixedWidth /> Back</Button>
                                        <Button variant="success" size="lg" onClick={async (e) => {
                                            if (insertMode) {
                                                productContext.setProduct({
                                                    ...productContext.product,
                                                    productId: 0,
                                                    networkId: networkContext.userNetwork?.networkId
                                                });
                                                let ret = await productContext.insert(productContext.product);
                                                if (ret.sucesso) {
                                                    showSuccessMessage(ret.mensagemSucesso);
                                                    //alert(userContext.user?.id);
                                                }
                                                else {
                                                    throwError(ret.mensagemErro);
                                                }
                                            }
                                            else {
                                                let ret = await productContext.update(productContext.product);
                                                if (ret.sucesso) {
                                                    //alert(userContext.user?.id);
                                                    showSuccessMessage(ret.mensagemSucesso);
                                                }
                                                else {
                                                    throwError(ret.mensagemErro);
                                                }
                                            }
                                        }}
                                            disabled={productContext.loadingUpdate}
                                        >
                                            {productContext.loadingUpdate ? "Loading..." :
                                                <>
                                                    <FontAwesomeIcon icon={faSave} fixedWidth />&nbsp;Save
                                                </>}
                                        </Button>
                                    </div>
                                </Form>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </>
    );
}