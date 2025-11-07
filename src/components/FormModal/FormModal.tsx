import React, { useState, useEffect } from "react";
import "./FormModal.css";
import { useHttp } from "../../hooks/useHttp";

export type FieldType = "text" | "number" | "email" | "password" | "textarea" | "select" | "date";

export interface FormField {
  name: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  required?: boolean;
  min?: number;
  max?: number;
  step?: number;
  options?: { value: string | number; label: string }[];
  validation?: (value: any) => string | undefined;
  disabled?: boolean;
  defaultValue?: any;
}

interface FormModalProps {
  isOpen: boolean;
  title: string;
  fields: FormField[];
  onClose: () => void;
  onSubmit: (data: Record<string, any>) => void | Promise<void>;
  submitText?: string;
  cancelText?: string;
  apiUrl?: string;
  httpMethod?: "POST" | "PUT" | "PATCH";
  includeAuth?: boolean;
}

const FormModal: React.FC<FormModalProps> = ({
  isOpen,
  title,
  fields,
  onClose,
  onSubmit,
  submitText = "Guardar",
  cancelText = "Cancelar",
  apiUrl,
  httpMethod = "POST",
  includeAuth = true,
}) => {
  const { loading, error, sendRequest } = useHttp();
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (isOpen) {
      const initialData: Record<string, any> = {};
      fields.forEach(field => {
        initialData[field.name] = field.defaultValue ?? "";
      });
      setFormData(initialData);
      setValidationErrors({});
      setTouched({});
    }
  }, [isOpen, fields]);

  const handleChange = (name: string, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (!touched[name]) {
      setTouched(prev => ({ ...prev, [name]: true }));
    }
    const field = fields.find(f => f.name === name);
    if (field && touched[name]) {
      validateField(field, value);
    }
  };

  const validateField = (field: FormField, value: any): string | undefined => {
    let error: string | undefined;
    if (field.required && (!value || value === "")) {
      error = `${field.label} es requerido`;
    } else if (field.type === "number" && value !== "") {
      const numValue = Number(value);
      if (isNaN(numValue)) {
        error = `${field.label} debe ser un número`;
      } else if (field.min !== undefined && numValue < field.min) {
        error = `${field.label} debe ser mayor o igual a ${field.min}`;
      } else if (field.max !== undefined && numValue > field.max) {
        error = `${field.label} debe ser menor o igual a ${field.max}`;
      }
    } else if (field.type === "email" && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      error = `${field.label} debe ser un email válido`;
    } else if (field.validation) {
      error = field.validation(value);
    }
    setValidationErrors(prev => {
      if (error) {
        return { ...prev, [field.name]: error };
      } else {
        const newErrors = { ...prev };
        delete newErrors[field.name];
        return newErrors;
      }
    });
    return error;
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    fields.forEach(field => {
      const value = formData[field.name];
      const error = validateField(field, value);
      if (error) {
        errors[field.name] = error;
      }
    });
    setValidationErrors(errors);
    const allTouched: Record<string, boolean> = {};
    fields.forEach(field => {
      allTouched[field.name] = true;
    });
    setTouched(allTouched);
    return Object.keys(errors).length === 0;
  };

  const processFormData = (data: Record<string, any>): Record<string, any> => {
    const processed: Record<string, any> = {};
    fields.forEach(field => {
      let value = data[field.name];
      if (field.type === "number" && value !== "") {
        value = Number(value);
      }
      if (field.type === "text" || field.type === "email" || field.type === "textarea") {
        value = typeof value === "string" ? value.trim() : value;
      }
      processed[field.name] = value;
    });
    return processed;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    const processedData = processFormData(formData);
    try {
      if (apiUrl) {
        const token = localStorage.getItem("token");
        const headers: Record<string, string> = {};
        if (includeAuth && token) {
          headers.Authorization = `Bearer ${token}`;
        }
        await sendRequest({
          url: apiUrl,
          method: httpMethod,
          headers,
          body: processedData,
        });
      }
      await onSubmit(processedData);
    } catch (err) {
      console.error("Error al enviar formulario:", err);
    }
  };

  const renderField = (field: FormField) => {
    const hasError = touched[field.name] && validationErrors[field.name];
    const value = formData[field.name] ?? "";
    switch (field.type) {
      case "textarea":
        return (
          <textarea
            id={field.name}
            name={field.name}
            value={value}
            onChange={(e) => handleChange(field.name, e.target.value)}
            onBlur={() => setTouched(prev => ({ ...prev, [field.name]: true }))}
            placeholder={field.placeholder}
            className={hasError ? "input-error" : ""}
            disabled={field.disabled || loading}
            required={field.required}
            rows={4}
          />
        );
      case "select":
        return (
          <select
            id={field.name}
            name={field.name}
            value={value}
            onChange={(e) => handleChange(field.name, e.target.value)}
            onBlur={() => setTouched(prev => ({ ...prev, [field.name]: true }))}
            className={hasError ? "input-error" : ""}
            disabled={field.disabled || loading}
            required={field.required}
          >
            <option value="">Seleccionar...</option>
            {field.options?.map(opt => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        );
      default:
        return (
          <input
            type={field.type}
            id={field.name}
            name={field.name}
            value={value}
            onChange={(e) => handleChange(field.name, e.target.value)}
            onBlur={() => setTouched(prev => ({ ...prev, [field.name]: true }))}
            placeholder={field.placeholder}
            className={hasError ? "input-error" : ""}
            disabled={field.disabled || loading}
            required={field.required}
            min={field.min}
            max={field.max}
            step={field.step}
          />
        );
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !loading) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleBackdropClick}>
      <div className="modal-container">
        <div className="modal-header">
          <h3>{title}</h3>
          <button
            className="modal-close"
            onClick={onClose}
            disabled={loading}
            type="button"
          >
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit} className="modal-body">
          {error && (
            <div className="form-error-banner">
              <span>⚠️</span>
              <p>{error}</p>
            </div>
          )}
          {fields.map((field) => (
            <div key={field.name} className="form-group">
              <label htmlFor={field.name}>
                {field.label}
                {field.required && <span className="required">*</span>}
              </label>
              {renderField(field)}
              {touched[field.name] && validationErrors[field.name] && (
                <span className="error-message">{validationErrors[field.name]}</span>
              )}
            </div>
          ))}
          <div className="modal-footer">
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
              disabled={loading}
            >
              {cancelText}
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
            >
              {loading ? "Guardando..." : submitText}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FormModal;
