import apiClient from "../apiClient";

export async function deleteRoleById(Id: string | number) {
  try {
    const response = await apiClient.delete(`role/${Id}`);
    return response.data;
  } catch (error: any) {
    throw error;
  }
}
