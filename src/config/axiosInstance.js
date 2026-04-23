/**
 * Updated axios instance with environment-based configuration
 */
import axios from "axios";
import { API_CONFIG } from "./apiConfig";

// Create axios instance with configuration
const instance = axios.create({
  baseURL: API_CONFIG.baseURL,
  timeout: API_CONFIG.timeout,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor for logging and error handling in development
if (API_CONFIG.isDevelopment) {
  instance.interceptors.request.use(
    (config) => {
      console.log(`[API] ${config.method.toUpperCase()} ${config.url}`);
      return config;
    },
    (error) => {
      console.error("[API] Request error:", error);
      return Promise.reject(error);
    },
  );

  instance.interceptors.response.use(
    (response) => {
      console.log(
        `[API] Response: ${response.status} from ${response.config.url}`,
      );
      return response;
    },
    (error) => {
      console.error("[API] Response error:", error);
      return Promise.reject(error);
    },
  );
}

// Add response interceptor for error handling
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Server responded with error status
      console.error(
        `[API] Error ${error.response.status}:`,
        error.response.data,
      );
    } else if (error.request) {
      // Request was made but no response received
      console.error("[API] No response received:", error.request);
    } else {
      // Error in request setup
      console.error("[API] Error:", error.message);
    }
    return Promise.reject(error);
  },
);

export default instance;
