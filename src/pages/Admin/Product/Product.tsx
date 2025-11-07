import React, { useEffect, useCallback, useState } from "react";
import "./Product.css";
import Navbar from "../../../components/Navbar/Navbar";
import Menu from "../../../components/Menu/Menu";
import Table from "../../../components/Table/Table";
import FormModal from "../../../components/FormModal/FormModal";
import Button from "../../../components/Button/Button";
import { useHttp } from "../../../hooks/useHttp";
import type { FormField } from "../../../components/FormModal/FormModal";

const Product: React.FC = () => {
  const { data: productos, loading, error, sendRequest } = useHttp<any[]>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);

  const loadProductos = useCallback(() => {
    const token = localStorage.getItem("token");
    
    if (!token) {
      console.error("No hay token de autenticación disponible");
      return;
    }

    sendRequest({
      url: "/v1/productos",
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }, [sendRequest]);

  useEffect(() => {
    loadProductos();
  }, [loadProductos]);

  const columns = [
    { key: "id", label: "ID" },
    { key: "nombre", label: "Nombre" },
    { key: "precio", label: "Precio" },
    { key: "cantidad", label: "Cantidad" },
  ];

  const actions = [
    {
      label: "Editar",
      onClick: (item: any) => {
        setEditingProduct(item);
        setIsModalOpen(true);
      },
    },
    {
        label: "Eliminar",
        onClick: async (item: any) => {
            if (window.confirm(`¿Estás seguro de eliminar "${item.nombre}"?`)) {  // Faltaban paréntesis aquí
            const token = localStorage.getItem("token");
            try {
                await sendRequest({
                url: `/v1/productos/${item.id}`,
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                });
                loadProductos();
            } catch (error) {
                console.error("Error al eliminar producto:", error);
            }
            }
        },
    }
  ];

  const formFields: FormField[] = [
    {
      name: "nombre",
      label: "Nombre del Producto",
      type: "text",
      placeholder: "Ej: Dolex",
      required: true,
      validation: (value) => {
        if (!value || value.trim().length < 3) {
          return "El nombre debe tener al menos 3 caracteres";
        }
        return undefined;
      },
      defaultValue: editingProduct?.nombre || "",
    },
    {
      name: "precio",
      label: "Precio",
      type: "number",
      placeholder: "14000",
      required: true,
      min: 0,
      step: 100,
      validation: (value) => {
        if (value <= 0) {
          return "El precio debe ser mayor a 0";
        }
        return undefined;
      },
      defaultValue: editingProduct?.precio || "",
    },
    {
      name: "cantidad",
      label: "Cantidad",
      type: "number",
      placeholder: "10",
      required: true,
      min: 0,
      step: 1,
      validation: (value) => {
        if (value < 0) {
          return "La cantidad no puede ser negativa";
        }
        return undefined;
      },
      defaultValue: editingProduct?.cantidad || "",
    },
  ];

  const handleSubmit = async (formData: Record<string, any>) => {
    setIsModalOpen(false);
    setEditingProduct(null);
    loadProductos();
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const handleAddNew = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  return (
    <>
      <Navbar />
      <div className="admin-layout">
        <Menu />
        <main className="admin-content">
          <div className="content-wrapper">
            <div className="page-header">
              <h2>Gestión de Productos</h2>
              <Button 
                text="+ Nuevo Producto"
                onClick={handleAddNew}
                variant="primary"
              />
            </div>
            
            {loading && (
              <div className="loading-container">
                <p>Cargando productos...</p>
              </div>
            )}
            
            {error && (
              <div className="error-container">
                <p>Error: {error}</p>
                <Button 
                  text="Reintentar"
                  onClick={loadProductos}
                  variant="secondary"
                />
              </div>
            )}
            
            {!loading && !error && productos && productos.length > 0 && (
              <div className="table-container">
                <Table<any>
                  columns={columns}
                  data={productos}
                  actions={actions}
                  rowKey="id"
                />
              </div>
            )}
            
            {!loading && !error && (!productos || productos.length === 0) && (
              <div className="empty-container">
                <p>No hay productos registrados.</p>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Modal para crear/editar productos */}
      <FormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        title={editingProduct ? "Editar Producto" : "Nuevo Producto"}
        fields={formFields}
        apiUrl={editingProduct 
          ? `/v1/productos/${editingProduct.id}` 
          : "/v1/productos"
        }
        httpMethod={editingProduct ? "PUT" : "POST"}
        submitText={editingProduct ? "Actualizar" : "Crear Producto"}
      />
    </>
  );
};

export default Product;