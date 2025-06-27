import apiClient from "../apiClient";

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
  return apiClient.post<CreateReleaseResponse>(
    "releases",
    payload,
  ).then(({ data }: { data: CreateReleaseResponse }) => data);
};
