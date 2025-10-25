import { useState } from "react";
import { API_BASE_URL } from "../config/apiConfi";

interface RequestConfig {
  url: string;
  method?: "GET" | "POST" | "PUT" | "DELETE";
  headers?: Record<string, string>;
  body?: any;
}

interface HttpResponse<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  sendRequest: (config: RequestConfig) => Promise<void>;
}

export function useHttp<T = any>(): HttpResponse<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendRequest = async (config: RequestConfig) => {
    setLoading(true);
    setError(null);

    try {
      // Si la URL no incluye "http", la concatenamos con la base
      const fullUrl = config.url.startsWith("http")
        ? config.url
        : `${API_BASE_URL}${config.url}`;

      const response = await fetch(fullUrl, {
        method: config.method || "GET",
        headers: {
          "Content-Type": "application/json",
          ...(config.headers || {}),
        },
        body: config.body ? JSON.stringify(config.body) : null,
      });

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      const data = await response.json();
      setData(data);
    } catch (err: any) {
      setError(err.message || "Error inesperado");
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, sendRequest };
}
