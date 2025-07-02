import axios from "axios";

const BASE_URL = import.meta.env.VITE_BASE_URL;

export interface CreateTestCasePayload {
  description: string;
  steps: string;
  subModuleId: number;
  moduleId: number;
  projectId: number;
  severityId: number;
  defectTypeId: number;
}

export const createTestCase = async (payload: CreateTestCasePayload) => {
  const response = await axios.post(`${BASE_URL}testcase`, payload);
  return response.data;
}; 