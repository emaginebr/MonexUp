import { useContext, useEffect, useState } from "react";
import Col from "react-bootstrap/esm/Col";
import Container from "react-bootstrap/esm/Container";
import Row from "react-bootstrap/esm/Row";
import { Link, useNavigate, useParams } from "react-router-dom";
import AuthContext from "../../Contexts/Auth/AuthContext";
import NetworkContext from "../../Contexts/Network/NetworkContext";
import UserContext from "../../Contexts/User/UserContext";
import Skeleton from "react-loading-skeleton";
import { MessageToastEnum } from "../../DTO/Enum/MessageToastEnum";
import MessageToast from "../../Components/MessageToast";
import PlanPart from "../NetworkPage/PlanPart";
import ProfilePart from "./ProfilePart";
import NetworkFooter from "../NetworkPage/NetworkFooter";
import ProductListPart from "./ProductListPart";
import ProductContext from "../../Contexts/Product/ProductContext";
import ProductSearchParam from "../../DTO/Domain/ProductSearchParam";

export default function SellerPage() {

    //let navigate = useNavigate();

    let { networkSlug, sellerSlug } = useParams();

    const authContext = useContext(AuthContext);
    const networkContext = useContext(NetworkContext);
    const userContext = useContext(UserContext);
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

    const searchProducts = (pageNum: number) => {
        let param: ProductSearchParam;
        param = {
            ...param,
            networkId: 0,
            userId: 0,
            userSlug: sellerSlug,
            keyword: "",
            onlyActive: true,
            pageNum: pageNum
        };
        productContext.search(param).then((ret) => {
            if (!ret.sucesso) {
                throwError(ret.mensagemErro);
            }
        });
    };

    useEffect(() => {
        /*
        authContext.loadUserSession().then((authRet) => {
            if (authRet.sucesso && networkSlug) {
                networkContext.getSellerBySlug(networkSlug, sellerSlug).then((ret) => {
                    if (!ret.sucesso) {
                        throwError(ret.mensagemErro);
                    }
                });
            }
        });
        */
        if (networkSlug) {
            networkContext.getSellerBySlug(networkSlug, sellerSlug).then((ret) => {
                if (!ret.sucesso) {
                    throwError(ret.mensagemErro);
                }
            });
        }
        else {
            userContext.getBySlug(sellerSlug).then((ret) => {
                if (!ret.sucesso) {
                    throwError(ret.mensagemErro);
                }
            });
            searchProducts(1);
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
            <ProfilePart
                loading={networkContext.loadingSeller}
                user={networkSlug ? networkContext.seller?.user : userContext.user}
                userNetwork={networkContext.seller}
            />
            <hr />
            {networkSlug ?
                <PlanPart />
                :
                <ProductListPart
                    loading={productContext.loadingSearch}
                    sellerSlug={sellerSlug}
                    ProductResult={productContext.searchResult}
                    onChangePage={(pageNum) => searchProducts(pageNum)}
                />
            }
        </>
    );
}