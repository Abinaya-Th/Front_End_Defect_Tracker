import axios from "axios";

const BASE_URL = import.meta.env.VITE_BASE_URL;

export interface getProjectAllocationHistoryResponse {
  status: string;
  message: string;
  data: any[];
  statusCode: number;
}

export const getProjectAllocationHistory = (id:number): Promise<getProjectAllocationHistoryResponse> => {
  return axios.get<getProjectAllocationHistoryResponse>(
    `${BASE_URL}project-allocation-history/project/${id}`,
  ).then(({ data }: { data: getProjectAllocationHistoryResponse }) => data);
};
