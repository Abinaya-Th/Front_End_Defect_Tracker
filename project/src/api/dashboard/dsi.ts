import axios from 'axios';

export async function getDefectSeverityIndex(projectId: string | number) {
  const baseUrl = import.meta.env.VITE_BASE_URL;
  const url = `${baseUrl}dashboard/dsi/${projectId}`;
  const response = await axios.get(url);
  return response.data;
} 