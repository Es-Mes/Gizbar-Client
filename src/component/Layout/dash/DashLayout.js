import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import NavBar from "../navBar/NavBar";
import Footer from "../footer/Footer";
import "./dashLayout.css";
import SideBar from "../sidebar/SideBar";

const DashLayout = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(prev => !prev);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <div className="page">
      <header>
        <NavBar toggleMenu={toggleMenu} />
      </header>
      <main>
        <div className="content">
          <Outlet />
        </div>

        {/* Overlay + Sidebar */}
        {isMenuOpen && <div className="menu-overlay" onClick={closeMenu}></div>}
        <aside className={`menu ${isMenuOpen ? "open" : ""}`}>
          <SideBar closeMenu={closeMenu} />
        </aside>
      </main>
    </div>
  );
};

export default DashLayout;
