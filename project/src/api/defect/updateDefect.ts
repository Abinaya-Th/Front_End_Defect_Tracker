import axios from 'axios';

// New: Accept testCaseId and releasesId as arguments, and use them as query params
export async function updateDefectById(defectId: number, payload: any) {
  const url = `http://34.171.115.156:8087/api/v1/defect/updateById/${defectId}`;
  const response = await axios.put(url, payload, {
    headers: { 'Content-Type': 'application/json' },
  });
  return response.data;
} 