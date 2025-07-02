import axios from "axios";
import { CreateModuleRequest, CreateModuleResponse } from "../../types/index";

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
 * Updates an existing module
 * @param moduleId - The ID of the module to update
 * @param data - Object containing the updated module data
 * @returns Promise with the API response
 */
export const updateModule = async (moduleId: string, data: Partial<CreateModuleRequest>): Promise<CreateModuleResponse> => {
  try {
    const response = await apiClient.put<CreateModuleResponse>(`modules/${moduleId}`, data);
    return response.data;
  } catch (error) {
    console.error("Error updating module:", error);
    throw error;
  }
};

/**
 * Deletes a module
 * @param moduleId - The ID of the module to delete
 * @returns Promise with the API response
 */
export const deleteModule = async (moduleId: string): Promise<CreateModuleResponse> => {
  try {
    const response = await apiClient.delete<CreateModuleResponse>(`modules/${moduleId}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting module:", error);
    throw error;
  }
};

/**
 * Gets modules for a given projectId
 * @param projectId - The ID of the project
 * @returns Promise with the API response
 */
export const getModulesByProjectId = async (projectId: string) => {
  try {
    const response = await axios.get(`http://34.57.197.188:8087/api/v1/modules/projectId/${projectId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching modules by projectId:", error);
    throw error;
  }
};

/**
 * Gets submodules for a given moduleId
 * @param moduleId - The ID of the module
 * @returns Promise with the API response
 */
export const getSubmodulesByModuleId = async (moduleId: string) => {
  try {
    const response = await apiClient.get(`subModule/${moduleId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching submodules by moduleId:", error);
    throw error;
  }
};

export interface Project {
  id: string;
  projectId: number;
  name: string;
  // ...other fields
}
