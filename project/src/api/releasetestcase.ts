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
  releaseId: number;
  testCaseId:  number;

}

export interface AllocateTestCaseResponse {
  status: string;
  message: string;
  data?: any;
  statusCode: number;
}

export const allocateTestCaseToRelease = async (

  releaseId:  number,
  testCaseId: number,

): Promise<AllocateTestCaseResponse> => {
  const payload: AllocateTestCaseRequest = {
 
    testCaseId: testCaseId,
    releaseId: releaseId,    
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
    testCaseId: String(testCaseId),
    releaseIds: releaseIds.map(String)
  };
  
  const { data } = await axios.post<AllocateTestCaseResponse>(
    `${BASE_URL}releasetestcase/allocate-one-to-many`,
    payload
  );
  return data;
};

// Many-to-many allocation interface
export interface AllocateManyToManyRequest {
  releaseIds: (string | number)[];
  testCaseIds: (string | number)[];
}

export const allocateTestCasesToManyReleases = async (
  releaseIds: (string | number)[],
  testCaseIds: (string | number)[]
): Promise<AllocateTestCaseResponse> => {
  const payload: AllocateManyToManyRequest = {
    releaseIds: releaseIds.map(String),
    testCaseIds: testCaseIds.map(String),
  };
  const { data } = await axios.post<AllocateTestCaseResponse>(
    `${BASE_URL}releasetestcase/allocate-many-to-many`,
    payload
  );
  return data;
};


export interface ReleaseTestCaseMappingRequest {
  testCaseId: number;
  releaseId: number;
}

interface ReleaseTestCaseMappingResponse{
  status:string;
  message:string;
  statusCode:number;
  data:any[]
}
// Bulk allocate: { testCaseIds: number[], releaseId: number }
export interface BulkAllocateRequest {
  testCaseIds: (string | number)[];
  releaseId: string | number;
}

export const bulkAllocateTestCasesToReleases = (
  testCaseIds: (string | number)[],
  releaseId: string | number
): Promise<any> => {
  const payload: BulkAllocateRequest = {
    testCaseIds: testCaseIds.map(Number),
    releaseId: Number(releaseId),
  };
  return axios.post(`${BASE_URL}releasetestcase/bulk-allocate`, payload)
    .then(({ data }: { data: any }) => data);
};
