import axios from 'axios';

const API_URL = 'http://34.57.197.188:8087/api/v1/role';

export async function getRoleById(Id: string | number) {
  try {
    const response = await axios.get(`${API_URL}/${Id}`);
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error.message;
  }
}

export async function getAllRoles() {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error.message;
  }
}
