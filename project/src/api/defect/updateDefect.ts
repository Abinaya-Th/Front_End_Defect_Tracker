import axios from 'axios';

const BASE_URL = 'http://34.57.197.188:8087/api/v1/defect/';

export async function updateDefectById(defectId: string | number, payload: any) {
  const response = await axios.put(`${BASE_URL}${defectId}`, payload);
  return response.data;
} 