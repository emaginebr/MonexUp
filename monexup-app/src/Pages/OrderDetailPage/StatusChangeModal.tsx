import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";

import { OrderStatusEnum } from "../../DTO/Enum/OrderStatusEnum";

/**
 * StatusChangeModal — plain react-bootstrap dialog used inside /admin/orders/:id.
 * Kept intentionally simple (no scoped CSS): admin surface already provides
 * the visual chrome, so this modal focuses on a single select + save.
 */

interface Props {
    show: boolean;
    currentStatus: OrderStatusEnum;
    submitting: boolean;
    onClose: () => void;
    onSubmit: (newStatus: OrderStatusEnum) => void;
}

export default function StatusChangeModal({
    show,
    currentStatus,
    submitting,
    onClose,
    onSubmit,
}: Props) {
    const { t } = useTranslation();

    const [selected, setSelected] = useState<OrderStatusEnum>(currentStatus);

    // Reseed the local selection each time the modal reopens so the
    // dropdown always reflects the currently-loaded order's status.
    useEffect(() => {
        if (show) setSelected(currentStatus);
    }, [show, currentStatus]);

    const handleClose = () => {
        if (submitting) return;
        onClose();
    };

    const handleSave = () => {
        onSubmit(selected);
    };

    const statusOptions: { value: OrderStatusEnum; labelKey: string }[] = [
        { value: OrderStatusEnum.Incoming, labelKey: "order_status_incoming" },
        { value: OrderStatusEnum.Active, labelKey: "order_status_active" },
        { value: OrderStatusEnum.Suspended, labelKey: "order_status_suspended" },
        { value: OrderStatusEnum.Finished, labelKey: "order_status_finished" },
        { value: OrderStatusEnum.Expired, labelKey: "order_status_expired" },
    ];

    return (
        <Modal show={show} onHide={handleClose} centered backdrop="static">
            <Modal.Header closeButton={!submitting}>
                <Modal.Title>
                    {t("orderDetailPage.change_status_modal_title", "Alterar status da assinatura")}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form.Group controlId="order-status-select">
                    <Form.Label>
                        {t("orderDetailPage.change_status_label", "Novo status")}
                    </Form.Label>
                    <Form.Select
                        value={selected}
                        onChange={(e) => setSelected(Number(e.target.value) as OrderStatusEnum)}
                        disabled={submitting}
                    >
                        {statusOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {t(opt.labelKey)}
                            </option>
                        ))}
                    </Form.Select>
                </Form.Group>
            </Modal.Body>
            <Modal.Footer>
                <Button
                    variant="outline-secondary"
                    onClick={handleClose}
                    disabled={submitting}
                >
                    {t("orderDetailPage.change_status_cancel", "Cancelar")}
                </Button>
                <Button
                    onClick={handleSave}
                    disabled={submitting}
                    style={{
                        backgroundColor: "#f97316",
                        borderColor: "#f97316",
                        color: "#fff",
                        fontWeight: 600,
                    }}
                >
                    {submitting
                        ? t("loading")
                        : t("orderDetailPage.change_status_save", "Salvar")}
                </Button>
            </Modal.Footer>
        </Modal>
    );
}
