import axios from 'axios';

const API_URL = 'http://34.57.197.188:8087/api/v1/role';

export async function updateRoleById(Id: string | number, roleName: string) {
  try {
    const response = await axios.put(`${API_URL}/${Id}`, { roleName });
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error.message;
  }
}
