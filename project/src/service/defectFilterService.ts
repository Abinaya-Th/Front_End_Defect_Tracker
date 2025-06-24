import axios from "axios";

const BASE_URL = "http://localhost:8080/api/v1/defect";

export interface DefectFilterParams {
  projectId?: string;
  statusId?: string;
  severityId?: string;
  priorityId?: string;
  typeId?: string;
}

export interface Defect {
  defectId: number;
  defectTitle: string;
  descriptions: string;
  testCaseId: string;
  severity: string;
  priority: string;
  type: string;
  assignby: string;
  assignTo: string;
  project: string;
  status: string;
  reopenCount: number;
  Attachment: string | null;
  steps: string;
  Releasetestcase: string;
}

export const defectFilterService = async (filters: DefectFilterParams): Promise<Defect[]> => {
  if (!filters.projectId) {
    throw new Error("projectId is required");
  }
  const params: any = { projectId: filters.projectId };
  if (filters.statusId) params.statusId = filters.statusId;
  if (filters.severityId) params.severityId = filters.severityId;
  if (filters.priorityId) params.priorityId = filters.priorityId;
  if (filters.typeId) params.typeId = filters.typeId;

  const response = await axios.get(`${BASE_URL}/filter`, { params, headers: { "Content-Type": "application/json" } });
  const data = response.data.data;
  // Handle both array and single object response
  const defectsArray = Array.isArray(data) ? data : data ? [data] : [];
  return defectsArray.map((d: any) => ({
    defectId: d.defectId,
    defectTitle: d.defectTitle,
    descriptions: d.descriptions,
    testCaseId: d.testCaseId,
    severity: d.severity,
    priority: d.priority,
    type: d.type,
    assignby: d.assignby,
    assignTo: d.assignTo,
    project: d.project,
    status: d.status,
    reopenCount: d.reopenCount,
    Attachment: d.Attachment,
    steps: d.steps,
    Releasetestcase: d.Releasetestcase,
  }));
};
