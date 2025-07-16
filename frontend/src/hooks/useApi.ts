import { axiosInstance } from "@/lib/axios";
import { useState, useCallback } from "react";
import axios from "axios";

export function useApi() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const apiCall = useCallback(
    async (
      method: "GET" | "POST" | "PUT" | "DELETE",
      url: string,
      data?: unknown
    ) => {
      setIsLoading(true);
      setError(null);

      try {
        let response;

        switch (method) {
          case "GET":
            response = await axiosInstance.get(url);
            break;
          case "POST":
            response = await axiosInstance.post(url, data);
            break;
          case "PUT":
            response = await axiosInstance.put(url, data);
            break;
          case "DELETE":
            response = await axiosInstance.delete(url);
            break;
          default:
            throw new Error(`Unsupported method: ${method}`);
        }

        return response.data;
      } catch (error) {
        let errorMessage = `Failed to ${method.toLowerCase()} ${url}`;

        if (axios.isAxiosError(error)) {
          errorMessage = error.response?.data?.message || errorMessage;
        }

        setError(errorMessage);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const get = useCallback((url: string) => apiCall("GET", url), [apiCall]);
  const post = useCallback(
    (url: string, data?: unknown) => apiCall("POST", url, data),
    [apiCall]
  );
  const put = useCallback(
    (url: string, data?: unknown) => apiCall("PUT", url, data),
    [apiCall]
  );
  const del = useCallback((url: string) => apiCall("DELETE", url), [apiCall]);

  const clearError = useCallback(() => setError(null), []);

  return {
    isLoading,
    error,
    apiCall,
    get,
    post,
    put,
    del,
    clearError,
  };
}
