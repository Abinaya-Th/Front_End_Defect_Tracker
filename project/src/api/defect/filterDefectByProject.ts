import axios from 'axios';

const baseUrl = import.meta.env.VITE_BASE_URL;

export interface FilteredDefect {
  defectId: string;
  description: string;
  projectId: number;
  severityId: number;
  priorityId: number;
  defectStatusId: number;
  typeId: number;
  id: string | null;
  reOpenCount: number;
  attachment: string | null;
  steps: string;
  subModuleId: number;
  releaseTestCaseId: number | null;
  assignbyId: number;
  assigntoId: number;
  moduleId: number;
}

/**
 * Fetches defects filtered by projectId and optional filters from the backend API.
 * @param filters An object with projectId (mandatory) and optional typeId, severityId, priorityId, defectStatusId, releaseTestCaseId.
 * @returns Promise<FilteredDefect[]>
 */
export async function filterDefects(filters: {
  projectId: string | number;
  typeId?: number;
  severityId?: number;
  priorityId?: number;
  defectStatusId?: number;
  releaseTestCaseId?: number;
}): Promise<FilteredDefect[]> {
  const params: any = { projectId: filters.projectId };
  if (filters.typeId) params.typeId = filters.typeId;
  if (filters.severityId) params.severityId = filters.severityId;
  if (filters.priorityId) params.priorityId = filters.priorityId;
  if (filters.defectStatusId) params.defectstatusId = filters.defectStatusId;
  if (filters.releaseTestCaseId) params.ReleaseTestCaseId = filters.releaseTestCaseId;
  const response = await axios.get(`${baseUrl}defect/filter`, {
    params,
    headers: { 'Content-Type': 'application/json' },
  });
  if (response.data && Array.isArray(response.data.data)) {
    return response.data.data;
  }
  return [];
} 