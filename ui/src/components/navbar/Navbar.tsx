import React from "react";
import { Link, NavLink } from "react-router-dom";
import { ModeToggle } from "../mode-toggle/mode-toggle";
import { Languages } from "lucide-react";
import "./Navbar.css";

interface NavbarProps {
  children?: React.ReactNode;
}
const Navbar: React.FC <NavbarProps> = ({ children }) => {
  return (
    <nav className="navbar" aria-label="Main navigation">
      <div className="navbar__inner">
        <Link to="/" className="navbar__brand" aria-label="Cognates home">
          <span className="navbar__mark"><Languages size={19} strokeWidth={2} /></span>
          <span>Cognates</span>
        </Link>
        <div className="navbar__right">
          {children || (
            <div className="navbar__links">
              <NavLink to="/" end>Overview</NavLink>
              <NavLink to="/localize">Localize</NavLink>
              <NavLink to="/configure">Settings</NavLink>
            </div>
          )}
          <ModeToggle />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
