import axios from "axios";

let BASE_URL = import.meta.env.VITE_BASE_URL || "";
if (BASE_URL.endsWith("/")) {
  BASE_URL = BASE_URL.slice(0, -1);
}
const SEARCH_URL = `${BASE_URL}/testcase/search`;

export interface SearchTestCaseParams {
  description?: string;
  typeId?: number;
  severityId?: number;
  submoduleId?: number;
}

export async function searchTestCases(params: SearchTestCaseParams) {
  // Remove undefined params
  const filteredParams = Object.fromEntries(
    Object.entries(params).filter(([_, v]) => v !== undefined && v !== "")
  );
  const response = await axios.get(SEARCH_URL, {
    params: filteredParams,
    headers: { "Content-Type": "application/json" },
  });
  return response.data;
} 