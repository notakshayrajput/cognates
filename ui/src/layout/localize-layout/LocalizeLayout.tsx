import React from "react";
import Layout from "../../components/layout/Layout";
import Navbar from "../../components/navbar/Navbar";
import "./LocalizeLayout.css";

interface LocalizeLayoutProps {
  children: React.ReactNode;
}

const LocalizeLayout: React.FC<LocalizeLayoutProps> = ({ children }) => {
  return (
    <Layout>
      <Navbar>
        </Navbar>
      <div className="flex-grow flex flex-col main-container min-h-[calc(100vh-65px)] ">
      <div className="flex-grow flex flex-start main-container min-h-[calc(100vh-105px)] main">{children}</div>
      </div>
    </Layout>
  );
};

export default LocalizeLayout;
