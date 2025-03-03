import React from "react";
import { Link } from "react-router-dom";
import { ModeToggle } from "../mode-toggle/mode-toggle";
import logo from "../../assets/logo.svg"
import "./Navbar.css";
import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList } from "@radix-ui/react-navigation-menu";

interface NavbarProps {
  children?: React.ReactNode;
}
const Navbar: React.FC <NavbarProps> = ({ children }) => {
  return (
    <nav className="w-full p-2 drop-shadow-lg navbar">
      <div className="container mx-auto flex justify-between items-center pl-4 pr-4">
        <Link to="/" className="flex items-center space-x-2">
          <img src={logo} alt="Cognates Logo" className="h-8 w-8  dark:invert" />
          <span className="text-xl font-bold">Cognates</span>
        </Link>
        {children?children:
        <NavigationMenu >
          
          <NavigationMenuList className="flex flex-row space-x-4">
            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Link to="/">Home</Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Link to="/configure">Cofiguration</Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Link to="/localize">Localization</Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
          }

        <ModeToggle />
      </div>
    </nav>
  );
};

export default Navbar;
