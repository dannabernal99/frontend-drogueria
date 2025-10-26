import React from "react";
import "./Dashboard.css";
import Button from "../../../components/Button/Button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth";
import Navbar from "../../../components/Navbar/Navbar";
import Menu from "../../../components/Menu/Menu";

const Dashboard: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    localStorage.removeItem("usuario");
    navigate("/");
  };

  return (
    <>
      <Navbar />
      <div className="dashboard-layout">
        <Menu />

        {/* 🌟 Contenido principal */}
        <main className="dashboard-content">
          <h1 className="dashboard-title">Hola Mundo</h1>
          <p className="dashboard-subtitle">
            Bienvenido al panel principal de tu aplicación
          </p>

          <Button
            text="Cerrar Sesión"
            type="button"
            variant="secondary"
            onClick={handleLogout}
          />
        </main>
      </div>
    </>
  );
};

export default Dashboard;
