import React, { useState } from "react";
import "./Register.css";
import { useNavigate } from "react-router-dom";
import Button from "../../components/Button/Button";
import { useHttp } from "../../hooks/useHttp";
import Modal from "../../components/Modal/Modal";
import Navbar from "../../components/Navbar/Navbar";

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    email: "",
    nombreCompleto: "",
    telefono: "",
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  const navigate = useNavigate();
  const { loading, error, sendRequest } = useHttp();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    await sendRequest({
      url: "/v1/auth/register",
      method: "POST",
      body: formData,
    });

    if (!error) {
      setModalMessage("Usuario registrado con éxito");
      setModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    navigate("/");
  };

  return (<>
  <Navbar />
    <div className="register-container">
      <h2 className="register-title">Registro de Usuario</h2>

      <form className="register-form" onSubmit={handleSubmit}>
        <input
          type="text"
          name="username"
          placeholder="Nombre de usuario"
          value={formData.username}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Contraseña"
          value={formData.password}
          onChange={handleChange}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Correo electrónico"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="nombreCompleto"
          placeholder="Nombre completo"
          value={formData.nombreCompleto}
          onChange={handleChange}
          required
        />
        <input
          type="tel"
          name="telefono"
          placeholder="Teléfono"
          value={formData.telefono}
          onChange={handleChange}
          required
        />

        <Button
          text={loading ? "Registrando..." : "Registrarse"}
          type="submit"
          variant="primary"
        />
      </form>

      <p className="register-login">
        ¿Ya tienes cuenta?{" "}
        <Button
          text="Iniciar Sesión"
          type="button"
          variant="secondary"
          onClick={() => navigate("/")}
        />
      </p>

      <Modal
        isOpen={modalOpen}
        title="Registro exitoso"
        message={modalMessage}
        onClose={handleCloseModal}
      />
    </div>
  </>);
};

export default Register;