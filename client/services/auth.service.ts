import { apiClient } from "./apiClient";
import { User } from "../providers/AuthProvider";

interface AuthResponse {
  success: boolean;
  message?: string;
  user: User;
}

export const authService = {
  login: async (data: Record<string, unknown>) => {
    const res = await apiClient.post<AuthResponse>("/auths/login", data);
    return res.data;
  },

  register: async (data: Record<string, unknown>) => {
    const res = await apiClient.post<AuthResponse>("/auths/register", data);
    return res.data;
  },

  logout: async () => {
    const res = await apiClient.get<{ success: boolean }>("/users/logout");
    return res.data;
  },

  getProfile: async () => {
    const res = await apiClient.get<AuthResponse>("/users/profile");
    return res.data;
  },
};
