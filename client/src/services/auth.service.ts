import axiosInstance from "../lib/axios";

export const signup = async (data: any) => {
  const response = await axiosInstance.post("/auth/signup", data);
  return response.data;
};

export const login = async (data: any) => {
  const response = await axiosInstance.post("/auth/login", data);
  return response.data;
};

export const logout = async () => {
  const response = await axiosInstance.post("/auth/logout");
  return response.data;
};

export const getMe = async () => {
  const response = await axiosInstance.get("/auth/me");
  return response.data;
};

export const updateProfile = async (data: any) => {
  const response = await axiosInstance.put("/auth/profile", data);
  return response.data;
};

export const partialUpdateProfile = async (data: any) => {
  const response = await axiosInstance.patch("/auth/profile", data);
  return response.data;
};
