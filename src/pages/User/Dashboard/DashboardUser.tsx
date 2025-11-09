import React, { useState } from "react";
import "./DashboardUser.css";
import Navbar from "../../../components/Navbar/Navbar";

const DashboardUser: React.FC = () => {
  const [menuAbierto, setMenuAbierto] = useState(true);

  return (
    <div className={`dashboard-layout ${menuAbierto ? "menu-abierto" : "menu-cerrado"}`}>
      <Navbar onMenuToggle={setMenuAbierto} />
      <main className="dashboard-content">
        <h1 className="dashboard-title">Hola Usuario</h1>
        <p className="dashboard-subtitle">
          Bienvenido al panel principal de la aplicación
        </p>
      </main>
    </div>
  );
};

export default DashboardUser;
