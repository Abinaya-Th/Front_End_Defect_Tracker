import axios from 'axios';

// New: Accept testCaseId and releasesId as arguments, and use them as query params
export async function updateDefectById(defectId: number, payload: any) {
  const url = `http://192.168.1.107:8080/api/v1/defect/updateById/${defectId}`;
  const response = await axios.put(url, payload, {
    headers: { 'Content-Type': 'application/json' },
  });
  return response.data;
} 