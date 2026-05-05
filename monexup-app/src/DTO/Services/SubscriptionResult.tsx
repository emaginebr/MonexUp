import OrderInfo from "../Domain/OrderInfo";

export interface PixQRCodeInfo {
    invoiceId: number;
    brCode: string;
    brCodeBase64: string;
    expiredAt: string;
}

export default interface PixPaymentResult {
    sucesso: boolean;
    mensagem: string;
    order: OrderInfo;
    qrCode: PixQRCodeInfo;
}
