import axios from "axios";

const BASE_URL = import.meta.env.VITE_BASE_URL;


// Fetch defect severity summary for a given project
export async function getDefectSeveritySummary(projectId: string) {
  const url = `${BASE_URL}dashboard/defect_severity_summary/${projectId}`;
  const response = await axios.get(url);
  return response.data;
}
