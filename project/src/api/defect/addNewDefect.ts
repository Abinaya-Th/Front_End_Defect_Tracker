import axios from "axios";

const BASE_URL = import.meta.env.VITE_BASE_URL;
export interface DefectCreate {
  description: string;
  severityId: number;
  priorityId: number;
  typeId: number;
  assignToId: string;
  attachment: string;
  assignById?: string;
  releaseTestcaseId?: string;
  defectStatusId?: number;
  steps?: string;
  projectId: string;
  moduleId: string;
  subModuleId?: string;
  releaseId?: number;

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
        .then(({ data }) => data);
};
