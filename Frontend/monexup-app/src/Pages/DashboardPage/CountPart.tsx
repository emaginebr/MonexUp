import { faBox, faDollar, faUser } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function CountPart() {
    return (
        <div className="row row-cols-1 row-cols-md-2 justify-content-center row-cols-lg-3 py-4 g-4 counter-RANDOMID">
            <div className="col">
                <div className="card card-body shadow">
                    <div className="d-inline-flex align-items-center" style={{ minHeight: "128px" }}>
                        <div className="me-2">
                            <div className="bg-light p-3 rounded-circle">
                                <FontAwesomeIcon icon={faBox} fixedWidth size="2x" />
                            </div>
                        </div>
                        <div>
                            <span className="fw-bold display-5 mb-5">7</span>
                            <p className="lead"><span><b>Sales</b></span> Done</p>
                        </div>
                    </div>
                </div>
            </div>
            <div className="col">
                <div className="card card-body shadow">
                    <div className="d-inline-flex align-items-center" style={{ minHeight: "128px" }}>
                        <div className="me-2">
                            <div className="bg-light p-3 rounded-circle">
                                <FontAwesomeIcon icon={faUser} fixedWidth size="2x" />
                            </div>
                        </div>
                        <div>
                            <span className="fw-bold display-5 mb-5">6</span>
                            <p className="lead"><b>Customers</b> Added</p>
                        </div>
                    </div>
                </div>
            </div>
            <div className="col">
                <div className="card card-body shadow">
                    <div className="d-inline-flex align-items-center" style={{ minHeight: "128px" }}>
                        <div className="me-2">
                            <div className="bg-light p-3 rounded-circle">
                                <FontAwesomeIcon icon={faDollar} fixedWidth size="2x" />
                            </div>
                        </div>
                        <div>
                            <span className="fw-bold display-5 mb-5">15</span>
                            <p className="lead"><b>Paid</b> invoices</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}