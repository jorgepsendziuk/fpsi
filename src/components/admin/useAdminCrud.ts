"use client";

import { useCallback, useState } from "react";

export function useAdminCrudMessages() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const clearMessages = useCallback(() => {
    setError(null);
    setSuccess(null);
  }, []);

  const handleApiError = useCallback(async (res: Response, fallback = "Erro na operação") => {
    try {
      const data = await res.json();
      setError(data.error || fallback);
    } catch {
      setError(fallback);
    }
  }, []);

  return { error, success, setError, setSuccess, clearMessages, handleApiError };
}

export async function adminFetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Erro na requisição");
  }
  return data as T;
}
