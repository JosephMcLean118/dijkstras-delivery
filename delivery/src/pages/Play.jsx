import BoardSceneGame from '../nodes/boardscenegame';
import 'bootstrap/dist/css/bootstrap.min.css';

export default function Play() { 
  return (
    <>
    <div className="m-4">
      <h4 className="fw-bold mb-4">Play</h4>
      
      <div style={{ fontFamily: "'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif" }}>
        <div className="card body text-bg-white  p-0 border-0">
    
          <div className="card-body py-2 px-3 ">
            <p className="mb-3 pt-2 pb-1">
              <b>Objective:</b> You are a pizza delivery driver and your goal is to deliver your products to house in an estate in as 
              little time - and fuel, possible.
            </p>
            <p className="mb-0 pb-1">
              Make sure you are using the <b>quickest</b> possible routes! Wouldn’t want to keep your clientele waiting.
            </p>
          </div>
        </div>
    

        <div className="card bg-white mt-3" style={{width: '100%' }}>
          <BoardSceneGame />
        </div>
      </div>
    </div>
    </>
  );
}
