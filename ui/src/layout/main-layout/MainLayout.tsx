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
      <div className="flex-grow flex flex-col main-container">
      <main className="flex-grow main main--standard">{children}</main>
      </div>
    </Layout>
  );
};

export default MainLayout;
