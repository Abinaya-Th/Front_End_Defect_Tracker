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
  data: Severity;
}

export interface GetSeveritiesResponse {
  status: string;
  message: string;
  data: Severity[];
}

// Create Severity (POST)
export const createSeverity = async (data: CreateSeverityRequest): Promise<CreateSeverityResponse> => {
  const response = await axios.post<CreateSeverityResponse>(SEVERITY_URL, data);
  return response.data;
};

// Get all Severities (GET)
export const getSeverities = async (): Promise<GetSeveritiesResponse> => {
  const response = await axios.get<GetSeveritiesResponse>(SEVERITY_URL);
  return response.data;
};

// Update Severity (PUT)
export const updateSeverity = async (id: number, data: Partial<CreateSeverityRequest>): Promise<CreateSeverityResponse> => {
  const response = await axios.put<CreateSeverityResponse>(`${SEVERITY_URL}/${id}`, data);
  return response.data;
};

// Delete Severity (DELETE)
export const deleteSeverity = async (id: number): Promise<CreateSeverityResponse> => {
  const response = await axios.delete<CreateSeverityResponse>(`${SEVERITY_URL}/${id}`);
  return response.data;
};