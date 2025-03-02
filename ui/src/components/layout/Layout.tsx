import React from "react";
import "./Layout.css";
import { Toaster } from "../ui/sonner";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="layout dark:bg-background-dark dark:text-foreground-dark transition-colors duration-300">
      {children}
      <Toaster/>
    </div>
  );
};

export default Layout;
