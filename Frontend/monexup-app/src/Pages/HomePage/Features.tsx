import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useNavigate } from "react-router-dom";
import Container from "react-bootstrap/esm/Container";
import Row from "react-bootstrap/esm/Row";
import Col from "react-bootstrap/esm/Col";
import { faBoltLightning, faLock, faFileUpload, faCalendarAlt, faFileWord, faBoxOpen, faLockOpen, faUserDoctor } from '@fortawesome/free-solid-svg-icons';
import { faBitcoin } from "@fortawesome/free-brands-svg-icons";

export default function Header() {

    let navigate = useNavigate();

    return (
        <>
            <section id="overview" className="py-5">
                <Container>
                    <Row>
                        <Col md={12} className="text-center">
                            <h4 className="display-2 mb-0">Features</h4>
                            <p>EHR offers a comprehensive set of features designed to meet the needs of patients, healthcare providers, and organizations:</p>
                        </Col>
                    </Row>

                    <Row className="pt-4">
                        <Col md={4}>
                            <div className="lc-block border p-4" style={{minHeight: "263px"}}>
                                <div className="text-center">
                                    <FontAwesomeIcon icon={faBitcoin} fixedWidth size="4x" />
                                    <h4 className="my-3">Catálogo de<br />Produtos</h4>
                                    <p>Acesso fácil aos produtos das redes que você participa.</p>
                                </div>
                            </div>
                        </Col>
                        <Col md={4}>
                            <div className="lc-block border p-4" style={{minHeight: "263px"}}>
                                <div className="text-center">
                                    <FontAwesomeIcon icon={faLock} fixedWidth size="4x" />
                                    <h4 className="my-3">Múltiplas Redes<br />de Venda</h4>
                                    <p>Participe de diversas redes afiliadas. Gerencie cada rede de forma separada e organizada.</p>
                                </div>
                            </div>
                        </Col>
                        <Col md={4}>
                            <div className="lc-block border p-4" style={{minHeight: "263px"}}>
                                <div className="text-center">
                                    <FontAwesomeIcon icon={faBoltLightning} fixedWidth size="4x" />
                                    <h4 className="my-3">Produtos &<br />Serviços</h4>
                                    <p>Pagamentos via Cartão de Crédito, Boleto e PIX.</p>
                                </div>
                            </div>
                        </Col>
                    </Row>
                    <Row className="pt-4">
                        <Col md={4}>
                            <div className="lc-block border p-4" style={{minHeight: "263px"}}>
                                <div className="text-center">
                                    <FontAwesomeIcon icon={faFileUpload} fixedWidth size="4x" />
                                    <h4 className="my-3">Gestão de<br />Equipe</h4>
                                    <p>Recrute novos vendedores. Acompanhe o desempenho e crescimento da sua equipe</p>
                                </div>
                            </div>
                        </Col>
                        <Col md={4}>
                            <div className="lc-block border p-4" style={{minHeight: "263px"}}>
                                <div className="text-center">
                                    <FontAwesomeIcon icon={faCalendarAlt} fixedWidth size="4x" />
                                    <h4 className="my-3">Painel do Administrador</h4>
                                    <p>Gerencie produtos, redes, usuários e pagamentos. Controle total sobre o funcionamento da sua rede.</p>
                                </div>
                            </div>
                        </Col>
                        <Col md={4}>
                            <div className="lc-block border p-4" style={{minHeight: "263px"}}>
                                <div className="text-center">
                                    <FontAwesomeIcon icon={faFileWord} fixedWidth size="4x" />
                                    <h4 className="my-3">Relatórios e Comissões</h4>
                                    <p>Visualização de vendas, comissões e progresso da rede. Relatórios detalhados para tomada de decisões.</p>
                                </div>
                            </div>
                        </Col>
                    </Row>
                    <Row className="pt-4">
                        <Col md={4}>
                            <div className="lc-block border p-4" style={{minHeight: "263px"}}>
                                <div className="text-center">
                                    <FontAwesomeIcon icon={faLockOpen} fixedWidth size="4x" />
                                    <h4 className="my-3">Interface Responsiva</h4>
                                    <p>Totalmente adaptado para dispositivos móveis. Experiência fluida e rápida, onde quer que você esteja.</p>
                                </div>
                            </div>
                        </Col>
                        <Col md={4}>
                            <div className="lc-block border p-4" style={{minHeight: "263px"}}>
                                <div className="text-center">
                                    <FontAwesomeIcon icon={faUserDoctor} fixedWidth size="4x" />
                                    <h4 className="my-3">Árvore de Rede Interativa</h4>
                                    <p>Visualize sua rede de forma gráfica e intuitiva. Acompanhe o crescimento da sua equipe em tempo real.</p>
                                </div>
                            </div>
                        </Col>
                        <Col md={4}>
                            <div className="lc-block border p-4" style={{minHeight: "263px"}}>
                                <div className="text-center">
                                    <FontAwesomeIcon icon={faBoxOpen} fixedWidth size="4x" />
                                    <h4 className="my-3">Segurança e Transparência</h4>
                                    <p>Dados protegidos com criptografia. Histórico completo de transações e movimentações.</p>
                                </div>
                            </div>
                        </Col>
                    </Row>
                </Container>
            </section>
        </>
    );
}