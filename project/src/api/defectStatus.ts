import axios from "axios";

const BASE_URL = import.meta.env.VITE_BASE_URL;

// Define interfaces for the defect status API

export interface DefectStatus {
  id: number;
  defectStatusName: string;
  colorCode: string;
}

export interface DefectStatusResponse {
  status: string;
  message: string;
  data: DefectStatus[];
  statusCode: number;
}

export interface CreateDefectStatusRequest {
  defectStatusName: string;
  colorCode: string;
}

export interface UpdateDefectStatusRequest {
  defectStatusName: string;
  colorCode: string;
}

// Helper function to handle API errors
const handleApiError = (error: any, operation: string): never => {
  if (error.code === 'ERR_NETWORK') {
    throw new Error(`Network error: Unable to ${operation}. Please check your internet connection.`);
  } else if (error.response?.status === 404) {
    throw new Error(`Not found: Unable to ${operation}. The requested resource was not found.`);
  } else if (error.response?.status === 500) {
    throw new Error(`Server error: Unable to ${operation}. Please try again later.`);
  } else if (error.response?.data?.message) {
    throw new Error(error.response.data.message);
  } else {
    throw new Error(`Failed to ${operation}: ${error.message || 'Unknown error occurred'}`);
  }
};

// GET - Fetch all defect statuses
export const getAllDefectStatuses = async (): Promise<DefectStatusResponse> => {
  try {
    const response = await axios.get<DefectStatusResponse>(`${BASE_URL}defectStatus`);
    return response.data;
  } catch (error: any) {
    handleApiError(error, 'fetch defect statuses');
  }
};
export const createDefectStatus = async (statusData: CreateDefectStatusRequest): Promise<any> => {
  try {
    const response = await axios.post(`${BASE_URL}defectStatus`, statusData);
    return response.data;
  } catch (error: any) {
    handleApiError(error, 'create defect status');
  }
};

// PUT - Update an existing defect status
export const updateDefectStatus = async (id: number, statusData: UpdateDefectStatusRequest): Promise<any> => {
  try {
    const response = await axios.put(`${BASE_URL}defectStatus/${id}`, statusData);
    return response.data;
  } catch (error: any) {
    handleApiError(error, 'update defect status');
  }
};

// DELETE - Delete a defect status
export const deleteDefectStatus = async (id: number): Promise<any> => {
  try {
    const response = await axios.delete(`${BASE_URL}defectStatus/${id}`);
    return response.data;
  } catch (error: any) {
    handleApiError(error, 'delete defect status');
  }
}; 