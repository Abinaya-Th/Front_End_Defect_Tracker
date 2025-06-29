import apiClient, { BASE_URL } from "../api/apiClient";

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

  const response = await apiClient.get(`/defect/filter`, { params, headers: { "Content-Type": "application/json" } });
  const data = response.data.data; // This is an array
  console.log(response);

  const defectsArray = Array.isArray(data) ? data : data ? [data] : [];
  return defectsArray.map((d: any) => ({
    defectId: d.defectId,
    defectTitle: d.descriptions, // No title field, using descriptions
    descriptions: d.descriptions,
    testCaseId: d.testCaseId,
    severity: d.severity?.toLowerCase() || "",
    priority: d.priority?.toLowerCase() || "",
    type: d.type,
    assignby: d.assignBy,
    assignTo: d.assignTo,
    project: d.project,
    status: d.status?.toLowerCase() || "",
    reopenCount: d.reopenCount,
    Attachment: d.attachment,
    steps: d.steps,
    Releasetestcase: d.releaseTestCase,
  }));
};
