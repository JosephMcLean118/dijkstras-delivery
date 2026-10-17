function Header(){
    return (
        <>
        <div className="header font-family: 'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif">
            <div className="card text-bg-white m-4 rounded-0 p-0 border-0">
            <div className="card-body py-2 px-3 d-flex align-items-center gap-3">
                <h1 className="fs-4 m-0 fw-bold" style={{ fontFamily: "Inter, Arial, sans-serif" }}>Dijkstra's Delivery Service</h1>
                <p className="m-0 small opacity-50">By Morgan Stanley</p>
                <a href="/practice" className="ms-auto text-decoration-none text-black">Practice</a>
                <a href="/play" className="py-2 px-4 rounded-pill text-bg-primary text-decoration-none">Play</a>
            </div>
            </div>
        </div>
        </>
    );
}

export default Header;