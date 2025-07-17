import axios from 'axios';

const BASE_URL = import.meta.env.VITE_BASE_URL;

// Fetch defect and remark ratio data for a given project
export async function getDefectRemarkRatioByProjectId(projectId: string) {
  const url = `${BASE_URL}dashboard/defect-remark-ratio?projectId=${projectId}`;
  const response = await axios.get(url);
  return response.data;
}
