import axios from "axios";

// Fetch defect density (KLOC and defect count) for a given project
export async function getDefectDensity(projectId: string) {
  let baseUrl = import.meta.env.VITE_BASE_URL || "";
  // Remove trailing slash if present to avoid double slashes
  if (baseUrl.endsWith("/")) {
    baseUrl = baseUrl.slice(0, -1);
  }
  const url = `${baseUrl}/dashboard/defect-density/${projectId}`;
  const response = await axios.get(url);
  return response.data;
}
