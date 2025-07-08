import axios from "axios";
const BASE_URL = import.meta.env.VITE_BASE_URL;

// import axios from "axios";

// const BASE_URL = import.meta.env.VITE_BASE_URL.endsWith("/")
//   ? import.meta.env.VITE_BASE_URL
//   : import.meta.env.VITE_BASE_URL + "/";
const SEVERITY_URL = `${BASE_URL}severity`;

//merged

export interface Severity {
  id: number;
  name: string;
  color: string;
}

export interface CreateSeverityRequest {
  name: string;
  color: string;
}

export interface CreateSeverityResponse {
  status: string;
  message: string;
  statusCode: number;
  data?: Severity;
}

export interface GetSeveritiesResponse {
  status: string;
  message: string;
  data: Severity[];
}

export interface ErrorResponse {
  status: string;
  message: string;
  statusCode: number;
}

// Create Severity
export const createSeverity = async (data: CreateSeverityRequest): Promise<CreateSeverityResponse> => {
  try {
    console.log('Creating severity with data:', data);
    console.log('Request URL:', SEVERITY_URL);
    const response = await axios.post<CreateSeverityResponse>(SEVERITY_URL, data, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    console.log('Success response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Error creating severity:', error);
    console.error('Error response data:', error.response?.data);
    if (error.response?.data) {
      throw error.response.data as ErrorResponse;
    }
    throw {
      status: "error",
      message: "Network error occurred",
      statusCode: 5000
    } as ErrorResponse;
  }
};

// Get all Severities
export const getSeverities = async (): Promise<GetSeveritiesResponse> => {
  const response = await axios.get<GetSeveritiesResponse>(SEVERITY_URL, {
    headers: { 'Cache-Control': 'no-cache' },
    params: { t: Date.now() } // cache buster
  });
  return response.data;
};

// Update Severity
export const updateSeverity = async (id: number, data: Partial<CreateSeverityRequest>): Promise<CreateSeverityResponse> => {
  try {
    const response = await axios.put<CreateSeverityResponse>(`${SEVERITY_URL}/${id}`, data, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error: any) {
    if (error.response?.data) {
      throw error.response.data as ErrorResponse;
    }
    throw {
      status: "error",
      message: "Network error occurred",
      statusCode: 5000
    } as ErrorResponse;
  }
};

// Delete Severity
export const deleteSeverity = async (id: number): Promise<CreateSeverityResponse> => {
  try {
    console.log('Deleting severity with ID:', id);
    console.log('Request URL:', `${SEVERITY_URL}/${id}`);
    console.log(deleteSeverity);
    
    const response = await axios.delete<CreateSeverityResponse>(`${SEVERITY_URL}/${id}`);
    console.log('Delete success response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Error deleting severity:', error);
    console.error('Error response data:', error.response?.data);
    if (error.response?.data) {
      throw error.response.data as ErrorResponse;
    }
    throw {
      status: "error",
      message: "Network error occurred",
      statusCode: 5000
    } as ErrorResponse;
  }
};
