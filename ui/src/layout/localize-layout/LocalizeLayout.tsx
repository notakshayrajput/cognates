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
      <div className="flex-grow flex flex-col main-container">
      <main className="flex-grow main main--localize">{children}</main>
      </div>
    </Layout>
  );
};

export default LocalizeLayout;
