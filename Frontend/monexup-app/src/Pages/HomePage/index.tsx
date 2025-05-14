import { useContext, useEffect, useState } from "react";
import AuthContext from "../../Contexts/Auth/AuthContext";
import Container from "react-bootstrap/esm/Container";
import Row from "react-bootstrap/esm/Row";
import Col from "react-bootstrap/esm/Col";
import Card from "react-bootstrap/esm/Card";
import Alert from 'react-bootstrap/Alert';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWarning, faPlus, faBurn, faFire, faSearch, faDollar, faClock, faBoltLightning, faLock, faFileUpload, faCalendar, faCalendarAlt, faFileWord, faBoxOpen, faSign, faLockOpen, faUserDoctor, faChartLine, faChartPie, faCoins } from '@fortawesome/free-solid-svg-icons';
import Button from "react-bootstrap/esm/Button";
import { Link, useNavigate } from "react-router-dom";
import { faBitcoin, faOpencart } from "@fortawesome/free-brands-svg-icons";
import CardHeader from "react-bootstrap/esm/CardHeader";
import CardTitle from "react-bootstrap/esm/CardTitle";
import CardBody from "react-bootstrap/esm/CardBody";
import CardText from "react-bootstrap/esm/CardText";
import Header from "./Header";
import Footer from "./Footer";
import Features from "./Features";
import Pricing from "./Pricing";
import NetworkPart from "./NetworkPart";
import UserPart from "./UserPart";
import UserContext from "../../Contexts/User/UserContext";
import NetworkContext from "../../Contexts/Network/NetworkContext";



export default function HomePage() {

    const authContext = useContext(AuthContext);
    const userContext = useContext(UserContext);
    const networkContext = useContext(NetworkContext);

    let navigate = useNavigate();

    useEffect(() => {
        userContext.list(3).then((ret) => {
            if (!ret.sucesso) {
                alert(ret.mensagemErro);
            }
        });
        networkContext.listAll().then((ret) => {
            if (!ret.sucesso) {
                alert(ret.mensagemErro);
            }
        });
    }, []);

    return (
        <>
            <Header />
            <Features />
            <NetworkPart 
                loading={networkContext.loading} 
                networks={networkContext.networks} 
            />
            <Pricing />
            <UserPart 
                loading={userContext.loadingList}
                users={userContext.users} 
            />
            <Footer />
        </>
    );

}