import axios from "axios";

const BASE_URL = import.meta.env.VITE_BASE_URL;

export async function updateRoleById(Id: string | number, roleName: string) {
  try {
    const response = await axios.put(`${BASE_URL}role/${Id}`, { roleName });
    return response.data;
  } catch (error: any) {
    throw error;
  }
}
