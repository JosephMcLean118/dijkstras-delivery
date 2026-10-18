import Pbody from "../components/Pbody";
import theme from "../../public/pizzatime.mp3";


export default function Tutorial() {
    return (
        <>
            <div className="m-4">
                <h4 className="fw-bold mb-4">Tutorial</h4>
                
                <div style={{ fontFamily: "'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif" }}>
                    <div className="card text-bg-white p-0 border-0">
                        <div className="card-body py-2 px-3">
                            <p className="mb-3 pt-2 pb-1">
                                A <b>brief</b> explanation before you start: On the right you will see a list of all unvistited nodes (houses and junctions)
                                Their unkown distance is represented by ∞. 
                                In this exampe our starting node is the pizza shop, so all distances will calculate will be from that node.
                                As the algorithm runs through the steps, the explanation will detail each of its decisions.
                            </p>
                            <p> Click <b>Start Dikstra</b> to begin </p>
                        </div>
                    </div>
                </div>
            </div>
            <Pbody />
        </>
    );
}