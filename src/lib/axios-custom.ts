import axios, { InternalAxiosRequestConfig } from "axios";
import { useAuthStore } from "@/lib/store/store";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL, // URL de tu backend
});

api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = useAuthStore.getState().user?.token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;