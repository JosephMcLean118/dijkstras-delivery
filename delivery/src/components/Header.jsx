import { Link } from "react-router-dom";

function Header(){
    return (
        <>
        <div className="header">
            <div className="card text-bg-white m-4 rounded-0 p-0 border-0">
            <div className="card-body py-2 px-3 d-flex align-items-center gap-3">
                <Link to="/" className="hover-grow hover-grow-left text-decoration-none text-black">
                    <h1 className="fs-4 m-0 fw-bold" style={{ fontFamily: "Inter, Arial, sans-serif" }}>Dijkstra's Delivery Service</h1>
                </Link>
                <p className="m-0 small opacity-50">By Morgan Stanley</p>
                <Link to="/practice" className="ms-auto text-decoration-none text-black">Practice</Link>
                <Link to="/play" className="other-hover-grow py-2 px-4 rounded-pill text-bg-primary text-decoration-none">Play</Link>
            </div>
            </div>
        </div>
        </>
    );
}

export default Header;