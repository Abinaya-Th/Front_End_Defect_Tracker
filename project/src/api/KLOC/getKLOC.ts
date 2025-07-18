import axios from "axios";

// Fetch defect density (KLOC and defect count) for a given project
export async function getDefectDensity(projectId: string) {
  const url = `http://192.168.1.107:8080/api/v1/dashboard/defect-density/${projectId}`;
  const response = await axios.get(url);
  return response.data;
}
