import Widget from "./Widget";
import PizzPic3 from "../assets/PizzPic3.png";
import practice from "../assets/practice.png";

function Body() {

    return(
        <>
            <div className="d-flex m-4" style={{ gap: "8.5vw" }}>
                <Widget
                    title="Tutorial"
                    details="This will serve to teach you the fundamentals of Dijkstra's Algorithm through the wondeful world of pizza delivery."
                    to="/practice"
                    gameType="Tutorial"
                    image={practice}
                />
                <Widget
                    title="Play"
                    details="Put your knowledge to the test! Try using Dijkstras algorithm to find the most fuel-efficient path to deliver your pizzas!"
                    to="/play"
                    gameType="Play"
                    image={PizzPic3}
                />
            </div>
        </>
    );
}

export default Body;