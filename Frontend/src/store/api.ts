// src/api.js
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api", // Update with your backend base URL
  withCredentials: true, // if you're using cookies
});

// Add a request interceptor to automatically add the token to all requests
api.interceptors.request.use(
  (config) => {
    // Try to get the token from localStorage
    const storageData = localStorage.getItem('echoverse-storage');
    if (storageData) {
      try {
        const { state } = JSON.parse(storageData);
        if (state.token) {
          config.headers.Authorization = `Bearer ${state.token}`;
        }
      } catch (error) {
        console.error('Error parsing storage data:', error);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
