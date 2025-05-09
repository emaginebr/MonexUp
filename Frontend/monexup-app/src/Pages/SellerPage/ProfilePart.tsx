import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useNavigate, useParams } from "react-router-dom";
import Container from "react-bootstrap/esm/Container";
import Row from "react-bootstrap/esm/Row";
import Col from "react-bootstrap/esm/Col";
import { faBoltLightning, faLock, faFileUpload, faCalendarAlt, faFileWord, faBoxOpen, faLockOpen, faUserDoctor, faUserCircle } from '@fortawesome/free-solid-svg-icons';
import { faBitcoin, faWhatsapp } from "@fortawesome/free-brands-svg-icons";
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
import { showFrequencyMax, showFrequencyMin, showProfile } from "../../Components/Functions";
import Skeleton from "react-loading-skeleton";
import UserInfo from "../../DTO/Domain/UserInfo";
import UserProfileInfo from "../../DTO/Domain/UserProfileInfo";
import UserNetworkInfo from "../../DTO/Domain/UserNetworkInfo";

interface IProfilePartParam {
    loading: boolean;
    user?: UserInfo;
    userNetwork?: UserNetworkInfo;
};

export default function ProfilePart(param: IProfilePartParam) {

    //let navigate = useNavigate();

    //const networkContext = useContext(NetworkContext);

    //let { networkSlug } = useParams();

    return (
        <>
            <div className="position-relative">
                <div style={{ position: "absolute", top: "0px", width: "100%" }}>
                    <div className="container text-end">
                        <h1 className="mt-4 text-white" style={{ textShadow: "2px 2px 5px rgba(0, 0, 0, 0.7)" }}>
                            {param.loading ?
                                <Skeleton width={400} />
                                :
                                param.user?.phones &&
                                <>
                                    <FontAwesomeIcon icon={faWhatsapp} /> &nbsp;{param.user?.phones[0].phone}
                                </>
                            }
                        </h1>
                    </div>
                </div>
                <div className="container-fluid g-0">
                    <img style={{ maxHeight: "400px", objectFit: "cover" }} className="img-fluid w-100 min-vh-25 min-vh-md-50 mb-n7" src="https://images.unsplash.com/photo-1457388497438-b12745cbc24f?crop=entropy&amp;cs=tinysrgb&amp;fit=crop&amp;fm=webp&amp;ixid=M3wzNzg0fDB8MXxzZWFyY2h8NjJ8fHdvbWFuJTIwc2l0dGluZyUyMG9uJTIwZ3JhcyUyMFdhbGtpbmclMjBhcm91bmR8ZW58MHwwfHx8MTcwMzA5MTYyNXww&amp;ixlib=rb-4.0.3&amp;q=80&amp;w=1080&amp;h=768" />
                </div>
                <div className="container position-relative" style={{ marginTop: "-15rem", zIndex: 500 }}>
                    <div className="row">
                        <div className="col col-md-8">
                            <FontAwesomeIcon icon={faUserCircle} size="10x" style={{ float: "left", paddingRight: "1rem", textShadow: "2px 2px 5px rgba(0, 0, 0, 0.7)" }} />
                            <h1 className="display-4 mt-4 text-white" style={{ textShadow: "2px 2px 5px rgba(0, 0, 0, 0.7)" }}>{
                                param.loading ?
                                    <Skeleton width={400} />
                                    :
                                    param.user?.name
                            }</h1>
                            {param.userNetwork &&
                                <h3 className="mt-2">{
                                    param.loading ?
                                        <Skeleton width={400} />
                                        :
                                        <>
                                            &nbsp;{showProfile(param.userNetwork)}
                                        </>
                                }</h3>
                            }
                        </div>
                    </div>
                </div>
            </div>
            <div className="container p-5 bg-body position-relative rounded" style={{ marginTop: "-4rem" }}>
                <div className="row">
                    <div className="col-md-4 text-center align-self-center">
                        <div className="lc-block border-lg-end border-2 ">
                            <div>
                                <p className="display-4 text-secondary">WHY?</p>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-8">
                        <div className="lc-block ">
                            <div>
                                <p className="display-4">Think different and create a wonderful kind of digital agency.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}