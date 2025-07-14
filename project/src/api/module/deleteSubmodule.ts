import axios from "axios";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Deletes a submodule by ID
 * @param submoduleId - The ID of the submodule to delete
 * @returns Promise with the API response
 */
export const deleteSubmodule = async (submoduleId: number): Promise<{ status: string; statusCode?: string; data?:any[]; message?: string ; success?: boolean }> => {
  try {
    const response = await apiClient.delete<{ status: string; statusCode?: string; data?:any[]; message?: string ; success?: boolean }>(`subModule/${submoduleId}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting submodule:", error);
    throw error;
  }
}; 