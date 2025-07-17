import axios from "axios";

const BASE_URL = import.meta.env.VITE_BASE_URL;

// Fetch defect types for a given project
export async function getDefectTypeByProjectId(projectId: string) {
  const url = `${BASE_URL}dashboard/defect-type/${projectId}`;
  const response = await axios.get(url);
  return response.data;
}
