/**
 * Centralized API Configuration
 * This file manages all API endpoints and base URLs
 * Environment-specific values are loaded from .env files
 */

// Use relative base URL (works with port forwarding) or fallback to environment variable
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
const API_TIMEOUT = parseInt(process.env.REACT_APP_API_TIMEOUT || "30000");
const ENVIRONMENT = process.env.REACT_APP_ENVIRONMENT || "development";

// API Endpoints
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: "/api/auth/login",
    LOGOUT: "/api/auth/logout",
    SIGNUP: "/api/auth/signup",
    FORGOT_PASSWORD: "/api/auth/forgot-password",
    RESET_PASSWORD: "/api/auth/reset-password",
    CHANGE_PASSWORD: "/api/auth/change-password",
    VALIDATE_EMAIL: "/api/auth/validate-email",
    REGISTER_PRIEST: "/api/auth/register-priest",
    REGISTER_CUSTOMER: "/api/auth/register-customer",
    GET_CUSTOMERS: "/api/auth/customers",
    GET_CUSTOMER_BY_ID: (id) => `/api/auth/customers/${id}`,
  },

  // User/Profile
  PROFILE: {
    GET_PROFILE: "/api/profile",
    UPDATE_PROFILE: "/api/profile",
    GET_USER: "/api/users",
    UPDATE_USER: "/api/users",
  },

  // Priests
  PRIESTS: {
    GET_ALL: "/api/auth/priests",
    GET_BY_ID: (id) => `/api/auth/priests/${id}`,
    GET_PROFILE: (email) => `/api/profile?email=${email}`,
  },

  // Appointments
  APPOINTMENTS: {
    CREATE: "/api/appointments",
    GET_ALL: "/api/appointments",
    GET_BY_PRIEST: (priestId) => `/api/appointments/priest/${priestId}`,
    UPDATE: (id) => `/api/appointments/${id}`,
    DELETE: (id) => `/api/appointments/${id}`,
  },

  // Availability
  AVAILABILITY: {
    GET: (priestId, date) =>
      `/api/availability/priest/${priestId}/date/${date}`,
    CREATE: "/api/availability",
    UPDATE: (id) => `/api/availability/${id}`,
    DELETE: (id) => `/api/availability/${id}`,
  },

  // Events
  EVENTS: {
    GET_ALL: "/api/events",
    GET_BY_ID: (id) => `/api/events/${id}`,
    CREATE: "/api/events",
    UPDATE: (id) => `/api/events/${id}`,
    DELETE: (id) => `/api/events/${id}`,
  },

  // Nakshatram (Astrological)
  NAKSHATRAM: {
    GET_ALL: "/api/nakshatram",
    GET_BY_ID: (id) => `/api/nakshatram/${id}`,
  },

  // Bookings
  BOOKINGS: {
    GET_ALL: "/api/bookings",
    GET_BY_ID: (id) => `/api/bookings/${id}`,
    CREATE: "/api/bookings",
    UPDATE: (id) => `/api/bookings/${id}`,
    DELETE: (id) => `/api/bookings/${id}`,
  },

  // Upload
  UPLOAD: {
    UPLOAD_FILE: "/api/upload",
  },

  // Panchang (Astrological Calendar Data)
  PANCHANG: {
    SUN_TIMES: "/api/sun",
    DAILY_TIMES: "/api/daily-times/calculate",
  },

  // Gallery
  GALLERY: {
    GET_ALL_RANDOM: "/api/gallery/all-random",
    GET_BY_PRIEST: (priestId) => `/api/gallery/priest/${priestId}`,
    UPLOAD: "/api/gallery/upload",
    DELETE: (id) => `/api/gallery/${id}`,
  },

  // Dashboard (Priest Management)
  DASHBOARD: {
    GET_ALL_EVENTS: "/api/dashboard/events",
    GET_PRIEST_EVENTS: (priestId) => `/api/dashboard/events/priest/${priestId}`,
    CREATE_EVENT: "/api/dashboard/events",
    UPDATE_EVENT: (id) => `/api/dashboard/events/${id}`,
    DELETE_EVENT: (id) => `/api/dashboard/events/${id}`,
  },

  // Pooja Items & Services
  POOJA_ITEMS: {
    GET_BY_EVENT: (eventId) => `/api/pooja-items/event/${eventId}`,
    GET_ALL: "/api/pooja-items",
    CREATE: "/api/pooja-items",
    UPDATE: (id) => `/api/pooja-items/${id}`,
    DELETE: (id) => `/api/pooja-items/${id}`,
  },

  // Prasadam
  PRASADAM: {
    GET_ALL: "/api/prasadam",
    GET_BY_ID: (id) => `/api/prasadam/${id}`,
    CREATE: "/api/prasadam",
    UPDATE: (id) => `/api/prasadam/${id}`,
    DELETE: (id) => `/api/prasadam/${id}`,
  },

  // Muhurtam
  MUHURTAM: {
    GET_ALL: "/api/muhurtam",
    GET_BY_ID: (id) => `/api/muhurtam/${id}`,
    CREATE: "/api/muhurtam",
    UPDATE: (id) => `/api/muhurtam/${id}`,
    DELETE: (id) => `/api/muhurtam/${id}`,
    REQUEST: "/api/muhurtam-requests",
  },

  // Festivals
  FESTIVALS: {
    GET_ALL: "/api/festivals",
    GET_BY_ID: (id) => `/api/festivals/${id}`,
    CREATE: "/api/festivals",
    UPDATE: (id) => `/api/festivals/${id}`,
    DELETE: (id) => `/api/festivals/${id}`,
  },

  // Daily Times
  DAILY_TIMES: {
    GET_ALL: "/api/daily-times",
    CALCULATE: "/api/daily-times/calculate",
  },

  // Panchangam
  PANCHANGAM: {
    GET_ALL: "/api/panchangam",
    GET_BY_ID: (id) => `/api/panchangam/${id}`,
  },
};

// Configuration object
export const API_CONFIG = {
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  environment: ENVIRONMENT,
  isDevelopment: ENVIRONMENT === "development",
  isProduction: ENVIRONMENT === "production",
};

/**
 * Helper function to build full API URL
 * @param {string} endpoint - The endpoint path
 * @returns {string} - Full API URL
 */
export const buildApiUrl = (endpoint) => {
  return `${API_BASE_URL}${endpoint}`;
};

/**
 * Helper function to get endpoint with parameters
 * @param {function|string} endpoint - The endpoint (can be function or string)
 * @param {any} params - Parameters for the endpoint
 * @returns {string} - Full API URL
 */
export const getApiEndpoint = (endpoint, params) => {
  if (typeof endpoint === "function") {
    return buildApiUrl(endpoint(params));
  }
  return buildApiUrl(endpoint);
};

export default API_CONFIG;
