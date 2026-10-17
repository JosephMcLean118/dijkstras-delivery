import placeholder from "../../public/placeholder.png"
import StepsWidget from "./StepsWidget";
function TutorialSection() {
    return (
        <div className="card card-body d-flex flex-row align-items-center gap-3">
            <div>
                <h4 className="fw-bold">Tutorial</h4>
                <p>Tutorial content goes here.</p>
                <img src={placeholder} style={{ width: "35vw", height: "30vw", objectFit: "cover" }}/>
            </div>
            <div className="ms-auto fade-in me-4">
                <StepsWidget />
            </div>
        </div>
    );
}

export default TutorialSection;