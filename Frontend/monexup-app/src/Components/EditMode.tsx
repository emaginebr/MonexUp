import Nav from 'react-bootstrap/Nav';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowDown, faArrowUp, faEdit, faImagePortrait, faPlus, faTrash, faUpload } from "@fortawesome/free-solid-svg-icons";
import { ReactNode, useState } from 'react';
import Button, { ButtonProps } from 'react-bootstrap/esm/Button';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import Row from 'react-bootstrap/esm/Row';
import Col from 'react-bootstrap/esm/Col';

enum WebsitePartEnum {
    HERO_PART_01 = "Hero 01",
    HERO_PART_02 = "Hero 02",
    PLAN_3_COLS = "Plans With 3 Columns",
    PRODUCT_LIST_WITH_3_COLS = "Product List With 3 Columns"
}

interface IEditModeProps {
    children: ReactNode;
    isEditing?: boolean;
};

interface IEditModeNewProps {
    isEditing?: boolean;
};

interface IEditModeTextProps {
    name: string;
    isEditing?: boolean;
};

interface IEditModeBtnProps extends ButtonProps {
    name: string;
    isEditing?: boolean;
};

interface IEditModeImgProps extends React.ButtonHTMLAttributes<HTMLImageElement> {
    name: string;
    defaultSrc: string;
    isEditing?: boolean;
};

interface IEditModeModalProps {
    show: boolean,
    onClose?: () => void
};

const New: React.FC<IEditModeNewProps> = ({ isEditing = true }) => {

    const [showModal, setShowModal] = useState<boolean>(false);

    if (!isEditing) {
        return <></>;
    }
    return (
        <>
            <EditModeModal show={showModal} onClose={() => setShowModal(false)} />
            <section className="editmode-new text-center">
                <a href="#" onClick={(e) => {
                    e.preventDefault();
                    setShowModal(true);
                }}><FontAwesomeIcon icon={faPlus} fixedWidth /> Click here to create a new website part</a>
            </section>
        </>
    )
};

const Text: React.FC<IEditModeTextProps> = ({ name, isEditing = true }) => {

    const [showModal, setShowModal] = useState<boolean>(false);

    if (!isEditing) {
        return <>{name}</>;
    }
    return (
        <>
            <EditModeTextModal show={showModal} onClose={() => setShowModal(false)} />
            <span className="editmode-text">{name}
                <a href="#" onClick={(e) => {
                    e.preventDefault();
                    setShowModal(true);
                }}><FontAwesomeIcon icon={faEdit} fixedWidth /></a></span>
        </>
    )
};

const Btn: React.FC<IEditModeBtnProps> = ({ name, isEditing = true, ...rest }) => {

    const [showModal, setShowModal] = useState<boolean>(false);

    if (!isEditing) {
        return (
            <Button {...rest}>{name}</Button>
        );
    }
    return (
        <>
            <EditModeTextModal show={showModal} onClose={() => setShowModal(false)} />
            <div className="editmode-text">
                <Button {...rest}>{name}</Button>
                <a href="#" onClick={(e) => {
                    e.preventDefault();
                    setShowModal(true);
                }}><FontAwesomeIcon icon={faEdit} fixedWidth /></a>
            </div>
        </>
    )
};

const Img: React.FC<IEditModeImgProps> = ({ name, defaultSrc, isEditing = true, ...rest }) => {

    const [showModal, setShowModal] = useState<boolean>(false);

    if (!isEditing) {
        return (
            <img src={defaultSrc} {...rest} />
        );
    }
    return (
        <>
            <EditModeUploadModal show={showModal} onClose={() => setShowModal(false)} />
            <div className="editmode-img">
                <Button variant='success'
                    className="editmode-upload-btn"
                    onClick={(e) => {
                        e.preventDefault();
                        setShowModal(true);
                    }}>
                    <FontAwesomeIcon icon={faUpload} fixedWidth />
                </Button>
                <img src={defaultSrc} {...rest} />
            </div>
        </>
    )
};

const EditModeModal = (param: IEditModeModalProps) => {

    return (
        <Modal show={param.show} onHide={() => param.onClose()}>
            <Modal.Header closeButton>
                <Modal.Title>Edit Web Part</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    <Form.Group className="mb-3">
                        <Form.Label>Website Part:</Form.Label>
                        <InputGroup>
                            <InputGroup.Text>
                                <FontAwesomeIcon icon={faImagePortrait} fixedWidth />
                            </InputGroup.Text>
                            <Form.Select size="lg">
                                {Object.entries(WebsitePartEnum).map(([key, value]) => (
                                    <option key={value} value={key}>{value}</option>
                                ))}
                            </Form.Select>
                        </InputGroup>
                    </Form.Group>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={() => param.onClose()}>
                    Close
                </Button>
                <Button variant="primary"
                    onClick={async (e) => {
                        e.preventDefault();
                    }}>
                    Save
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

const EditModeTextModal = (param: IEditModeModalProps) => {

    return (
        <Modal show={param.show} onHide={() => param.onClose()}>
            <Modal.Header closeButton>
                <Modal.Title>Change Text</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    <Form.Group className="mb-3">
                        <InputGroup>
                            <InputGroup.Text>
                                <img src={process.env.PUBLIC_URL + "/flags/gb.svg"} style={{ width: "21px", height: "21px" }} />
                            </InputGroup.Text>
                            <Form.Control type="text" placeholder="Inglês" />
                        </InputGroup>
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <InputGroup>
                            <InputGroup.Text>
                                <img src={process.env.PUBLIC_URL + "/flags/br.svg"} style={{ width: "21px", height: "21px" }} />
                            </InputGroup.Text>
                            <Form.Control type="text" placeholder="Português" />
                        </InputGroup>
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <InputGroup>
                            <InputGroup.Text>
                                <img src={process.env.PUBLIC_URL + "/flags/es.svg"} style={{ width: "21px", height: "21px" }} />
                            </InputGroup.Text>
                            <Form.Control type="text" placeholder="Espanhol" />
                        </InputGroup>
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <InputGroup>
                            <InputGroup.Text>
                                <img src={process.env.PUBLIC_URL + "/flags/fr.svg"} style={{ width: "21px", height: "21px" }} />
                            </InputGroup.Text>
                            <Form.Control type="text" placeholder="Francês" />
                        </InputGroup>
                    </Form.Group>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={() => param.onClose()}>
                    Close
                </Button>
                <Button variant="primary"
                    onClick={async (e) => {
                        e.preventDefault();
                    }}>
                    Save
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

const EditModeUploadModal = (param: IEditModeModalProps) => {

    return (
        <Modal show={param.show} onHide={() => param.onClose()}>
            <Modal.Header closeButton>
                <Modal.Title>Upload Image</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    <Form.Group className="mb-3">
                        <Form.Control type="file" />
                    </Form.Group>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={() => param.onClose()}>
                    Close
                </Button>
                <Button variant="primary"
                    onClick={async (e) => {
                        e.preventDefault();
                    }}>
                    Upload
                </Button>
            </Modal.Footer>
        </Modal>
    );
};


const EditMode: React.FC<IEditModeProps> & {
    New: React.FC<IEditModeNewProps>,
    Text: React.FC<IEditModeTextProps>,
    Btn: React.FC<IEditModeBtnProps>,
    Img: React.FC<IEditModeImgProps>
} = ({ children = "", isEditing = true }) => {

    const [showModal, setShowModal] = useState<boolean>(false);

    if (!isEditing) {
        return <>{children}</>;
    }

    return (
        <>
            <EditModeModal show={showModal} onClose={() => setShowModal(false)} />
            <section className="editmode">
                <div className="flex-column editmode-bar">
                    <div className="lc-block text-center mb-1">
                        <Button variant="primary">
                            <FontAwesomeIcon icon={faArrowUp} fixedWidth />
                        </Button>
                    </div>
                    <div className="lc-block text-center mb-1">
                        <Button variant="success" onClick={(e) => {
                            e.preventDefault();
                            setShowModal(true);
                        }}>
                            <FontAwesomeIcon icon={faEdit} fixedWidth />
                        </Button>
                    </div>
                    <div className="lc-block text-center mb-1">
                        <Button variant="danger">
                            <FontAwesomeIcon icon={faTrash} fixedWidth />
                        </Button>
                    </div>
                    <div className="lc-block text-center mb-1">
                        <Button variant="primary">
                            <FontAwesomeIcon icon={faArrowDown} fixedWidth />
                        </Button>
                    </div>
                </div>
                {children}
            </section>
        </>
    );
}

EditMode.New = New;
EditMode.Text = Text;
EditMode.Btn = Btn;
EditMode.Img = Img;

export default EditMode;