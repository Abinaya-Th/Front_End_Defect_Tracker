import axios from "axios";

const BASE_URL = import.meta.env.VITE_BASE_URL;

// Fetch defects by module for a given project
export async function getDefectsByModule(projectId: string) {
  const url = `${BASE_URL}dashboard/module?projectId=${projectId}`;
  const response = await axios.get(url);
  return response.data;
}
