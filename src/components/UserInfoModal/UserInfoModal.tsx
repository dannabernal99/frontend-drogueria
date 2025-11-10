// src/components/UserInfoModal/UserInfoModal.tsx
import React, { useState } from "react";
import "./UserInfoModal.css";

interface UserInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (username: string) => void;
}

const UserInfoModal: React.FC<UserInfoModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [username, setUsername] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      onSubmit(username.trim());
      setUsername("");
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content user-info-modal" onClick={(e) => e.stopPropagation()}>
        <h3 className="modal-title">Identificación de Usuario</h3>
        <p className="modal-description">
          Por favor, ingresa tu nombre de usuario para continuar con la compra.
        </p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Nombre de Usuario</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Ingresa tu username"
              required
              className="form-input"
              autoFocus
            />
          </div>
          <div className="modal-buttons">
            <button type="button" className="modal-button secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="modal-button primary">
              Continuar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserInfoModal;