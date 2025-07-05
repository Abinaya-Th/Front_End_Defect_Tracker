import axios from "axios";

const BASE_URL = import.meta.env.VITE_BASE_URL;

export interface TestCase {
  id: string;
  module: string;
  subModule: string;
  description: string;
  steps: string;
  type: string;
  severity: string;
  projectId: string;
  releaseId?: string;
  // Alternative field names that might be used by the backend
  testCaseType?: string;
  testCaseSeverity?: string;
  testType?: string;
  testSeverity?: string;
  caseType?: string;
  caseSeverity?: string;
}

export interface GetTestCasesByFilterResponse {
  status: string;
  message: string;
  data: TestCase[];
  statusCode: number;
}

export const getTestCasesByFilter = async (
  projectId: string | number,
  moduleId: string | number,
  submoduleId: string | number,
  releaseId: string | number
): Promise<GetTestCasesByFilterResponse> => {
  const params = new URLSearchParams({
    projectId: String(projectId),
    moduleId: String(moduleId),
    submoduleId: String(submoduleId),
    releaseId: String(releaseId),
  });
  const url = `${BASE_URL}testcase/filter?${params.toString()}`;
  const { data } = await axios.get<GetTestCasesByFilterResponse>(url);
  return data;
};
