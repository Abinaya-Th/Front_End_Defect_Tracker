import axios from "axios";

const BASE_URL = import.meta.env.VITE_BASE_URL;

export interface DefectCreate {
  description: string;           // Detailed description of the defect(1-255)
  severityId: number;           // Severity level ID (Long)
  priorityId: number;           // Priority level ID (Long)
  typeId: number;              // Defect type ID (Long)
  assigntoId?: number |null;  // User ID to assign the defect to (Varchar/String) - Optional for now
  attachment?: string;          // Defect related attachment (Optional)
  assignbyId?: number |null;  // User ID who entered the defect (Optional)
  releaseTestCaseId?: string | null; // testcaseId allocated to release (Optional)
  defectStatusId?: number | null;    // Defect status level ID (Optional)
  steps?: string;              // Steps to reproduce the defect(1-1000) (Optional)
  projectId: string | number;  // Project ID the defect belongs to (Varchar/String)
  modulesId: string | number;  // Module level Id (Varchar/String) - Note: API uses 'modulesId' not 'moduleId'
  subModuleId?: string | number | null; // Submodule Level Id (Optional)
  reOpenCount?: number;        // Optional field from sample
}

export interface DefectCreateProps {
  message: string;
  data: DefectCreate[];
  status: string;
  statusCode: number;
}

export const addDefects = (payload: DefectCreate): Promise<DefectCreateProps> => {


  return axios
    .post<DefectCreateProps>(`${BASE_URL}defect/withoutReleaseTestCaseId`, payload)
    .then(({ data }) => {
      return data;
    })
    .catch((error) => {
      console.error('API call failed:', error);
      throw error;
    });
};
