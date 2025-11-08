import React, { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import {
  Menu as MenuIcon,
  X as CloseIcon,
  LayoutDashboard,
  Users,
  Package,
  FileBarChart,
  ShoppingCart,
} from "lucide-react";
import "./Menu.css";

interface MenuItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

interface MenuProps {
  onToggle?: (isOpen: boolean) => void;
}

const Menu: React.FC<MenuProps> = ({ onToggle }) => {
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const [abierto, setAbierto] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 992);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 992);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleMenu = () => {
    setAbierto((prev) => {
      const nuevoEstado = !prev;
      onToggle?.(nuevoEstado);
      return nuevoEstado;
    });
  };

  const menuPorRol: Record<string, MenuItem[]> = {
    ADMIN: [
      { label: "Dashboard", path: "/dashboard", icon: <LayoutDashboard size={20} /> },
      { label: "Usuarios", path: "/usuarios", icon: <Users size={20} /> },
      { label: "Productos", path: "/products", icon: <Package size={20} /> },
      { label: "Reportes", path: "/reportes", icon: <FileBarChart size={20} /> },
    ],
    USER: [
      { label: "Dashboard", path: "/dashboard", icon: <LayoutDashboard size={20} /> },
      { label: "Ventas", path: "/ventas", icon: <ShoppingCart size={20} /> },
    ],
  };

  const rol = usuario?.roleNombre?.toUpperCase() || "CLIENTE";
  const items = menuPorRol[rol] || [];

  return (
    <>
      <button className="btn-toggle-menu" onClick={toggleMenu} aria-label="Alternar menú">
        {abierto ? <CloseIcon size={18} /> : <MenuIcon size={18} />}
      </button>

      <aside
        className={`menu-lateral ${abierto ? "abierto" : "cerrado"} ${
          isMobile ? "movil" : "escritorio"
        }`}
      >
        <div className="menu-header">
          {abierto && <h2>Menú</h2>}
          {abierto && <p className="rol">{rol}</p>}
        </div>

        <ul className="menu-list">
          {items.map((item, index) => (
            <li
              key={index}
              className="menu-item"
              onClick={() => {
                navigate(item.path);
                if (isMobile) setAbierto(false);
              }}
            >
              <span className="menu-icon">{item.icon}</span>
              {abierto && <span className="menu-label">{item.label}</span>}
            </li>
          ))}
        </ul>
      </aside>
    </>
  );
};

export default Menu;
