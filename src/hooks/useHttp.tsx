import { useState, useCallback } from "react";
import { API_BASE_URL } from "../config/apiConfi";

interface RequestConfig {
  url: string;
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  headers?: Record<string, string>;
  body?: any;
}

interface HttpResponse<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  sendRequest: (config: RequestConfig) => Promise<void>;
  reset: () => void;
}

export function useHttp<T = any>(): HttpResponse<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendRequest = useCallback(async (config: RequestConfig) => {
    setLoading(true);
    setError(null);

    try {
      const fullUrl = config.url.startsWith("http")
        ? config.url
        : `${API_BASE_URL}${config.url}`;

      const response = await fetch(fullUrl, {
        method: config.method || "GET",
        headers: {
          "Content-Type": "application/json",
          ...(config.headers || {}),
        },
        body: config.body ? JSON.stringify(config.body) : undefined,
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("No autorizado. Por favor, inicia sesión nuevamente.");
        } else if (response.status === 403) {
          throw new Error("Acceso prohibido. No tienes permisos para esta acción.");
        } else if (response.status === 404) {
          throw new Error("Recurso no encontrado.");
        } else if (response.status >= 500) {
          throw new Error("Error del servidor. Intenta más tarde.");
        } else {
          throw new Error(`Error HTTP: ${response.status}`);
        }
      }

      // Intentar parsear la respuesta como JSON
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const jsonData = await response.json();
        setData(jsonData);
      } else {
        // Si no es JSON, intentar como texto
        const textData = await response.text();
        setData(textData as any);
      }

    } catch (err: any) {
      const errorMessage = err.message || "Error inesperado al realizar la petición";
      setError(errorMessage);
      console.error("[HTTP] Error:", errorMessage, err);

      // Si es error de autenticación, podríamos limpiar el token
      if (err.message.includes("No autorizado")) {
        localStorage.removeItem("token");
        // Opcional: redirigir al login
        // window.location.href = "/login";
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return { data, loading, error, sendRequest, reset };
}