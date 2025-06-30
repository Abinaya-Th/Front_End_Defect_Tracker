// This file centralizes the main API base URL and axios instance for all API calls.
const isDevelopment = import.meta.env.DEV;

// Use relative URL in development (for proxy) and absolute URL in production
export const BASE_URL = isDevelopment 
  ? "/api/v1/" 
  : "http://34.57.197.188:8087/api/v1/";

import axios from "axios";

const apiClient = axios.create({
  baseURL: BASE_URL,
  // You can add headers, interceptors, etc. here if needed
});

export default apiClient; 