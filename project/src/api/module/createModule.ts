import apiClient from "../apiClient";
import { CreateModuleRequest, CreateModuleResponse, GetModulesResponse } from "../../types/index";

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
