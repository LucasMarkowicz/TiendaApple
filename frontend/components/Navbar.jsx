import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { NavLink } from "react-router-dom";
import Cartwidget from "./CartWidget";

export default function Navbar({ setIsLoggedIn }) {
  const navigate = useNavigate();
  const [isNavOpen, setIsNavOpen] = useState(false);

  const handleLogout = async () => {
    try {
      const response = await fetch("https://tienda-apple-import.onrender.com/api/users/logout", {
        method: "POST",
        credentials: "include",
      });

      const data = await response.json();

      if (data.success) {
        setIsLoggedIn(false);
        navigate("/login");
      } else {
        console.error(data.message);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const toggleNav = () => {
    setIsNavOpen(!isNavOpen);
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light fixed-width-nav">
      <div className="container-fluid">
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarSupportedContent"
          aria-controls="navbarSupportedContent"
          aria-expanded={isNavOpen ? "true" : "false"}
          aria-label="Toggle navigation"
          onClick={toggleNav}
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div
          className={`collapse navbar-collapse ${isNavOpen ? "show" : ""}`}
          id="navbarSupportedContent"
        >
          <NavLink className="navbar-brand mt-2 mt-lg-0" to="/">
            Tienda Apple Import
            <img
              src="../public/images/Apple.png"
              className="logoApple"
              alt="Logo"
            />
          </NavLink>

          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <NavLink
                className="nav-link"
                to="/"
                onClick={toggleNav}
              >
                All
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                className="nav-link"
                to="/iphones"
                onClick={toggleNav}
              >
                iPhones
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                className="nav-link"
                to="/macbooks"
                onClick={toggleNav}
              >
                MacBooks
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                className="nav-link"
                to="/ipads"
                onClick={toggleNav}
              >
                iPads
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                className="nav-link"
                to="/airpods"
                onClick={toggleNav}
              >
                AirPods
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                className="nav-link"
                to="/watches"
                onClick={toggleNav}
              >
                Watches
              </NavLink>
            </li>
          </ul>

          <div className="d-flex align-items-center">
            <Cartwidget />
            <button className="btn btn-primary ms-3" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
