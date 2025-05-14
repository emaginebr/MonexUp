import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useNavigate, useParams } from "react-router-dom";
import Container from "react-bootstrap/esm/Container";
import Row from "react-bootstrap/esm/Row";
import Col from "react-bootstrap/esm/Col";
import { faBoltLightning, faLock, faFileUpload, faCalendarAlt, faFileWord, faBoxOpen, faLockOpen, faUserDoctor } from '@fortawesome/free-solid-svg-icons';
import { faBitcoin } from "@fortawesome/free-brands-svg-icons";
import Card from "react-bootstrap/esm/Card";
import CardHeader from "react-bootstrap/esm/CardHeader";
import CardTitle from "react-bootstrap/esm/CardTitle";
import CardBody from "react-bootstrap/esm/CardBody";
import CardText from "react-bootstrap/esm/CardText";
import Button from "react-bootstrap/esm/Button";
import { useContext, useEffect } from "react";
import AuthContext from "../../Contexts/Auth/AuthContext";
import NetworkContext from "../../Contexts/Network/NetworkContext";
import ProductContext from "../../Contexts/Product/ProductContext";
import { showFrequencyMax, showFrequencyMin } from "../../Components/Functions";
import Skeleton from "react-loading-skeleton";
import NetworkInfo from "../../DTO/Domain/NetworkInfo";
import EditMode from "../../Components/EditMode";

interface IHeroParam {
    loading: boolean,
    network: NetworkInfo,
    isEditing: boolean
};

export default function HeroPart(param: IHeroParam) {

    let navigate = useNavigate();

    const authContext = useContext(AuthContext);

    let { networkSlug } = useParams();

    return (
        <>
            <div className="container-fluid px-4 py-5 my-5 text-center">
                <div className="lc-block mb-4">
                    <div>
                        <h2 className="display-2 fw-bold">
                            {param.loading ?
                                <Skeleton />
                                :
                                <>
                                    <EditMode.Text name="HERO_TITLE" isEditing={param.isEditing} />
                                </>
                            }

                        </h2>
                    </div>
                </div>
                <div className="lc-block col-lg-6 mx-auto mb-5">
                    <div>
                        <p className="lead">
                            {param.loading ?
                                <Skeleton />
                                :
                                <>
                                    <EditMode.Text name="HERO_SLOGAN" isEditing={param.isEditing} />
                                </>
                            }
                        </p>
                    </div>
                </div>

                <div className="lc-block d-grid gap-2 d-sm-flex justify-content-sm-center mb-5">
                    <EditMode.Btn
                        name="HERO_LINK_TO_PLANS"
                        className="btn btn-primary btn-lg px-4 gap-3"
                        isEditing={param.isEditing}
                        href="#plans"
                    />
                    <EditMode.Btn
                        name="HERO_BECOME_A_SELLER"
                        variant="outline-secondary"
                        size="lg"
                        className="px-4"
                        isEditing={param.isEditing}
                        onClick={(e) => {
                            e.preventDefault();
                            if (authContext.sessionInfo) {
                                navigate("/" + networkSlug + "/request-access");
                            }
                            else {
                                navigate("/" + networkSlug + "/new-seller");
                            }
                        }}
                    />
                </div>
                <div className="lc-block d-grid gap-2 d-sm-flex justify-content-sm-center">
                    <EditMode.Img
                        name="HERO_IMAGE"
                        className="img-fluid"
                        defaultSrc="https://lclibrary.b-cdn.net/starters/wp-content/uploads/sites/15/2021/10/undraw_going_up_ttm5.svg"
                        style={{width: "auto", height: "783px"}}
                        isEditing={param.isEditing}
                    />
                    {/*
                    <img className="img-fluid" src="https://lclibrary.b-cdn.net/starters/wp-content/uploads/sites/15/2021/10/undraw_going_up_ttm5.svg" width="" height="783" />
                    */}
                </div>
            </div>
        </>
    );
}