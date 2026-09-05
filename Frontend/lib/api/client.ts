import { API_URL } from "../constants";

export class ApiClient {
  private token: string | null = null;

  setToken(token: string | null) {
    this.token = token;

    if (typeof window === "undefined") {
      return;
    }

    if (token) {
      localStorage.setItem("token", token);
    } else {
      localStorage.removeItem("token");
    }
  }

  getToken(): string | null {
    if (this.token) {
      return this.token;
    }

    if (typeof window === "undefined") {
      return null;
    }

    this.token = localStorage.getItem("token");
    return this.token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const url = `${API_URL}${endpoint}`;
    const token = this.getToken();

    const headers = new Headers(options.headers);
    headers.set("Content-Type", "application/json");

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (response.status === 401) {
        this.setToken(null);

        if (typeof window !== "undefined") {
          localStorage.removeItem("user");
          window.location.href = "/login";
        }

        throw new Error("Session expired. Please login again.");
      }

      if (response.status === 204) {
        return undefined as T;
      }

      const text = await response.text();

      let data: unknown = undefined;

      if (text.trim()) {
        try {
          data = JSON.parse(text);
        } catch {
          data = text;
        }
      }

      if (!response.ok) {
        let errorMessage = "Something went wrong";

        if (
          data &&
          typeof data === "object" &&
          "error" in data
        ) {
          const error = data.error;

          if (
            error &&
            typeof error === "object" &&
            "message" in error &&
            typeof error.message === "string"
          ) {
            errorMessage = error.message;
          } else if (typeof error === "string") {
            errorMessage = error;
          }
        } else if (
          data &&
          typeof data === "object" &&
          "message" in data &&
          typeof data.message === "string"
        ) {
          errorMessage = data.message;
        } else if (typeof data === "string" && data) {
          errorMessage = data;
        }

        throw new Error(errorMessage);
      }

      return data as T;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }

      throw new Error(
        "Network error - Please check if backend is running",
      );
    }
  }

  get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: "GET",
    });
  }

  post<T>(
    endpoint: string,
    body?: unknown,
  ): Promise<T> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  }

  patch<T>(
    endpoint: string,
    body: unknown,
  ): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
  }

  delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: "DELETE",
    });
  }
}

export const api = new ApiClient();