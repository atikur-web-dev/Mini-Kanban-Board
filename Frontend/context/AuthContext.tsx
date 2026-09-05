"use client";

import React, {
  createContext,
  useCallback,
  useMemo,
  useState,
  ReactNode,
  useSyncExternalStore,
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

export const AuthContext = createContext<
  AuthContextType | undefined
>(undefined);

const AUTH_EVENT = "auth-storage";

const getUserSnapshot = (): string | null => {
  return localStorage.getItem("user");
};

const getServerUserSnapshot = (): string | null => {
  return null;
};

const subscribeToAuth = (callback: () => void) => {
  window.addEventListener("storage", callback);
  window.addEventListener(AUTH_EVENT, callback);

  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(AUTH_EVENT, callback);
  };
};

const getHydrationSnapshot = (): boolean => true;

const getServerHydrationSnapshot = (): boolean => false;

const subscribeToHydration = () => {
  return () => {};
};

const notifyAuthChange = () => {
  window.dispatchEvent(new Event(AUTH_EVENT));
};

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const userSnapshot = useSyncExternalStore(
    subscribeToAuth,
    getUserSnapshot,
    getServerUserSnapshot,
  );

  const isHydrated = useSyncExternalStore(
    subscribeToHydration,
    getHydrationSnapshot,
    getServerHydrationSnapshot,
  );

  const [loading, setLoading] = useState(false);

  const user = useMemo<User | null>(() => {
    if (!userSnapshot) {
      return null;
    }

    try {
      return JSON.parse(userSnapshot) as User;
    } catch {
      return null;
    }
  }, [userSnapshot]);

  const login = useCallback(
    async (email: string, password: string) => {
      setLoading(true);

      try {
        const response = await authApi.login({
          email,
          password,
        });

        const { user, token } = response;

        api.setToken(token);
        localStorage.setItem("user", JSON.stringify(user));

        notifyAuthChange();
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const register = useCallback(
    async (
      name: string,
      email: string,
      password: string,
    ) => {
      setLoading(true);

      try {
        const response = await authApi.register({
          name,
          email,
          password,
        });

        const { user, token } = response;

        api.setToken(token);
        localStorage.setItem("user", JSON.stringify(user));

        notifyAuthChange();
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const logout = useCallback(() => {
    api.setToken(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    notifyAuthChange();
  }, []);

  const value = {
    user,
    loading: loading || !isHydrated,
    login,
    register,
    logout,
    isAuthenticated: isHydrated && !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}