import React, { useEffect, useState, useCallback } from "react";
import "./DashboardAdmin.css";
import Navbar from "../../../components/Navbar/Navbar";
import Card from "../../../components/Card/Card";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import { Chart, registerables } from "chart.js";
import { Users, Package, Layers } from "lucide-react";
import { useHttp } from "../../../hooks/useHttp";
import type { DashboardData } from "../../../types/DashboardData";

Chart.register(...registerables);

const DashboardAdmin: React.FC = () => {
  const { data, loading, error, sendRequest } = useHttp<DashboardData>();
  const [menuAbierto, setMenuAbierto] = useState(true);

  const loadDashboard = useCallback(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No hay token de autenticación disponible");
      return;
    }

    sendRequest({
      url: "/v1/dashboard/admin",
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }, [sendRequest]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const dashboard = data || {
    totalUsuarios: 0,
    totalProductos: 0,
    totalCategorias: 0,
    crecimientoUsuarios: [],
    crecimientoProductos: [],
    crecimientoCategorias: [],
  };

  const barData = {
    labels: ["Usuarios", "Productos", "Categorías"],
    datasets: [
      {
        label: "Totales",
        data: [
          dashboard.totalUsuarios,
          dashboard.totalProductos,
          dashboard.totalCategorias,
        ],
        backgroundColor: ["#3498db", "#2ecc71", "#f1c40f"],
        borderRadius: 10,
      },
    ],
  };

  const doughnutData = {
    labels: ["Usuarios", "Productos", "Categorías"],
    datasets: [
      {
        data: [
          dashboard.totalUsuarios,
          dashboard.totalProductos,
          dashboard.totalCategorias,
        ],
        backgroundColor: ["#3498db", "#2ecc71", "#f1c40f"],
        hoverOffset: 10,
      },
    ],
  };

  const lineData = {
  labels: ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"],
  datasets: [
    {
      label: "Usuarios",
      data: dashboard.crecimientoUsuarios || [],
      borderColor: "#3498db",
      fill: false,
      tension: 0.3,
    },
    {
      label: "Productos",
      data: dashboard.crecimientoProductos || [],
      borderColor: "#2ecc71",
      fill: false,
      tension: 0.3,
    },
    {
      label: "Categorías",
      data: dashboard.crecimientoCategorias || [],
      borderColor: "#f1c40f",
      fill: false,
      tension: 0.3,
    },
  ],
};

  if (loading)
    return (
      <>
        <Navbar />
        <div className="dashboard-layout">
          <main className="dashboard-content">
            <p>Cargando estadísticas...</p>
          </main>
        </div>
      </>
    );

  if (error)
    return (
      <>
        <Navbar />
        <div className="dashboard-layout">
          <main className="dashboard-content">
            <p>Error al cargar el dashboard: {error}</p>
          </main>
        </div>
      </>
    );

  return (
    <div
      className={`dashboard-layout ${
        menuAbierto ? "menu-abierto" : "menu-cerrado"
      }`}
    >
      <Navbar onMenuToggle={setMenuAbierto} />
      <main className="dashboard-content">
        <h1 className="dashboard-title">Administrador</h1>
        <p className="dashboard-subtitle">Resumen general del sistema</p>

        <div className="dashboard-cards">
          <Card
            title="Usuarios"
            value={dashboard.totalUsuarios}
            icon={<Users />}
            color="#3498db"
          />
          <Card
            title="Productos"
            value={dashboard.totalProductos}
            icon={<Package />}
            color="#2ecc71"
          />
          <Card
            title="Categorías"
            value={dashboard.totalCategorias}
            icon={<Layers />}
            color="#f1c40f"
          />
        </div>

        <div className="dashboard-charts">
          <div className="chart-container">
            <h3>Totales Generales</h3>
            <Bar data={barData} />
          </div>

          <div className="chart-container">
            <h3>Distribución General</h3>
            <Doughnut data={doughnutData} />
          </div>

          <div className="chart-container">
            <h3>Tendencia Mensual</h3>
            <Line data={lineData} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardAdmin;
