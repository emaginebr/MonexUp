import Button from 'react-bootstrap/esm/Button';
import Modal from 'react-bootstrap/Modal';
import { useTranslation } from "react-i18next";

interface IConfirmModalParam {
    show: boolean;
    title: string;
    message: string;
    onClose: () => void;
    onConfirm: () => void;
    loading?: boolean;
    confirmVariant?: string;
}

export default function ConfirmModal(param: IConfirmModalParam) {
    const { t } = useTranslation();

    return (
        <Modal show={param.show} onHide={param.onClose}>
            <Modal.Header closeButton>
                <Modal.Title>{param.title}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p>{param.message}</p>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={param.onClose}>
                    {t('cancel')}
                </Button>
                <Button
                    variant={param.confirmVariant || "danger"}
                    disabled={param.loading}
                    onClick={param.onConfirm}
                >
                    {param.loading ? t('loading') : t('confirm')}
                </Button>
            </Modal.Footer>
        </Modal>
    );
}
