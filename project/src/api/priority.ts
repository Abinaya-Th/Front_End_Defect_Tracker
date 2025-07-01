import axios from "axios";

const BASE_URL = import.meta.env.VITE_BASE_URL;

export interface Priority {
  id: number;
  priority: string;
  color: string;
}

export interface GetPrioritiesResponse {
  status: string;
  message: string;
  data: Priority[];
}

export const getAllPriorities = async (): Promise<GetPrioritiesResponse> => {
  const response = await axios.get<GetPrioritiesResponse>(`${BASE_URL}priority`);
  return response.data;
};

export const updatePriority = async (id: number, data: { priority: string; color: string }) => {
  const response = await axios.put(`${BASE_URL}priority/${id}`, data);
  return response.data;
};

export const deletePriority = async (id: number) => {
  const response = await axios.delete(`${BASE_URL}priority/${id}`);
  return response.data;
};

export const createPriority = async (data: { priority: string; priorityColor: string }) => {
  const response = await axios.post(`${BASE_URL}priority`, data);
  return response.data;
};