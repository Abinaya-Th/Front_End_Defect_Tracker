import axios from "axios";

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
    "http://192.168.1.112:8087/api/v1/releases",
    payload,
   
  ).then(({ data }) => data);
};
