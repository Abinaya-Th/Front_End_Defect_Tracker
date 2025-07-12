import axios from "axios";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Deletes a module by ID
 * @param moduleId - The ID of the module to delete
 * @returns Promise with the API response
 */
export const deleteModule = async (moduleId: number): Promise<{ status: string; statusCode?: string; data?:any[]; message?: string ; }> => {
  try {
    const response = await apiClient.delete<{ status: string; statusCode?: string; data?:any[]; message?: string ;}>(`modules/${moduleId}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting module:", error);
    throw error;
  }
};
