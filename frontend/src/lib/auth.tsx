"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { api, User } from "@/lib/api";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (data: {
    username: string;
    password: string;
    first_name?: string;
    last_name?: string;
    email?: string;
    direction?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.auth.me().then((data) => {
      if (data && "id" in data) {
        setUser(data as User);
      }
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const login = async (username: string, password: string) => {
    const u = await api.auth.login({ username, password });
    setUser(u);
  };

  const register = async (data: {
    username: string;
    password: string;
    first_name?: string;
    last_name?: string;
    email?: string;
    direction?: string;
  }) => {
    const u = await api.auth.register(data);
    setUser(u);
  };

  const logout = async () => {
    await api.auth.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
