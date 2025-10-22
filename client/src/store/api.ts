import axios from "axios";

const api = axios.create({
  baseURL: "https://trade-edge.onrender.com/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach token automatically from localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
