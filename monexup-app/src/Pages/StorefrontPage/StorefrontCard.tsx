import { useTranslation } from "react-i18next";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import { StorefrontProductInfo, isDonation } from "./types";

interface StorefrontCardProps {
    product: StorefrontProductInfo;
    onAction: (product: StorefrontProductInfo) => void;
    disabled?: boolean;
}

const fmtBrl = (value: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value || 0);

const truncate = (text: string, max = 110) => {
    if (!text) return "";
    return text.length > max ? text.substring(0, max).trim() + "..." : text;
};

export default function StorefrontCard({ product, onAction, disabled }: StorefrontCardProps) {
    const { t } = useTranslation();
    const donation = isDonation(product);
    const label = donation ? t("btn_donate") : t("btn_buy");
    const variant = donation ? "success" : "primary";

    return (
        <Card className="h-100 shadow-sm">
            <div
                style={{
                    aspectRatio: "1 / 1",
                    overflow: "hidden",
                    background: "#f8fafc",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                {product.imageUrl ? (
                    <Card.Img
                        loading="lazy"
                        variant="top"
                        src={product.imageUrl}
                        alt={product.name}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                ) : (
                    <span className="text-muted small">—</span>
                )}
            </div>
            <Card.Body className="d-flex flex-column">
                <Card.Title as="h5" className="mb-1">
                    {product.name}
                </Card.Title>
                <Card.Text className="text-muted small flex-grow-1">
                    {truncate(product.description)}
                </Card.Text>
                <div className="d-flex justify-content-between align-items-center mt-2">
                    <strong className="fs-5">{fmtBrl(product.price)}</strong>
                    <Button
                        variant={variant}
                        onClick={() => onAction(product)}
                        disabled={disabled}
                    >
                        {label}
                    </Button>
                </div>
            </Card.Body>
        </Card>
    );
}
