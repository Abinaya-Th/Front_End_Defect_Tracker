import axios from "axios";

let BASE_URL = import.meta.env.VITE_BASE_URL || "";
if (BASE_URL.endsWith("/")) {
  BASE_URL = BASE_URL.slice(0, -1);
}

export interface UpdateTestCasePayload {
  testcaseId?: string;
  testcase?: string;
  submoduleId?: string;
  description?: string;
  severityId?: string;
  steps?: string;
  typeId?: number;
  projectId?: string;
  moduleId?: string;
  defectTypeId?: number;
}

export async function updateTestCase(id: string, payload: UpdateTestCasePayload) {
  const url = `${BASE_URL}/testcase/${id}`;
  const response = await axios.put(url, { request: payload }, {
    headers: { "Content-Type": "application/json" },
  });
  return response.data;
} 