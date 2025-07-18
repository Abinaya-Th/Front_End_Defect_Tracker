import axios from 'axios';

const BASE_URL = import.meta.env.VITE_BASE_URL;

export interface DefectHistoryEntry {
  defectId: number;
  assignedByName: string;
  assignedToName: string;
  defectDate: string;
  defectTime: string;
  previousStatus: string;
  defectStatus: string;
  releaseName: string;
}

export async function getDefectHistoryByDefectId(defectId: number): Promise<DefectHistoryEntry[]> {
  try {
    const url = `${BASE_URL}defecthistory/${defectId}`;
    const response = await axios.get(url);
    if (response.data && Array.isArray(response.data.data)) {
      return response.data.data;
    }
    return [];
  } catch (err) {
    return [];
  }
} 