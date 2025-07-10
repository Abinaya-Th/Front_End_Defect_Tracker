import axios from 'axios';

// Use the VITE_BASE_URL from .env file
const API_URL = import.meta.env.VITE_BASE_URL + 'defect';

export const deleteDefectById = async (defectId: string) => {
  console.log(`Preparing to delete defect with ID: ${defectId}`);
  try {
    // Perform the DELETE request
    const response = await axios.delete(`${API_URL}/${defectId}`, {
      headers: {
        'Content-Type': 'application/json', // Ensure the correct content type
      }
    });

    console.log('API response for delete:', response.data); // Log the response data
    if (response.status === 200) {
      console.log('Defect deleted successfully.');
      return response.data;  // Return success data
    } else {
      throw new Error('Failed to delete defect.');
    }
  } catch (error) {
    console.error('Error while deleting defect:', error);
    throw new Error(error.response?.data?.message || 'Failed to delete defect');
  }
};
