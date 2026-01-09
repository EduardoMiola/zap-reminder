/**
 * API Service Layer
 * Responsabilidade: Centralizar a comunicação HTTP e injetar o Token JWT automaticamente.
 */

const BASE_URL = "http://localhost:3333";

export async function apiRequest(
  endpoint: string,
  method: string = "GET",
  body?: any
) {
  const token = localStorage.getItem("zap_token");

  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (response.status === 401) {
    // Token expirado ou inválido
    localStorage.removeItem("zap_token");
    window.location.href = "/login";
    throw new Error("Unauthorized");
  }

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "API Error");
  }

  // Retorna null se não tiver conteúdo (ex: 204 No Content)
  if (response.status === 204) return null;

  return await response.json();
}
