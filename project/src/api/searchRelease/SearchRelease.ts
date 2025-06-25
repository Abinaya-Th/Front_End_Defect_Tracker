import axios from "axios";

export interface SearchReleaseParams {
  releaseId?: string;
  releaseName?: string;
  projectId?: string;
  releaseDate?: string;
  releaseType?: string;
}

export interface SearchReleaseResponse {
  status: string;
  message: string;
  data: any[];
  statusCode: number;
}

export const searchRelease = (params: SearchReleaseParams): Promise<SearchReleaseResponse> => {
  // Build query string from params
  const query = Object.entries(params)
    .filter(([_, value]) => value !== undefined && value !== "")
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value as string)}`)
    .join("&");

  if (!query) {
    return Promise.reject({
      status: "failure",
      message: "At least one search parameter is required",
      data: null,
      statusCode: 4000,
    });
  }

  return axios.get<SearchReleaseResponse>(
    `http://192.168.1.46/api/v1/release/search?${query}`,
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  ).then(({ data }) => data);
};
