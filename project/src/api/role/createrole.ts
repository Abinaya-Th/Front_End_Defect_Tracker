import axios from 'axios';

const API_URL = 'http://34.57.197.188:8087/api/v1/role';

export interface CreateRolePayload {
  roleName: string;
}

export async function createRole(payload: CreateRolePayload) {
  try {
    const response = await axios.post(API_URL, payload);
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error.message;
  }
}
