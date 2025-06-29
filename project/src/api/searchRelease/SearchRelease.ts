import apiClient from "../apiClient";



export interface SearchReleaseResponse {
  status: string;
  message: string;
  data: any[];
  statusCode: number;
}

export const searchRelease = (releaseName: string): Promise<SearchReleaseResponse> => {

  return apiClient.get<SearchReleaseResponse>(
    `releases/search?releaseName=${releaseName}`,

  ).then(({ data }) => data);
};
