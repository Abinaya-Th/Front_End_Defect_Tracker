import axios from "axios";
import { CreateModuleRequest, CreateModuleResponse } from "../../types/index";
import { createSubmodule } from "../api/module/createModule";

// Create a local axios instance for API calls
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Creates a new module for a project
 * @param data - Object containing moduleName and projectId
 * @returns Promise with the API response
 */
export const createModule = async (data: CreateModuleRequest): Promise<CreateModuleResponse> => {
  try {
    const response = await apiClient.post<CreateModuleResponse>("modules", data);
    return response.data;
  } catch (error) {
    console.error("Error creating module:", error);
    throw error;
  }
};

/**
 * Creates a new submodule for a module
 * @param data - Object containing subModuleName and moduleId
 * @returns Promise with the API response
 */
export const createSubmodule = async (data: { subModuleName: string; moduleId: number }): Promise<any> => {
  try {
    // Use full URL since the endpoint is external
    const response = await apiClient.post(
      "http://192.168.1.110:8080/api/v1/subModule",
      data
    );
    return response.data;
  } catch (error: any) {
    if (error.response) {
      console.error("Error creating submodule:", error.response.data);
    } else {
      console.error("Error creating submodule:", error);
    }
    throw error;
  }
};

