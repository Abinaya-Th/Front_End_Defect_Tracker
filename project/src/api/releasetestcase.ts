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

export interface AllocateTestCaseRequest {
  releaseId: string | number;
  testCaseId: string | number;
}

export interface AllocateTestCaseResponse {
  status: string;
  message: string;
  data?: any;
  statusCode: number;
}

export const allocateTestCaseToRelease = async (
  releaseId: string | number,
  testCaseId: string | number
): Promise<AllocateTestCaseResponse> => {
  const payload: AllocateTestCaseRequest = {
    releaseId,
    testCaseId
  };
  
  const { data } = await axios.post<AllocateTestCaseResponse>(
    `${BASE_URL}releasetestcase/allocate`,
    payload
  );
  return data;
};

export interface AllocateOneToManyRequest {
  testCaseId: string | number;
  releaseIds: (string | number)[];
}

export const allocateTestCaseToMultipleReleases = async (
  testCaseId: string | number,
  releaseIds: (string | number)[]
): Promise<AllocateTestCaseResponse> => {
  const payload: AllocateOneToManyRequest = {
    testCaseId,
    releaseIds
  };
  
  const { data } = await axios.post<AllocateTestCaseResponse>(
    `${BASE_URL}releasetestcase/allocate-one-to-many`,
    payload
  );
  return data;
};

export interface BulkAllocateRequest {
  releaseIds: (string | number)[];
  testCaseIds: (string | number)[];
}

export const bulkAllocateTestCasesToReleases = async (
  releaseIds: (string | number)[],
  testCaseIds: (string | number)[]
): Promise<AllocateTestCaseResponse> => {
  const payload: BulkAllocateRequest = { releaseIds, testCaseIds };
  const { data } = await axios.post<AllocateTestCaseResponse>(
    `${BASE_URL}releasetestcase/bulk-allocate`,
    payload
  );
  return data;
};
