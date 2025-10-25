import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import Button from "../../components/Button/Button";

const Login: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  };

  return (
    <div className="login-container">
      <h2 className="login-title">Iniciar Sesión</h2>
      <form className="login-form" onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <Button text="Ingresar" type="submit" variant="primary" />
      </form>
      <p className="login-register">
        ¿No tienes cuenta?{" "}
        <Button
          text="Registrarse"
          type="button"
          variant="secondary"
          onClick={() => navigate("/register")}
        />
      </p>
    </div>
  );
};

export default Login;