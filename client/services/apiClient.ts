import axios from "axios";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";


export const apiClient = axios.create({
  baseURL: BACKEND_URL,
  withCredentials: true,
});


apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    
    return Promise.reject(error);
  },
);
