import { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Pagination from "react-bootstrap/Pagination";
import Spinner from "react-bootstrap/Spinner";
import NetworkContext from "../../Contexts/Network/NetworkContext";
import ProductContext from "../../Contexts/Product/ProductContext";
import AuthContext from "../../Contexts/Auth/AuthContext";
import OrderContext from "../../Contexts/Order/OrderContext";
import MessageToast from "../../Components/MessageToast";
import { MessageToastEnum } from "../../DTO/Enum/MessageToastEnum";
import ProductSearchParam from "../../DTO/Domain/ProductSearchParam";
import StorefrontCard from "./StorefrontCard";
import EmptyState from "./EmptyState";
import SimpleLoginForm, { SimpleLoginResult } from "./SimpleLoginForm";
import DonationAmountForm from "./DonationAmountForm";
import PixModalContainer, { PixCustomer } from "./PixModalContainer";
import { StorefrontProductInfo, isDonation, isOpenDonation } from "./types";

type PageState = "loading" | "ready" | "unavailable" | "seller_not_found";

export default function StorefrontPage() {
    const { t } = useTranslation();
    const { networkSlug, sellerSlug } = useParams<{ networkSlug: string; sellerSlug: string }>();

    const networkContext = useContext(NetworkContext);
    const productContext = useContext(ProductContext);
    const authContext = useContext(AuthContext);
    const orderContext = useContext(OrderContext);

    const [pageState, setPageState] = useState<PageState>("loading");

    const [toastShow, setToastShow] = useState<boolean>(false);
    const [toastMsg, setToastMsg] = useState<string>("");

    const [pendingProductId, setPendingProductId] = useState<number | null>(null);
    const [selectedProduct, setSelectedProduct] = useState<StorefrontProductInfo | null>(null);
    const [pendingAmount, setPendingAmount] = useState<number | null>(null);

    const [donationFormOpen, setDonationFormOpen] = useState<boolean>(false);
    const [loginOpen, setLoginOpen] = useState<boolean>(false);
    const [pixOpen, setPixOpen] = useState<boolean>(false);
    const [pixCustomer, setPixCustomer] = useState<PixCustomer | null>(null);

    const showError = (msg: string) => {
        setToastMsg(msg);
        setToastShow(true);
    };

    const searchProducts = (pageNum: number) => {
        const param: ProductSearchParam = {
            networkSlug,
            userSlug: sellerSlug,
            keyword: "",
            onlyActive: true,
            pageNum,
        };
        return productContext.search(param);
    };

    useEffect(() => {
        let cancelled = false;
        (async () => {
            setPageState("loading");
            const netRet = await networkContext.getBySlug(networkSlug);
            if (cancelled) return;
            if (!netRet.sucesso) {
                setPageState("unavailable");
                return;
            }
            const sellerRet = await networkContext.getSellerBySlug(networkSlug, sellerSlug);
            if (cancelled) return;
            if (!sellerRet.sucesso) {
                setPageState("seller_not_found");
                return;
            }
            const searchRet = await searchProducts(1);
            if (cancelled) return;
            if (!searchRet.sucesso) {
                showError(searchRet.mensagemErro || t("storefront_action_error"));
            }
            setPageState("ready");
        })();
        return () => { cancelled = true; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [networkSlug, sellerSlug]);

    const finalizeCheckout = async (product: StorefrontProductInfo, user: SimpleLoginResult, amount: number) => {
        setPendingProductId(product.productId);
        const ret = await orderContext.createPixPayment(
            product.slug,
            user.documentId,
            networkSlug,
            sellerSlug,
        );
        setPendingProductId(null);
        if (!ret.sucesso) {
            showError(ret.mensagemErro || t("storefront_action_error"));
            return;
        }
        setPixCustomer({
            name: user.name,
            email: user.email,
            documentId: user.documentId,
            cellphone: "",
        });
        setPendingAmount(amount);
        setPixOpen(true);
    };

    const handleAction = (product: StorefrontProductInfo) => {
        setSelectedProduct(product);
        if (isDonation(product) && isOpenDonation(product)) {
            setDonationFormOpen(true);
            return;
        }
        setPendingAmount(product.price);
        setLoginOpen(true);
    };

    const handleDonationConfirm = (amount: number) => {
        setDonationFormOpen(false);
        setPendingAmount(amount);
        setLoginOpen(true);
    };

    const handleLoginSuccess = (user: SimpleLoginResult) => {
        setLoginOpen(false);
        if (!selectedProduct) return;
        const amount = pendingAmount ?? selectedProduct.price;
        void finalizeCheckout(selectedProduct, user, amount);
    };

    const renderPagination = () => {
        const result = productContext.searchResult;
        if (!result || result.pageCount <= 1) return null;
        const items = [];
        const total = result.pageCount;
        for (let i = 1; i <= total; i++) {
            items.push(
                <Pagination.Item
                    key={i}
                    active={i === result.pageNum}
                    onClick={() => searchProducts(i)}
                >
                    {i}
                </Pagination.Item>
            );
        }
        return (
            <div className="d-flex justify-content-center mt-4">
                <Pagination>{items}</Pagination>
            </div>
        );
    };

    const renderProducts = () => {
        if (productContext.loadingSearch) {
            return (
                <div className="text-center py-5">
                    <Spinner animation="border" role="status" />
                    <p className="text-muted mt-2">{t("storefront_loading")}</p>
                </div>
            );
        }
        const products = (productContext.searchResult?.products || []) as StorefrontProductInfo[];
        if (products.length === 0) {
            return <EmptyState title={t("storefront_empty")} />;
        }
        return (
            <>
                <Row className="g-3">
                    {products.map((product) => (
                        <Col key={product.productId} xs={12} sm={6} lg={4}>
                            <StorefrontCard
                                product={product}
                                onAction={handleAction}
                                disabled={pendingProductId === product.productId}
                            />
                        </Col>
                    ))}
                </Row>
                {renderPagination()}
            </>
        );
    };

    const session = authContext.sessionInfo;
    const loginPrefill = session ? { name: session.name, email: session.email } : undefined;

    return (
        <>
            <MessageToast
                dialog={MessageToastEnum.Error}
                showMessage={toastShow}
                messageText={toastMsg}
                onClose={() => setToastShow(false)}
            />
            <Container className="py-4">
                {pageState === "loading" && (
                    <div className="text-center py-5">
                        <Spinner animation="border" role="status" />
                    </div>
                )}
                {pageState === "unavailable" && (
                    <EmptyState title={t("storefront_unavailable")} />
                )}
                {pageState === "seller_not_found" && (
                    <EmptyState title={t("storefront_seller_not_found")} />
                )}
                {pageState === "ready" && (
                    <>
                        <h2 className="mb-4">{networkContext.seller?.user?.name || t("storefront_title")}</h2>
                        {renderProducts()}
                    </>
                )}
            </Container>

            <DonationAmountForm
                show={donationFormOpen}
                product={selectedProduct}
                onConfirm={handleDonationConfirm}
                onClose={() => setDonationFormOpen(false)}
            />

            <SimpleLoginForm
                show={loginOpen}
                onClose={() => setLoginOpen(false)}
                onSuccess={handleLoginSuccess}
                onError={(msg) => showError(msg)}
                prefill={loginPrefill}
                skipRegister={!!session}
            />

            {pixCustomer && selectedProduct && (
                <PixModalContainer
                    open={pixOpen}
                    productId={selectedProduct.productId}
                    productName={selectedProduct.name}
                    amount={pendingAmount ?? selectedProduct.price}
                    customer={pixCustomer}
                    onClose={() => setPixOpen(false)}
                    onError={(msg) => showError(msg)}
                />
            )}
        </>
    );
}
