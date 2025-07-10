import axios from 'axios';

const BASE_URL = import.meta.env.VITE_BASE_URL;

export async function updateDefectById(defectId: string | number, payload: any) {
  const response = await axios.put(`${BASE_URL}defect/${defectId}`, payload);
  return response.data;
} 