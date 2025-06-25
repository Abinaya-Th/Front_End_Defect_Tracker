import axios from "axios";



export interface SearchReleaseResponse {
  status: string;
  message: string;
  data: any[];
  statusCode: number;
}

export const searchRelease = (releaseName:string): Promise<SearchReleaseResponse> => {

  return axios.get<SearchReleaseResponse>(
    `http://localhost:8083/api/v1/releases/search?releaseName=${releaseName}`,
 
  ).then(({ data }) => data);
};
