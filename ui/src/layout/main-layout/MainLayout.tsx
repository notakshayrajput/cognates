import React from "react";
import Layout from "../../components/layout/Layout";
import Navbar from "../../components/navbar/Navbar";
import "./MainLayout.css";

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <Layout>
      <Navbar>
        </Navbar>
      <div className="flex-grow flex flex-col main-container min-h-[calc(100vh-65px)] ">
      <div className="flex-grow flex flex-col justify-center main-container min-h-[calc(100vh-105px)] main">{children}</div>
      </div>
    </Layout>
  );
};

export default MainLayout;
