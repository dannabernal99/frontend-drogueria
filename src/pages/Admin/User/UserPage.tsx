import React, { useEffect, useCallback, useState } from "react";
import "./UserPage.css";
import Navbar from "../../../components/Navbar/Navbar";
import Table from "../../../components/Table/Table";
import FormModal from "../../../components/FormModal/FormModal";
import { useHttp } from "../../../hooks/useHttp";
import type { FormField } from "../../../components/FormModal/FormModal";
import type { User } from "../../../types/User";
import ConfirmModal from "../../../components/ConfirmModal/ConfirmModal";

const UserPage: React.FC = () => {
  const { data: usuarios, loading, error, sendRequest } = useHttp<User[]>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    userToDelete: null as User | null,
  });
  const [menuAbierto, setMenuAbierto] = useState(true);

  const loadUsers = useCallback(() => {
    const token = localStorage.getItem("token");
    if (!token) return console.error("No hay token de autenticación disponible");

    sendRequest({
      url: "/v1/usuarios",
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });
  }, [sendRequest]);

  useEffect(() => { loadUsers(); }, [loadUsers]);

  const columns = [
    { key: "id", label: "ID", sortable: true },
    { key: "username", label: "Usuario", sortable: true },
    { key: "nombreCompleto", label: "Nombre completo", sortable: true },
    { key: "email", label: "Correo", sortable: true },
    { key: "telefono", label: "Teléfono", sortable: true },
    { key: "roleNombre", label: "Rol", sortable: true },
  ];

  const handleDeleteClick = (user: User) => {
    setDeleteModal({ isOpen: true, userToDelete: user });
  };

  const handleConfirmDelete = async () => {
    if (!deleteModal.userToDelete) return;

    const token = localStorage.getItem("token");
    if (!token) return console.error("No hay token de autenticación disponible");

    try {
      await sendRequest({
        url: `/v1/usuarios/${deleteModal.userToDelete.id}`,
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      loadUsers();
      setDeleteModal({ isOpen: false, userToDelete: null });
    } catch (error) {
      console.error("Error al eliminar el usuario:", error);
      setDeleteModal({ isOpen: false, userToDelete: null });
    }
  };

  const handleCancelDelete = () => setDeleteModal({ isOpen: false, userToDelete: null });

  const actions = [
    { label: "Editar", onClick: (item: User) => { setEditingUser(item); setIsModalOpen(true); } },
    { label: "Eliminar", onClick: (item: User) => handleDeleteClick(item) },
  ];

  const formFields: FormField[] = [
    {
      name: "username",
      label: "Usuario",
      type: "text",
      placeholder: "Ej: juanperez",
      required: true,
      validation: (value) =>
        typeof value !== "string" || value.trim().length < 3
          ? "El usuario debe tener al menos 3 caracteres"
          : undefined,
      defaultValue: editingUser?.username || "",
    },
    {
      name: "nombreCompleto",
      label: "Nombre completo",
      type: "text",
      placeholder: "Ej: Juan Pérez",
      required: true,
      validation: (value) =>
        typeof value !== "string" || value.trim().length < 3
          ? "El nombre completo debe tener al menos 3 caracteres"
          : undefined,
      defaultValue: editingUser?.nombreCompleto || "",
    },
    {
      name: "email",
      label: "Correo",
      type: "email",
      placeholder: "Ej: juan.perez@example.com",
      required: true,
      validation: (value) =>
        typeof value !== "string" || !/\S+@\S+\.\S+/.test(value)
          ? "Correo inválido"
          : undefined,
      defaultValue: editingUser?.email || "",
    },
    {
      name: "telefono",
      label: "Teléfono",
      type: "text",
      placeholder: "Ej: 3111234567",
      required: true,
      validation: (value) =>
        typeof value !== "string" || value.trim().length < 7
          ? "Teléfono inválido"
          : undefined,
      defaultValue: editingUser?.telefono || "",
    },
    {
      name: "roleNombre",
      label: "Rol",
      type: "select",
      required: true,
      options: [
        { value: "USER", label: "USER" },
        { value: "ADMIN", label: "ADMIN" },
      ],
      defaultValue: editingUser?.roleNombre || "USER",
    },
    {
      name: "password",
      label: "Contraseña",
      type: "password",
      placeholder: "********",
      required: true,
      validation: (value) =>
        typeof value !== "string" || value.length < 6
          ? "La contraseña debe tener al menos 6 caracteres"
          : undefined,
      defaultValue: "",
    },
    {
      name: "confirmPassword",
      label: "Confirmar Contraseña",
      type: "password",
      placeholder: "********",
      required: true,
      validation: (value, formData) => {
        if (typeof value !== "string" || value.length < 6) {
          return "La contraseña debe tener al menos 6 caracteres";
        }
        if (value !== formData.password) {
          return "Las contraseñas no coinciden";
        }
        return undefined;
      },
      defaultValue: "",
    },
  ];

  const handleSubmit = async () => {
    setIsModalOpen(false);
    setEditingUser(null);
    loadUsers();
  };

  const handleCloseModal = () => { setIsModalOpen(false); setEditingUser(null); };
  const handleAddNew = () => { setEditingUser(null); setIsModalOpen(true); };

  if (loading) return <><Navbar /><div className="admin-layout"><main className="admin-content"><p>Cargando usuarios...</p></main></div></>;
  if (error) return <><Navbar /><div className="admin-layout"><main className="admin-content"><p>Error: {error}</p></main></div></>;

  return (
    <div className={`admin-layout ${menuAbierto ? "menu-abierto" : "menu-cerrado"}`}>
      <Navbar onMenuToggle={setMenuAbierto} />
      <main className="admin-content">
        <Table<User>
          columns={columns}
          data={usuarios || []}
          actions={actions}
          rowKey="id"
          noDataMessage="No hay usuarios registrados"
          header={{
            title: "Gestión de Usuarios",
            showCreateButton: true,
            onCreateClick: handleAddNew,
            createButtonText: "Crear Usuario",
            showExportButton: true,
            exportFileName: "usuarios",
          }}
          enablePagination
          defaultRowsPerPage={10}
          rowsPerPageOptions={[5, 10, 20, 50]}
          enableSearch
          enableColumnFilters
        />
      </main>

      <FormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        title={editingUser ? "Editar Usuario" : "Nuevo Usuario"}
        fields={formFields}
        apiUrl={editingUser ? `/v1/usuarios/${editingUser.id}` : "/v1/usuarios"}
        httpMethod={editingUser ? "PUT" : "POST"}
        submitText={editingUser ? "Actualizar" : "Crear Usuario"}
      />

      <ConfirmModal
        isOpen={deleteModal.isOpen}
        title="Confirmar eliminación"
        message={`¿Estás seguro de eliminar "${deleteModal.userToDelete?.username}"?`}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        confirmText="Eliminar"
        cancelText="Cancelar"
        confirmButtonClass="modal-button-danger"
      />
    </div>
  );
};

export default UserPage;
