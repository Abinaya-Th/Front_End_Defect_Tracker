import axios from "axios";

// Fetch defect severity summary for a given project
export async function getDefectSeveritySummary(projectId: string) {
  const url = `http://192.168.1.107:8080/api/v1/dashboard/defect_severity_summary/${projectId}`;
  const response = await axios.get(url);
  return response.data;
}
