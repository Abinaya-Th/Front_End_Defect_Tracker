import axios from "axios";

const BASE_URL = import.meta.env.VITE_BASE_URL;

export const getProjectCardColor = async (projectId: string): Promise<string> => {
  const response = await axios.get(`${BASE_URL}dashboard/project-card-color/${projectId}`);
  return response.data?.data?.projectCardColor || '';
}; 