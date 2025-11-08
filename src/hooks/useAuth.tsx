import { useState, useEffect } from "react";

interface Usuario {
  id: number;
  username: string;
  email: string;
  nombreCompleto: string;
  telefono: string;
  activo: boolean;
  fechaCreacion: string;
  fechaActualizacion: string;
  roleId: number;
  roleNombre: string;
}

export const useAuth = () => {
  const [token, setToken] = useState<string | null>(null);
  const [usuario, setUsuario] = useState<Usuario | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("usuario");

    if (storedToken) setToken(storedToken);
    if (storedUser) setUsuario(JSON.parse(storedUser));
  }, []);

  const login = (token: string, usuario: Usuario) => {
    localStorage.setItem("token", token);
    localStorage.setItem("usuario", JSON.stringify(usuario));
    setToken(token);
    setUsuario(usuario);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    setToken(null);
    setUsuario(null);
  };

  return { token, usuario, login, logout, isAuthenticated: !!token };
};
