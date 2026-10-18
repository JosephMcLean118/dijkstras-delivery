import PracticeSection from "./PracticeSection";
import TutorialSection from "./TutorialSection";

import { useState } from "react";

function Pbody() {
    const [tab, setTab] = useState("tutorial");
    return (
        <div className="m-4">
            <div className="d-flex gap-2 mb-3">
            </div>

            <div key={tab} className="fade-in">
                {tab === "practice" ? <PracticeSection /> : <TutorialSection />}
            </div>
        </div>
    );
}

export default Pbody;