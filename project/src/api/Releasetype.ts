import axios from "axios";
const BASE_URL = import.meta.env.VITE_BASE_URL;

// Interfaces for ReleaseType API
export interface ReleaseType {
  id: number;
  releaseTypeName: string;
}

export interface ReleaseTypeResponse {
  status: string;
  message: string;
  data: ReleaseType[];
  statusCode: number;
}

export interface CreateReleaseTypeRequest {
  releaseTypeName: string;
}

export interface UpdateReleaseTypeRequest {
  releaseTypeName: string;
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

// GET - Fetch all release types
export const getAllReleaseTypes = async (): Promise<ReleaseTypeResponse> => {
  try {
    const response = await axios.get<ReleaseTypeResponse>(`${BASE_URL}ReleaseType`);
    return response.data;
  } catch (error: any) {
    handleApiError(error, 'fetch release types');
  }
};

// POST - Create a new release type
export const createReleaseType = async (data: CreateReleaseTypeRequest): Promise<ReleaseType> => {
  try {
    const response = await axios.post<ReleaseType>(`${BASE_URL}ReleaseType`, data);
    return response.data;
  } catch (error: any) {
    handleApiError(error, 'create release type');
  }
};

// PUT - Update an existing release type
export const updateReleaseType = async (id: number, data: UpdateReleaseTypeRequest): Promise<ReleaseType> => {
  try {
    const response = await axios.put<ReleaseType>(`${BASE_URL}ReleaseType/${id}`, data);
    return response.data;
  } catch (error: any) {
    handleApiError(error, 'update release type');
  }
};

// DELETE - Delete a release type
export const deleteReleaseType = async (id: number): Promise<any> => {
  try {
    const response = await axios.delete(`${BASE_URL}ReleaseType/${id}`);
    return response.data;
  } catch (error: any) {
    handleApiError(error, 'delete release type');
  }
};