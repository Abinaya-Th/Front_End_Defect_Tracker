// This file centralizes the main API base URL and axios instance for all API calls.
export const BASE_URL = "http://34.57.197.188:8087/api/v1/";

import axios from "axios";

const apiClient = axios.create({
  baseURL: BASE_URL,
  // You can add headers, interceptors, etc. here if needed
});

export default apiClient; 