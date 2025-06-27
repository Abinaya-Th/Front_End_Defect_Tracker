import apiClient, { BASE_URL } from "./apiClient";

export interface ImportTestCaseResponse {
  status: string;
  message: string;
  data: any;
  statusCode: number;
}

export const importTestCases = (formData: FormData): Promise<ImportTestCaseResponse> => {
  return apiClient.post<ImportTestCaseResponse>(
    "testcase/import",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  ).then(({ data }) => data);
};

export interface ImportDefectResponse {
  status: string;
  message: string;
  data: any;
  statusCode: number;
}

export const importDefects = (formData: FormData): Promise<ImportDefectResponse> => {
  return apiClient.post<ImportDefectResponse>(
    "defect/import",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  ).then(({ data }) => data);
}; 