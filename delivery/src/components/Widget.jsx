import { Link } from "react-router-dom";

function Widget({title, details, to}) {
    return(
        <>
        <div className='body'>
            <h4 className="card-title" style={{ marginBottom: "1vw"}}>{title}</h4>
            <div className="card" style={{ width: "44vw" }}>
            <img src="https://picsum.photos/400/200" class="card-img-top" alt="..." />
            <div className="card-body">
                <p className="card-text">{details}</p>
                <Link to={to} className="btn btn-primary">Start</Link>
            </div>
            </div>
        </div>
        </>

    );
}
export default Widget;