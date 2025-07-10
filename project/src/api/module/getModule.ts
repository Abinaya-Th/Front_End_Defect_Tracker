/// <reference types="vite/client" />
import axios from "axios";

// Create a local axios instance for API calls
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export interface Modules {
  id: number;
  moduleId: string;
  moduleName: string;
  projectId: string;
  submodules?: Submodule[];
  assignedDevs?: string[];
}

export interface Submodule {
  id: number;
  subModuleId: string;
  getSubModuleName: string;
  moduleId: number;
  assignedDevs?: string[];
  // Additional possible property names for submodule name (for backward compatibility)
  name?: string;
  submoduleName?: string;
  subModule?: string;
  subModuleName?: string;
}

export interface CreateReleaseResponse {
  status: string;
  message: string;
  data: Modules[];
  statusCode: number;
}

/**
 * Fetch modules with submodules by project ID
 * @param projectId - The project ID (string or number)
 * @returns Promise resolving to the API response
 */
export const getModulesByProjectId = (projectId: string | number): Promise<CreateReleaseResponse> => {
  return apiClient.get<CreateReleaseResponse>(
    `projects/${projectId}`
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
