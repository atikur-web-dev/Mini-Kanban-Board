const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

// Type guard for error response
interface ErrorResponse {
  error?: string;
  message?: string;
}

const isErrorResponse = (data: unknown): data is ErrorResponse => {
  return (
    typeof data === "object" &&
    data !== null &&
    ("error" in data || "message" in data)
  );
};

export class ApiClient {
  private token: string | null = null;

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem("token", token);
    } else {
      localStorage.removeItem("token");
    }
  }

  getToken(): string | null {
    if (!this.token) {
      this.token = localStorage.getItem("token");
    }
    return this.token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_URL}${endpoint}`;
    const token = this.getToken();

    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    if (token) {
      // Fix: Use type assertion for headers
      (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(url, { ...options, headers });
    const data: unknown = await response.json();

    if (!response.ok) {
      let errorMessage = "Something went wrong";
      
      if (isErrorResponse(data)) {
        errorMessage = data.error || data.message || errorMessage;
      }
      
      throw new Error(errorMessage);
    }

    return data as T;
  }

  get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "GET" });
  }

  post<T>(endpoint: string, body?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  patch<T>(endpoint: string, body: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
  }

  delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "DELETE" });
  }
}

export const api = new ApiClient();