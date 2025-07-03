/// <reference types="vite/client" />
import axios from "axios";

const baseUrl = import.meta.env.VITE_BASE_URL;
export interface Modules {
  id: number;
  moduleId: string;
  moduleName: string;
  projectId: string;
}
export interface CreateReleaseResponse {
  status: string;
  message: string;
  data: Modules[];
  statusCode: number;
}


export const getModulesByProjectId = (projectId: string | number): Promise<CreateReleaseResponse> => {
  return axios.get<CreateReleaseResponse>(
    `${baseUrl}modules/project/${projectId}`
  ).then(({ data }: { data: CreateReleaseResponse }) => data);
};


/**
 * Fetch modules by project ID
 * @param projectId - The project ID (string or number)
 * @returns Promise resolving to the API response
 */
// export const getModulesByProjectId = async (projectId: string | number) => {
//   try {
//     const response = await axios.get(`${baseUrl}modules/projectId/${projectId}`);
//     return response.data;
//   } catch (error: any) {
//     // Optionally, you can return a consistent error object
//     return {
//       status: "failure",
//       message: error?.response?.data?.message || error.message || "Unknown error",
//       data: null,
//       statusCode: error?.response?.data?.statusCode || 4000,
//     };
//   }
// };
