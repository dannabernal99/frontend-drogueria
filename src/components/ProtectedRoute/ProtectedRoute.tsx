import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { isAuthenticated, usuario, loading } = useAuth();

  if (loading) {
    return null; // o spinner si lo deseas
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Validar si el rol del usuario está permitido
  if (allowedRoles && usuario) {
    const userRole = usuario.roleNombre?.toUpperCase();

    if (!allowedRoles.includes(userRole)) {
      if (userRole === "ADMIN") {
        return <Navigate to="/admin/dashboard" replace />;
      } else if (userRole === "USER") {
        return <Navigate to="/dashboard" replace />;
      } else {
        return <Navigate to="/" replace />;
      }
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
