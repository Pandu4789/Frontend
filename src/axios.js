/**
 * @deprecated Use config/axiosInstance.js instead
 * This file is kept for backward compatibility only.
 * Please import axiosInstance from './config/axiosInstance' in new code.
 */

import axiosInstance from "./config/axiosInstance";
import { API_ENDPOINTS, buildApiUrl } from "./config/apiConfig";

// Maintain backward compatibility
export const fetchEvents = async () => {
  try {
    const response = await axiosInstance.get(API_ENDPOINTS.EVENTS.GET_ALL);
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching events:", error);
    throw error;
  }
};

export default axiosInstance;
