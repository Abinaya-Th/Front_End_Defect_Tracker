import apiClient from "../apiClient";

export async function getRoleById(Id: string | number) {
  try {
    const response = await apiClient.get(`role/${Id}`);
    return response.data;
  } catch (error: any) {
    throw error;
  }
}

export async function getAllRoles() {
  try {
    const response = await apiClient.get("role");
    return response.data;
  } catch (error: any) {
    throw error;
  }
}
