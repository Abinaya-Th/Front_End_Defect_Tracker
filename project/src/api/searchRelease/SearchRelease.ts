import axios from "axios";

const BASE_URL = import.meta.env.VITE_BASE_URL;

export interface SearchReleaseResponse {
  status: string;
  message: string;
  data: any[];
  statusCode: number;
}

export const searchRelease = (releaseName: string): Promise<SearchReleaseResponse> => {

  return axios.get<SearchReleaseResponse>(
    `${BASE_URL}releases/search?releaseName=${releaseName}`,
  ).then(({ data }) => data);
};
