import apiClient from "../apiClient";

export interface CreateRolePayload {
  roleName: string;
}

export async function createRole(payload: CreateRolePayload) {
  try {
    const response = await apiClient.post("role", payload);
    return response.data;
  } catch (error: any) {
    throw error;
  }
}
