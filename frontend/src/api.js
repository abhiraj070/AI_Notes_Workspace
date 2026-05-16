import axios from "axios";

const isProd = import.meta.env.PROD;
const prodUrl = import.meta.env.VITE_BACKEND_URL;
const devUrl = import.meta.env.VITE_BACKEND_DEV_URL || "http://localhost:8000";

const baseUrl = isProd ? prodUrl : devUrl;

const api = axios.create({
  baseURL: `${baseUrl}/api/v1`,
  withCredentials: true,
});

export default api;
