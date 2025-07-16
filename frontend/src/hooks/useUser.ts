import { useAuth } from "@/contexts/AuthContext";
import { axiosInstance } from "@/lib/axios";
import { useState } from "react";
import { UserProfile } from "@/types";
import axios from "axios";

export function useUser() {
  const { user, logout } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUserProfile = async (): Promise<UserProfile | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get("/user/me");
      return response.data.user;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        setError(
          error.response?.data?.message || "Failed to fetch user profile"
        );
      } else {
        setError("Failed to fetch user profile");
      }
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserProfile = async (data: { name?: string; email?: string }) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.put("/user/profile", data);
      return response.data.user;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        setError(error.response?.data?.message || "Failed to update profile");
      } else {
        setError("Failed to update profile");
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const changePassword = async (
    currentPassword: string,
    newPassword: string
  ) => {
    setIsLoading(true);
    setError(null);
    try {
      await axiosInstance.put("/user/password", {
        currentPassword,
        newPassword,
      });
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        setError(error.response?.data?.message || "Failed to change password");
      } else {
        setError("Failed to change password");
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    user,
    isLoading,
    error,
    fetchUserProfile,
    updateUserProfile,
    changePassword,
    logout,
  };
}
