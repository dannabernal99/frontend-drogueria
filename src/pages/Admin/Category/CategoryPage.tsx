import React, { useEffect, useCallback, useState } from "react";
import "./CategoryPage.css";
import Navbar from "../../../components/Navbar/Navbar";
import Table from "../../../components/Table/Table";
import FormModal from "../../../components/FormModal/FormModal";
import { useHttp } from "../../../hooks/useHttp";
import type { FormField } from "../../../components/FormModal/FormModal";
import type { Category } from "../../../types/Category";
import ConfirmModal from "../../../components/ConfirmModal/ConfirmModal";

const CategoryPage: React.FC = () => {
  const { data: categorias, loading, error, sendRequest } = useHttp<Category[]>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    CategoryToDelete: null as Category | null,
  });

  const [menuAbierto, setMenuAbierto] = useState(true);

  const loadCategoryos = useCallback(() => {
    const token = localStorage.getItem("token");
    
    if (!token) {
      console.error("No hay token de autenticación disponible");
      return;
    }

    sendRequest({
      url: "/v1/categorias",
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }, [sendRequest]);

  useEffect(() => {
    loadCategoryos();
  }, [loadCategoryos]);

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
      exportLabel: "Nombre de la categoría",
    },
    { 
      key: "descripcion", 
      label: "Descripción",
      sortable: true,
      exportLabel: "Descripción",
    },
  ];

  const handleDeleteClick = (Category: Category) => {
    setDeleteModal({
      isOpen: true,
      CategoryToDelete: Category,
    });
  };

  const handleConfirmDelete = async () => {
    if (!deleteModal.CategoryToDelete) return;

    const token = localStorage.getItem("token");
    if (!token) return console.error("No hay token de autenticación disponible");

    try {
      await sendRequest({
        url: `/v1/categorias/${deleteModal.CategoryToDelete.id}`,
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      loadCategoryos();
      setDeleteModal({ isOpen: false, CategoryToDelete: null });
    } catch (error) {
      console.error("Error al eliminar la categoría:", error);
      setDeleteModal({ isOpen: false, CategoryToDelete: null });
    }
  };

  const handleCancelDelete = () => {
    setDeleteModal({ isOpen: false, CategoryToDelete: null });
  };

  const actions = [
    {
      label: "Editar",
      onClick: (item: Category) => {
        setEditingCategory(item);
        setIsModalOpen(true);
      },
    },
    {
      label: "Eliminar",
      onClick: (item: Category) => handleDeleteClick(item),
    },
  ];

  const formFields: FormField[] = [
    {
      name: "nombre",
      label: "Nombre de la categoría",
      type: "text",
      placeholder: "Ej: Analgésicos",
      required: true,
      validation: (value) => {
        if (typeof value !== "string" || value.trim().length < 3) {
          return "El nombre debe tener al menos 3 caracteres";
        }
        return undefined;
      },
      defaultValue: editingCategory?.nombre || "",
    },
    {
      name: "descripcion",
      label: "Descripción",
      type: "textarea",
      placeholder: "Describe la categoría...",
      required: true,
      validation: (value) => {
        if (typeof value !== "string" || value.trim().length < 10) {
          return "La descripción debe tener al menos 10 caracteres";
        }
        return undefined;
      },
      defaultValue: editingCategory?.descripcion || "",
    },
  ];

  const handleSubmit = async () => {
    setIsModalOpen(false);
    setEditingCategory(null);
    loadCategoryos();
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
  };

  const handleAddNew = () => {
    setEditingCategory(null);
    setIsModalOpen(true);
  };
  
  if (loading) return <><Navbar /><div className="admin-layout"><main className="admin-content"><p>Cargando Categorías...</p></main></div></>;
  if (error) return <><Navbar /><div className="admin-layout"><main className="admin-content"><p>Error: {error}</p></main></div></>;

  return (
    <div className={`admin-layout ${menuAbierto ? "menu-abierto" : "menu-cerrado"}`}>
      <Navbar onMenuToggle={setMenuAbierto} />
        <main className="admin-content">
          <Table<Category>
            columns={columns}
            data={categorias || []}
            actions={actions}
            rowKey="id"
            noDataMessage="No hay categorías registradas"
            header={{
              title: "Gestión de Categorías",
              showCreateButton: true,
              onCreateClick: handleAddNew,
              createButtonText: "Crear Categoría",
              showExportButton: true,
              exportFileName: "Categorías",
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
        title={editingCategory ? "Editar Categoría" : "Nueva Categoría"}
        fields={formFields}
        apiUrl={editingCategory ? `/v1/categorias/${editingCategory.id}` : "/v1/categorias"}
        httpMethod={editingCategory ? "PUT" : "POST"}
        submitText={editingCategory ? "Actualizar" : "Crear Categoría"}
      />

      <ConfirmModal
        isOpen={deleteModal.isOpen}
        title="Confirmar eliminación"
        message={`¿Estás seguro de eliminar "${deleteModal.CategoryToDelete?.nombre}"?`}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        confirmText="Eliminar"
        cancelText="Cancelar"
        confirmButtonClass="modal-button-danger"
      />
    </div>
  );
};

export default CategoryPage;