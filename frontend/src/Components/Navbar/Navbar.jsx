import { NavLink } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
  return (
    <nav className="navbar">

      <div className="brand">

        <div className="logo-box">
          <img
            src="public/KeySphere.png"
            alt="src/assets/KeyLOgo...png"
          />
        </div>

        <div className="brand-info">
          <h1>KeySphere</h1>
          <p>Hotel Management</p>
        </div>

      </div>

      <div className="nav-right">

        <div className="nav-links">

          <NavLink
            to="/"
            className={({ isActive }) =>
              `nav-link ${isActive ? "active" : ""}`
            }
          >
            <span>⌂</span>
            Home
          </NavLink>

          <NavLink
            to="/add-hotel"
            className={({ isActive }) =>
              `nav-link ${isActive ? "active" : ""}`
            }
          >
            <span>➕</span>
            Add Hotels
          </NavLink>

          <NavLink
            to="/update-hotel"
            className={({ isActive }) =>
              `nav-link ${isActive ? "active" : ""}`
            }
          >
            <span>✏️</span>
            Update Hotels
          </NavLink>

          <NavLink
            to="/delete-hotel"
            className={({ isActive }) =>
              `nav-link ${isActive ? "active" : ""}`
            }
          >
            <span>🗑️</span>
            Delete Hotels
          </NavLink>

        </div>

      </div>

    </nav>
  );
}

export default Navbar;