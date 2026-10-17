import Widget from "./Widget";
function Body() {

    return(
        <>
            <div className="d-flex m-4" style={{ gap: "8.5vw" }}>
                <Widget
                    title="Practice"
                    details="This will serve to teach you the fundamentals of Dijkstra's Algorithm through the wondeful world of pizza delivery."
                    to="/practice"
                />
                <Widget
                    title="Play"
                    details="Put your knowledge to the test! Try using Dijkstras algorithm to find the most fuel-efficient path to deliver your pizzas!"
                    to="/play"
                />
            </div>
        </>
    );
}

export default Body;