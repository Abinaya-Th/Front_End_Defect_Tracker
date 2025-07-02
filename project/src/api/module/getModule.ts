/// <reference types="vite/client" />
import axios from "axios";

const BASE_URL = import.meta.env.VITE_BASE_URL;
// interface Module {
//   id: number;
//   moduleId: string;
//   moduleName: string;
//   projectId: string;
// }
interface CreateReleaseResponse {
  status: string;
  message: string;
  data: any[];
  statusCode: number;
}


export const getModulesByProjectId = (projectId: string | number): Promise<CreateReleaseResponse> => {
  return axios.get<CreateReleaseResponse>(
    `${BASE_URL}modules/project/${projectId}`
  ).then(({ data }: { data: CreateReleaseResponse }) => data);
};


/**
 * Fetch modules by project ID
 * @param projectId - The project ID (string or number)
 * @returns Promise resolving to the API response
 */
// export const getModulesByProjectId = async (projectId: string | number) => {
//   try {
//     const response = await axios.get(`${BASE_URL}modules/projectId/${projectId}`);
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
