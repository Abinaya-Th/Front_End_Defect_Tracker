import axios from "axios";

const BASE_URL = import.meta.env.VITE_BASE_URL;

export interface ImportTestCaseResponse {
  status: string;
  message: string;
  data: any;
  statusCode: number;
}

export const importTestCases = (formData: FormData): Promise<ImportTestCaseResponse> => {
  return axios.post<ImportTestCaseResponse>(
    `${BASE_URL}testcase/import`,
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
  return axios.post<ImportDefectResponse>(
    `${BASE_URL}defect/import`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  ).then(({ data }) => data);
}; 