import axios from "axios";

const BASE_URL = import.meta.env.VITE_BASE_URL;

// Fetch Reopen Count Summary for a given project
export async function getReopenCountSummary(projectId: string) {
  const url = `${BASE_URL}dashboard/reopen-count_summary/${projectId}`;
  const response = await axios.get(url);
  return response.data;
}
