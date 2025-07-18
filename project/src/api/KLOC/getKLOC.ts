import axios from "axios";

// Fetch defect density (KLOC and defect count) for a given project
export async function getDefectDensity(projectId: string) {
  const url = `http://34.171.115.156:8087/api/v1/dashboard/defect-density/${projectId}`;
  const response = await axios.get(url);
  return response.data;
}
