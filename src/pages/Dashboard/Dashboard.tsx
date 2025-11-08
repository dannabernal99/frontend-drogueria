import React from "react";
import "./Dashboard.css";
import Navbar from "../../components/Navbar/Navbar";
import Menu from "../../components/Menu/Menu";

const Dashboard: React.FC = () => {
  return (
    <>
      <Navbar />
      <div className="dashboard-layout">
        <Menu />

        <main className="dashboard-content">
          <h1 className="dashboard-title">Hola Mundo</h1>
          <p className="dashboard-subtitle">
            Bienvenido al panel principal de la aplicación
          </p>
        </main>
      </div>
    </>
  );
};

export default Dashboard;
