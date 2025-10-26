import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Navbar.css";
import { useAuth } from "../../hooks/useAuth";

const Navbar: React.FC = () => {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="navbar">
      <div className="navbar-logo">💈 BeautyApp</div>

      <div className="navbar-links">
        <Link to="/" className="navbar-link">
          Inicio
        </Link>

        {!isAuthenticated ? (
          <>
            <Link to="/login" className="navbar-link">
              Ingresar
            </Link>
            <Link to="/register" className="navbar-link">
              Registrarse
            </Link>
          </>
        ) : (
          <>
            <Link to="/dashboard" className="navbar-link">
              Dashboard
            </Link>
            <button className="navbar-btn" onClick={handleLogout}>
              Cerrar sesión
            </button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
