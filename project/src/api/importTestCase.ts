import axios from "axios";

export interface ImportTestCaseResponse {
  status: string;
  message: string;
  data: any;
  statusCode: number;
}

export const importTestCases = (formData: FormData): Promise<ImportTestCaseResponse> => {
  return axios.post<ImportTestCaseResponse>(
    "http://192.168.1.46:8088/api/v1/testcase/import",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  ).then(({ data }) => data);
}; 