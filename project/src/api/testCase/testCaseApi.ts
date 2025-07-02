import axios from "axios";

export async function getTestCasesByProjectAndSubmodule(projectId: string, submoduleId: string) {
  let BASE_URL = import.meta.env.VITE_BASE_URL || "";
  // Remove trailing slash if present to avoid double slashes
  if (BASE_URL.endsWith("/")) {
    BASE_URL = BASE_URL.slice(0, -1);
  }
  const response = await axios.get(`${BASE_URL}/testcase/filter`, {
    params: { projectId, submoduleId },
    headers: { "Content-Type": "application/json" },
  });
  return response.data.data || [];
} 
