"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { axiosInstance } from "@/lib/axios";
import { User } from "@/types";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await axiosInstance.get("/user/me");
      if (response.data.user) {
        setUser(response.data.user);
      }
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await axiosInstance.post("/user/signin", {
        email,
        password,
      });

      if (response.data.userId) {
        setUser({
          id: response.data.userId,
          email: response.data.email,
          name: response.data.name,
        });
      }
    } catch (error) {
      throw error;
    }
  };

  const signup = async (name: string, email: string, password: string) => {
    try {
      await axiosInstance.post("/user/signup", {
        name,
        email,
        password,
      });

      await login(email, password);
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await axiosInstance.post("/user/logout");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
    }
  };

  const value = {
    user,
    isLoading,
    login,
    signup,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
