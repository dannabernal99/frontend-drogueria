import React from "react";
import "./Modal.css";

interface ModalProps {
  isOpen: boolean;
  title?: string;
  message: string;
  onClose: () => void;
}

const Modal: React.FC<ModalProps> = ({ isOpen, title, message, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {title && <h3 className="modal-title">{title}</h3>}
        <p className="modal-message">{message}</p>
        <button className="modal-button" onClick={onClose}>
          Cerrar
        </button>
      </div>
    </div>
  );
};

export default Modal;