import { Outlet } from "react-router-dom";
import Header from "./Header";
import About from "./About";

export default function Layout() {
  return (
    <>
        <Header />
        <Outlet />
        <About />

    </>
  );
}