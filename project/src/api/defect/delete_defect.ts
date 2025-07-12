import axios from 'axios';

// Use the correct API base URL structure
const API_URL = 'http://34.171.115.156:8087/api/v1/defect';

export const deleteDefectById = async (defectId: string) => {
  try {
    // Perform the DELETE request using the correct endpoint structure
    const response = await axios.delete(`${API_URL}/${defectId}`, {
      headers: {
        'Content-Type': 'application/json',
      }
    });

    // Check if the response indicates success
    if (response.data && (response.data.status === "Success" || response.data.statusCode === 2000)) {
      return response.data;  // Return success data
    } else {
      throw new Error(response.data?.message || 'Failed to delete defect.');
    }
  } catch (error: any) {
    console.error('Error while deleting defect:', error);
    // Re-throw the error so the calling function can handle it
    throw error;
  }
};
