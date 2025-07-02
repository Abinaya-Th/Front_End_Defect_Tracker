import axios from "axios";

const BASE_URL = import.meta.env.VITE_BASE_URL;

export interface CreateRolePayload {
  roleName: string;
}

export async function createRole(payload: CreateRolePayload) {
  try {
    const response = await axios.post(`${BASE_URL}role`, payload);
    return response.data;
  } catch (error: any) {
    throw error;
  }
}
//integrated