import React, { useEffect, useCallback, useState } from "react";
import "./SalePage.css";
import Navbar from "../../../components/Navbar/Navbar";
import Table from "../../../components/Table/Table";
import { useHttp } from "../../../hooks/useHttp";
import type { Sale } from "../../../types/Sale";

const SalePage: React.FC = () => {
  const { data: ventas, loading, error, sendRequest } = useHttp<Sale[]>();
  const [menuAbierto, setMenuAbierto] = useState(true);

  const loadVentas = useCallback(() => {
    const token = localStorage.getItem("token");
    
    if (!token) {
      console.error("No hay token de autenticación disponible");
      return;
    }

    sendRequest({
      url: "/v1/compras/mis-compras",
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }, [sendRequest]);

  useEffect(() => {
    loadVentas();
  }, [loadVentas]);

  const columns = [
    { 
      key: "id", 
      label: "ID",
      sortable: true,
    },
    { 
      key: "productoNombre", 
      label: "Producto",
      sortable: true,
      exportLabel: "Nombre del Producto",
    },
    { 
      key: "cantidad", 
      label: "Cantidad",
      sortable: true,
      exportLabel: "Cantidad Comprada",
    },
    { 
      key: "precioUnitario", 
      label: "Precio Unit.",
      sortable: true,
      exportLabel: "Precio Unitario (COP)",
      exportFormat: (value: unknown) => {
        const num = Number(value);
        return isNaN(num) ? "" : num.toLocaleString("es-CO");
      },
    },
    { 
      key: "precioTotal", 
      label: "Total",
      sortable: true,
      exportLabel: "Precio Total (COP)",
      exportFormat: (value: unknown) => {
        const num = Number(value);
        return isNaN(num) ? "" : num.toLocaleString("es-CO");
      },
    },
    { 
      key: "fechaCompra", 
      label: "Fecha",
      sortable: true,
      exportLabel: "Fecha de Compra",
    },
  ];

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="admin-layout">
          <main className="admin-content">
            <p>Cargando mis compras...</p>
          </main>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div className="admin-layout">
          <main className="admin-content">
            <p>Error: {error}</p>
          </main>
        </div>
      </>
    );
  }

  return (
    <div className={`admin-layout ${menuAbierto ? "menu-abierto" : "menu-cerrado"}`}>
      <Navbar onMenuToggle={setMenuAbierto} />
      <main className="admin-content">
        <Table<Sale>
          columns={columns}
          data={ventas || []}
          rowKey="id"
          noDataMessage="No tienes compras registradas"
          header={{
            title: "Mis Compras",
            showCreateButton: false,
            showExportButton: true,
            exportFileName: "mis-compras",
          }}
          defaultRowsPerPage={10}
          rowsPerPageOptions={[5, 10, 20, 50]}
          enableSearch={true}
          enableColumnFilters={true}
        />
      </main>
    </div>
  );
};

export default SalePage;