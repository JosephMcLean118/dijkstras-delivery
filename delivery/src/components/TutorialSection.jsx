import BoardScene from "../nodes/boardscene";
function TutorialSection() {
    return (
        <div className="card card-body">
            <center><h4 className="fw-bold">Tutorial</h4></center>

            <div className="mx-auto" style={{ width: "1100px", maxWidth: "100%" }}>
                <BoardScene />
            </div>
        </div>
    );
}

export default TutorialSection;