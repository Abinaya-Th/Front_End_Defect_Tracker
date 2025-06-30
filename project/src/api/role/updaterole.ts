import apiClient from "../apiClient";

export async function updateRoleById(Id: string | number, roleName: string) {
  try {
    const response = await apiClient.put(`role/${Id}`, { roleName });
    return response.data;
  } catch (error: any) {
    throw error;
  }
}
