import axios from 'axios';

const BASE_URL = import.meta.env.VITE_BASE_URL;

// New: Accept testCaseId and releasesId as arguments, and use them as query params
export async function updateDefectById(defectId: number, payload: any, testCaseId:number, releasesId: number) {
  // Compose the new endpoint with query params
  const url = `${BASE_URL}defect/updateById/${defectId}?testCaseId=${testCaseId}&releasesId=${releasesId}`;
  const response = await axios.put(url, payload, {
    headers: { 'Content-Type': 'application/json' },
  });
  return response.data;
} 