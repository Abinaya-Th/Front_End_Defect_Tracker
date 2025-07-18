import axios from "axios";

const BASE_URL = import.meta.env.VITE_BASE_URL;

// Fetch defect density (KLOC and defect count) for a given project
export async function getDefectDensity(projectId: string) {
  const url = `${BASE_URL}dashboard/defect-density/${projectId}`;
  const response = await axios.get(url);
  return response.data;
}
