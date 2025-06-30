import axios from "axios";

const BASE_URL = import.meta.env.VITE_BASE_URL;

export interface CreateReleaseRequest {
  releaseName: string;
  releaseDate: string; // YYYY-MM-DD
  releaseType: string;
  projectId: string;
}

export interface CreateReleaseResponse {
  status: string;
  message: string;
  data: any;
  statusCode: number;
}

export const createRelease = (payload: CreateReleaseRequest): Promise<CreateReleaseResponse> => {
  return axios.post<CreateReleaseResponse>(
    `${BASE_URL}releases`,
    payload,
  ).then(({ data }: { data: CreateReleaseResponse }) => data);
};
