import PracticeSection from "./PracticeSection";
import TutorialSection from "./TutorialSection";

import { useState, useRef, useEffect } from "react";

function Pbody() {
    const [tab, setTab] = useState("practice");
    const audioRef = useRef(null);

    // create the audio object once, and stop it if the page is left
    useEffect(() => {
        audioRef.current = new Audio("/pizzatime.mp3");
        audioRef.current.volume = 0.5;
        return () => {
            audioRef.current.pause();
            audioRef.current = null;
        };
    }, []);

    function startSound() {
        const audio = audioRef.current;
        audio.currentTime = 0;     // restart from the beginning
        audio.play();
    }

    function stopSound() {
        const audio = audioRef.current;
        audio.pause();
        audio.currentTime = 0;     // so it restarts next time
    }

    function goTutorial() {
        setTab("tutorial");
        startSound();              // clicking again restarts it, no overlap
    }

    function goPractice() {
        setTab("practice");
        stopSound();
    }

    return (
        <div className="m-4">
            <div className="d-flex gap-2 mb-3">
                <button
                    className={`btn ${tab === "practice" ? "btn-primary" : "btn-outline-primary"}`}
                    onClick={goPractice}
                >
                    Practice
                </button>
                <button
                    className={`btn ${tab === "tutorial" ? "btn-primary" : "btn-outline-primary"}`}
                    onClick={goTutorial}
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