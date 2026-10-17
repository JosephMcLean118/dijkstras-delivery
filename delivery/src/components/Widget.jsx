import { Link } from "react-router-dom";
import PizzPic3 from "../../src/components/PizzPic3.png";
import practice from "../../src/components/practice.png";

function Widget({title, details, to, gameType, image}) {
    return(
        <>
        <div className='body'>
            <h4 className="card-title" style={{ marginBottom: "1vw", minHeight: '3rem' }}>
                {title}
            </h4>
            
            <div className="card" style={{ width: "44vw" }}>
           
              <img 
                src={image} 
                className="card-img-top mt-3" 
                alt="..." 
                style={{ width: '100%', height: '500px', objectFit: 'cover'}} 
              />
              <div className="card-body">
                <p className="card-text">{details}</p>
                <Link to={to} className="btn btn-primary">{gameType}</Link>
              </div>
            </div>
        </div>
        </>

    );
}
export default Widget;