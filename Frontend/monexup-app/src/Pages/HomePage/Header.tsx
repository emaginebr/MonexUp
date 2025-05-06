import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBoltLightning, faTextWidth, faWarning } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from "react-router-dom";
import Button from "react-bootstrap/esm/Button";

export default function Header() {

    let navigate = useNavigate();

    return (
        <>
            <div className="container py-5 my-4 bg-light text-dark text-center">
                <div className="row justify-content-center mb-4">

                    <div className="lc-block col-xl-8">
                        <h1 className="display-2 fw-bold">
                            <span className="text-danger">Conecte. Venda. Cresça</span> Faça parte, aqui suas vendas impulsionam o sucesso de <span className="text-danger">todos</span>.
                        </h1>
                    </div>

                </div>
                <div className="row justify-content-center mb-4">

                    <div className="lc-block col-xl-6 lh-lg">
                        <div>
                            <p>No MonexUp, você se junta a redes de produtos incríveis, vende com liberdade, recruta novos talentos e multiplica seus resultados.</p>
                        </div>
                    </div>

                </div>
                <div className="row pb-4">
                    <div className="col-md-12">
                        <div className="lc-block d-grid gap-3 d-md-block">
                            <Button variant="danger" size="lg" className="me-md-2" onClick={() => {
                                navigate("/new-seller");
                            }}><FontAwesomeIcon icon={faBoltLightning} fixedWidth />Seja um representante</Button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}