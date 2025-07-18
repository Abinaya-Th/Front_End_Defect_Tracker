import axios from "axios";

const BASE_URL = import.meta.env.VITE_BASE_URL;

export interface Submodule {
  id: number;
  name: string;
  // Add other fields if needed
}

export interface GetSubmodulesResponse {
  status: string;
  message: string;
  data: Submodule[];
  statusCode: number;
}

export const getSubmodulesByModuleId = (moduleId: number): Promise<GetSubmodulesResponse> => {
  return axios.get<GetSubmodulesResponse>(
    `${BASE_URL}subModule/${moduleId}`
  ).then(({ data }) => data);
};
