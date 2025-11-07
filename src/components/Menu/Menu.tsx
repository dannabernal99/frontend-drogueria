import React from "react";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import "./Menu.css";

interface MenuItem {
  label: string;
  path: string;
}

const Menu: React.FC = () => {
  const { usuario } = useAuth();
  const navigate = useNavigate();

  const menuPorRol: Record<string, MenuItem[]> = {
    ADMIN: [
      { label: "Dashboard", path: "/dashboard" },
      { label: "Usuarios", path: "/usuarios" },
      { label: "Productos", path: "/products" },
      { label: "Reportes", path: "/reportes" },
    ],
    USER: [
      { label: "Dashboard", path: "/dashboard" },
      { label: "Ventas", path: "/ventas" },
    ],
  };

  const rol = usuario?.roleNombre?.toUpperCase() || "CLIENTE";
  const items = menuPorRol[rol] || [];

  return (
    <aside className="menu-lateral">
      <div className="menu-header">
        <h2>Menú</h2>
        <p className="rol">{rol}</p>
      </div>

      <ul className="menu-list">
        {items.map((item, index) => (
          <li
            key={index}
            className="menu-item"
            onClick={() => navigate(item.path)}
          >
            {item.label}
          </li>
        ))}
      </ul>
    </aside>
  );
};

export default Menu;
