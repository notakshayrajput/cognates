import React from "react";
import { Link } from "react-router-dom";
import { ModeToggle } from "../mode-toggle/mode-toggle";
import "./Navbar.css";

interface NavbarProps {
  children: React.ReactNode;
}
const Navbar: React.FC <NavbarProps> = ({ children }) => {
  return (
    <nav className="w-full p-2 drop-shadow-lg navbar">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-xl font-bold">Cognates</Link>
        
        {children}
        

        <ModeToggle />
      </div>
    </nav>
  );
};

export default Navbar;
