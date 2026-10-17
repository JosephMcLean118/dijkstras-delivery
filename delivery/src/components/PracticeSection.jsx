import placeholder from "../../public/placeholder.png";

function PracticeSection() {
    return (
        <div className="card card-body">
            <h4 className="fw-bold">Practice</h4>
            <p>Practice content goes here.</p>
            <img src={placeholder} style={{ width: "35vw", height: "30vw", objectFit: "cover" }}></img>
        </div>
    );
}

export default PracticeSection;