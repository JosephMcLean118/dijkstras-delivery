import { useState } from "react";
import PracticeSection from "./PracticeSection";
import TutorialSection from "./TutorialSection";

function Pbody() {
    const [tab, setTab] = useState("practice");

    return (
        <div className="m-4">
            <div className="d-flex gap-2 mb-3">
                <button
                    className={`btn ${tab === "practice" ? "btn-primary" : "btn-outline-primary"}`}
                    onClick={() => setTab("practice")}
                >
                    Practice
                </button>
                <button
                    className={`btn ${tab === "tutorial" ? "btn-primary" : "btn-outline-primary"}`}
                    onClick={() => setTab("tutorial")}
                >
                    Tutorial
                </button>
            </div>

            <div key={tab} className="fade-in">
                {tab === "practice" ? <PracticeSection /> : <TutorialSection />}
            </div>
        </div>
    );
}

export default Pbody;