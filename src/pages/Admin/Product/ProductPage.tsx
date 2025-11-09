import React, { useEffect, useCallback, useState } from "react";
import "./ProductPage.css";
import Navbar from "../../../components/Navbar/Navbar";
import Table from "../../../components/Table/Table";
import FormModal from "../../../components/FormModal/FormModal";
import { useHttp } from "../../../hooks/useHttp";
import type { FormField } from "../../../components/FormModal/FormModal";
import type { Product } from "../../../types/Product";
import type { Category } from "../../../types/Category";
import ConfirmModal from "../../../components/ConfirmModal/ConfirmModal";

const ProductPage: React.FC = () => {
  const { data: productos, loading, error, sendRequest } = useHttp<Product[]>();
  const { data: categorias, sendRequest: sendCategoryRequest } = useHttp<Category[]>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    productToDelete: null as Product | null,
  });

  const [menuAbierto, setMenuAbierto] = useState(true);

  const loadCategorias = useCallback(() => {
    const token = localStorage.getItem("token");
    
    if (!token) {
      console.error("No hay token de autenticación disponible");
      return;
    }

    sendCategoryRequest({
      url: "/v1/categorias",
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }, [sendCategoryRequest]);

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
    loadCategorias();
    loadProductos();
  }, [loadCategorias, loadProductos]);

  const columns = [
    { 
      key: "id", 
      label: "ID",
      sortable: true,
    },
    { 
      key: "nombre", 
      label: "Nombre",
      sortable: true,
      exportLabel: "Nombre del Producto",
    },
    { 
      key: "categoriaNombre", 
      label: "Categoría",
      sortable: true,
      exportLabel: "Categoría",
    },
    { 
      key: "precio", 
      label: "Precio",
      sortable: true,
      exportLabel: "Precio (COP)",
      exportFormat: (value: unknown) => {
        const num = Number(value);
        return isNaN(num) ? "" : num.toLocaleString("es-CO");
      },
    },
    { 
      key: "cantidad", 
      label: "Cantidad",
      sortable: true,
      exportLabel: "Cantidad en Stock",
    },
  ];

  const handleDeleteClick = (product: Product) => {
    setDeleteModal({
      isOpen: true,
      productToDelete: product,
    });
  };

  const handleConfirmDelete = async () => {
    if (!deleteModal.productToDelete) return;

    const token = localStorage.getItem("token");
    if (!token) return console.error("No hay token de autenticación disponible");

    try {
      await sendRequest({
        url: `/v1/productos/${deleteModal.productToDelete.id}`,
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      loadProductos();
      setDeleteModal({ isOpen: false, productToDelete: null });
    } catch (error) {
      console.error("Error al eliminar producto:", error);
      setDeleteModal({ isOpen: false, productToDelete: null });
    }
  };

  const handleCancelDelete = () => {
    setDeleteModal({ isOpen: false, productToDelete: null });
  };

  const actions = [
    {
      label: "Editar",
      onClick: (item: Product) => {
        setEditingProduct(item);
        setIsModalOpen(true);
      },
    },
    {
      label: "Eliminar",
      onClick: (item: Product) => handleDeleteClick(item),
    },
  ];

  const formFields: FormField[] = [
    {
      name: "nombre",
      label: "Nombre del Producto",
      type: "text",
      placeholder: "Ej: Dolex",
      required: true,
      validation: (value) => {
        if (typeof value !== "string" || value.trim().length < 3) {
          return "El nombre debe tener al menos 3 caracteres";
        }
        return undefined;
      },
      defaultValue: editingProduct?.nombre || "",
    },
    {
      name: "categoriaId",
      label: "Categoría",
      type: "select",
      placeholder: "Selecciona una categoría",
      required: true,
      options: (categorias || []).map(cat => ({
        value: cat.id,
        label: String(cat.nombre),
      })),
      validation: (value) => {
        if (!value) {
          return "Debes seleccionar una categoría";
        }
        return undefined;
      },
      defaultValue: editingProduct?.categoriaId || "",
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
        if (typeof value !== "number" || value <= 0) {
          return "El precio debe ser mayor a 0";
        }
        return undefined;
      },
      defaultValue: editingProduct?.precio ?? 0,
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
        if (typeof value !== "number" || value < 0) {
          return "La cantidad no puede ser negativa";
        }
        return undefined;
      },
      defaultValue: editingProduct?.cantidad ?? 0,
    },
  ];

  const handleSubmit = async () => {
    setIsModalOpen(false);
    setEditingProduct(null);
    loadProductos();
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const handleAddNew = () => {
    // Verificar si hay categorías disponibles
    if (!categorias || categorias.length === 0) {
      alert("No hay categorías disponibles. Por favor, crea al menos una categoría antes de crear un producto.");
      return;
    }
    setEditingProduct(null);
    setIsModalOpen(true);
  };
  
  if (loading) return <><Navbar /><div className="admin-layout"><main className="admin-content"><p>Cargando productos...</p></main></div></>;
  if (error) return <><Navbar /><div className="admin-layout"><main className="admin-content"><p>Error: {error}</p></main></div></>;

  return (
    <div className={`admin-layout ${menuAbierto ? "menu-abierto" : "menu-cerrado"}`}>
      <Navbar onMenuToggle={setMenuAbierto} />
        <main className="admin-content">
          <Table<Product>
            columns={columns}
            data={productos || []}
            actions={actions}
            rowKey="id"
            noDataMessage="No hay productos registrados"
            header={{
              title: "Gestión de Productos",
              showCreateButton: true,
              onCreateClick: handleAddNew,
              createButtonText: "Crear Producto",
              showExportButton: true,
              exportFileName: "productos",
            }}
            enablePagination={true}
            defaultRowsPerPage={10}
            rowsPerPageOptions={[5, 10, 20, 50]}
            enableSearch={true}
            enableColumnFilters={true}
          />
        </main>

      <FormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        title={editingProduct ? "Editar Producto" : "Nuevo Producto"}
        fields={formFields}
        apiUrl={editingProduct ? `/v1/productos/${editingProduct.id}` : "/v1/productos"}
        httpMethod={editingProduct ? "PUT" : "POST"}
        submitText={editingProduct ? "Actualizar" : "Crear Producto"}
      />

      <ConfirmModal
        isOpen={deleteModal.isOpen}
        title="Confirmar eliminación"
        message={`¿Estás seguro de eliminar "${deleteModal.productToDelete?.nombre}"?`}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        confirmText="Eliminar"
        cancelText="Cancelar"
        confirmButtonClass="modal-button-danger"
      />
    </div>
  );
};

export default ProductPage;