import React from "react";
import "./Navbar.css";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import Menu from "../Menu/Menu";

interface NavbarProps {
  onMenuToggle?: (isOpen: boolean) => void;
}

const Navbar: React.FC<NavbarProps> = ({ onMenuToggle }) => {
  const { isAuthenticated, logout, usuario } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const rutasSinMenu = ["/"];
  const mostrarMenu = isAuthenticated && usuario && !rutasSinMenu.includes(location.pathname);

  return (
    <nav className="navbar">
      <div className="navbar-left">
        {mostrarMenu && <Menu onToggle={onMenuToggle} />}
        <div className="navbar-logo">💈 BeautyApp</div>
      </div>

      <div className="navbar-links">
        {!isAuthenticated ? (
          <>
            <Link to="/login" className="navbar-link">Ingresar</Link>
            <Link to="/register" className="navbar-link">Registrarse</Link>
          </>
        ) : (
          <>
            <Link to="/" className="navbar-link">Inicio</Link>
            <Link to="/dashboard" className="navbar-link">Dashboard</Link>
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
