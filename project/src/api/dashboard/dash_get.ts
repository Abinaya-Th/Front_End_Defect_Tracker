import axios from "axios";

// Fetch defect severity summary for a given project
export async function getDefectSeveritySummary(projectId: string) {
  const url = `http://34.171.115.156:8087/api/v1/dashboard/defect_severity_summary/${projectId}`;
  const response = await axios.get(url);
  return response.data;
}
