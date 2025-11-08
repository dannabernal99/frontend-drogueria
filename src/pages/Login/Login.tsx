import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import Button from "../../components/Button/Button";
import { useHttp } from "../../hooks/useHttp";
import Navbar from "../../components/Navbar/Navbar";

const Login: React.FC = () => {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [submitted, setSubmitted] = useState(false);

  const navigate = useNavigate();
  const { data, loading, error, sendRequest } = useHttp<{
    token: string;
    usuario: Record<string, unknown>;
  }>();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitted(true);

    await sendRequest({
      url: "/v1/auth/login",
      method: "POST",
      body: { username, password },
    });
  };

  useEffect(() => {
    if (data && data.token) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("usuario", JSON.stringify(data.usuario));
      navigate("/dashboard");
    }
  }, [data, navigate]);

  return (<>
    <Navbar />
    <div className="login-container">
      <h2 className="login-title">Iniciar Sesión</h2>

      <form className="login-form" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Nombre de usuario"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <Button
          text={loading ? "Cargando..." : "Ingresar"}
          type="submit"
          variant="primary"
        />

        {submitted && error && (
          <p className="error-message">{error}</p>
        )}
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
  </>);
};

export default Login;
