import { Outlet } from "react-router";
import Navbar from "./Navbar.jsx";
import Footer from "./Footer.jsx";
import ScrollToTop from "./ScrollToTop.jsx";
import './MainLayout.css';

function MainLayout() {
    return (
        <>
          <ScrollToTop />
          <Navbar/>
          <main className="main">
            <Outlet />
          </main>
          <Footer />
        </>
    );
}

export default MainLayout;