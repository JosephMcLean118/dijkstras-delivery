import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Tutorial from "./pages/Practice";
import Play from "./pages/Play";


export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/practice" element={<Tutorial />} />
        <Route path="/play" element={<Play />} />
      </Route>
    </Routes>
  );
}