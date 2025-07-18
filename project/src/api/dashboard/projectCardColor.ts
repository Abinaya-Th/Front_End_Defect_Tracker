import axios from "axios";

export const getProjectCardColor = async (projectId: string): Promise<string> => {
  const response = await axios.get(`http://192.168.1.107:8080/api/v1/dashboard/project-card-color/${projectId}`);
  return response.data?.data?.projectCardColor || '';
}; 