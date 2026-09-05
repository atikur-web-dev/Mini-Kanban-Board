const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export class ApiClient {
  private token: string | null = null;

  setToken(token: string | null) {
    console.log("Setting token:", token ? "Token present" : "Token null"); // Debug
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
      console.log("Getting token from localStorage:", this.token ? "Present" : "Null"); // Debug
    }
    return this.token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_URL}${endpoint}`;
    const token = this.getToken();
    
    console.log("Request to:", url);
    console.log("Token:", token ? "Present" : "Null");

    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    if (token) {
      (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, { ...options, headers });
      
      // If 401, clear token and redirect to login
      if (response.status === 401) {
        console.error("401 Unauthorized - Clearing token");
        this.setToken(null);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
        throw new Error("Session expired. Please login again.");
      }

      const data: unknown = await response.json();

      if (!response.ok) {
        let errorMessage = "Something went wrong";
        if (data && typeof data === "object" && "error" in data) {
          errorMessage = String(data.error);
        } else if (data && typeof data === "object" && "message" in data) {
          errorMessage = String(data.message);
        }
        throw new Error(errorMessage);
      }

      return data as T;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Network error - Please check if backend is running");
    }
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