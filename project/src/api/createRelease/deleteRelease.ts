import axios from "axios";

const BASE_URL = import.meta.env.VITE_BASE_URL;

export interface DeleteReleaseResponse {
  status: string;
  message: string;
  statusCode: number;
  data?: any;
}

/**
 * Delete a release by its ID
 * @param releaseId - The ID of the release to delete
 * @returns Promise with the API response
 */
export const deleteReleaseById = async (releaseId: string | number): Promise<DeleteReleaseResponse> => {
  try {
    const response = await axios.delete<DeleteReleaseResponse>(`${BASE_URL}releases/${releaseId}`);
    return response.data;
  } catch (error: any) {
    // Optionally, you can handle error formatting here
    throw error;
  }
}; 