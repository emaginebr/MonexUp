import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import Button from "react-bootstrap/Button";
import { StorefrontProductInfo } from "./types";

interface DonationAmountFormProps {
    show: boolean;
    product: StorefrontProductInfo | null;
    onConfirm: (amount: number) => void;
    onClose: () => void;
}

export default function DonationAmountForm({ show, product, onConfirm, onClose }: DonationAmountFormProps) {
    const { t } = useTranslation();
    const min = product?.minimumDonationAmount ?? 0;
    const [amount, setAmount] = useState<string>("");
    const [error, setError] = useState<string>("");

    useEffect(() => {
        if (show) {
            setAmount(min > 0 ? String(min) : "");
            setError("");
        }
    }, [show, min]);

    const handleSubmit = () => {
        const value = parseFloat(amount.replace(",", "."));
        if (!amount || isNaN(value) || value <= 0) {
            setError(t("donation_amount_required"));
            return;
        }
        if (min > 0 && value < min) {
            setError(t("donation_min_warning", { min: min.toFixed(2) }));
            return;
        }
        onConfirm(value);
    };

    return (
        <Modal show={show} onHide={onClose} centered>
            <Modal.Header closeButton>
                <Modal.Title>{product?.name}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
                    <Form.Group className="mb-2">
                        <Form.Label>{t("donation_amount_label")}</Form.Label>
                        <InputGroup>
                            <InputGroup.Text>R$</InputGroup.Text>
                            <Form.Control
                                type="text"
                                inputMode="decimal"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                autoFocus
                            />
                        </InputGroup>
                        {min > 0 && (
                            <Form.Text className="text-muted">
                                {t("donation_min_warning", { min: min.toFixed(2) })}
                            </Form.Text>
                        )}
                    </Form.Group>
                    {error && <div className="alert alert-danger py-2 mb-2 small">{error}</div>}
                    <div className="d-grid">
                        <Button type="submit" variant="success">
                            {t("btn_donate")}
                        </Button>
                    </div>
                </Form>
            </Modal.Body>
        </Modal>
    );
}
