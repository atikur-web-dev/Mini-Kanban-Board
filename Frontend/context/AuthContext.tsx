"use client";

import React, {
  createContext,
  useState,
  ReactNode,
  useCallback,
} from "react";

import { api, authApi } from "@/lib/api";
import { User } from "@/types";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);

const getInitialUser = (): User | null => {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const token = localStorage.getItem("token");

    if (!token) {
      return null;
    }

    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      return null;
    }

    return JSON.parse(storedUser);
  } catch {
    return null;
  }
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(getInitialUser);
  const [loading, setLoading] = useState(false);

  const login = useCallback(
    async (email: string, password: string) => {
      setLoading(true);

      try {
        const response = await authApi.login({ email, password });
        const { user, token } = response;

        api.setToken(token);
        setUser(user);
        localStorage.setItem("user", JSON.stringify(user));
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      setLoading(true);

      try {
        const response = await authApi.register({
          name,
          email,
          password,
        });

        const { user, token } = response;

        api.setToken(token);
        setUser(user);
        localStorage.setItem("user", JSON.stringify(user));
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const logout = useCallback(() => {
    api.setToken(null);
    setUser(null);
    localStorage.removeItem("user");
  }, []);

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}