import React, { useState } from "react";
import "./DashboardAdmin.css";
import Navbar from "../../../components/Navbar/Navbar";

const DashboardAdmin: React.FC = () => {
  const [menuAbierto, setMenuAbierto] = useState(true);

  return (
    <div className={`dashboard-layout ${menuAbierto ? "menu-abierto" : "menu-cerrado"}`}>
      <Navbar onMenuToggle={setMenuAbierto} />
      <main className="dashboard-content">
        <h1 className="dashboard-title">Hola Administrador</h1>
        <p className="dashboard-subtitle">
          Bienvenido al panel principal de la aplicación
        </p>
      </main>
    </div>
  );
};

export default DashboardAdmin;
