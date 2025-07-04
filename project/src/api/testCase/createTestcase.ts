import axios from "axios";

const BASE_URL = import.meta.env.VITE_BASE_URL;

export interface CreateTestCaseRequest {

  subModuleId: number;
  moduleId: number;
  steps: string;
  severityId: number;
  projectId: number;
  description: string;
  defectTypeId: number;
}

export interface CreateTestCaseResponse {
  status: string;
  message: string;
  data: CreateTestCaseRequest[];
  statusCode: number;
}

export const createTestCase = (payload: CreateTestCaseRequest): Promise<CreateTestCaseResponse> => {
  return axios.post<CreateTestCaseResponse>(
    `${BASE_URL}testcase`,
    payload,
  ).then(({ data }: { data: CreateTestCaseResponse }) => data);
};
