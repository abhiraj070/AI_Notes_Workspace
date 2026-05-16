import axios from "axios";

const api = axios.create({
  baseURL: process.env.VITE_NODE_ENV==="production"? process.env.VITE_BACKEND_URL: process.env.VITE_BACKEND_DEV_URL,
  withCredentials: true,
});

export default api;
