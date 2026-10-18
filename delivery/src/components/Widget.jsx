import { Link } from "react-router-dom";

function Widget({title, details, to, gameType, image}) {
    return(
        <>
        <div className='body'>
            <h4 className="card-title" style={{ marginBottom: "0px", minHeight: '3rem' }}>
                {title}
            </h4>
            
            <div className="card" style={{ width: "44vw" }}>
           
              <img 
                src={image} 
                className="card-img-top mt-1" 
                alt="..." 
                style={{ width: '100%', height: '414px', objectFit: 'cover', marginBottom:"0px"}} 
              />
              <div className="card-body">
                <p className="card-text">{details}</p>
                <Link to={to} className="other-hover-grow py-2 px-4 card text-bg-primary text-decoration-none">{gameType}</Link>
              </div>
            </div>
        </div>
        </>
    );
}
export default Widget;