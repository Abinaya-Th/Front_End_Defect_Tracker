import axios from "axios";

const BASE_URL = import.meta.env.VITE_BASE_URL;

export interface CreateKlocRequest {
  projectId: number; // Project ID
  kloc: number; // KLOC value
}

export interface CreateKlocResponse {
  status: string;
  message: string;
  data: CreateKlocRequest[];
  statusCode: number;
}

export const createKloc = (payload: CreateKlocRequest , projectId: number): Promise<CreateKlocResponse> => {
  return axios.put<CreateKlocResponse>(
    `${BASE_URL}dashboard/defect-density/${projectId}`,
    payload,
  ).then(({ data }: { data: CreateKlocResponse }) => data);
};
