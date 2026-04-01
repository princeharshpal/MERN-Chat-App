import axiosInstance from "../lib/axios";

const signup = async (data: any) => {
  const response = await axiosInstance.post("/auth/signup", data);
  return response.data;
};

const login = async (data: any) => {
  const response = await axiosInstance.post("/auth/login", data);
  return response.data;
};

const logout = async () => {
  const response = await axiosInstance.post("/auth/logout");
  return response.data;
};

const checkAuth = async () => {
  const response = await axiosInstance.get("/auth/me");
  return response.data;
};

export { signup, login, logout, checkAuth };
