import axios from "axios";

const BASE_URL = import.meta.env.VITE_BASE_URL;

export async function deleteRoleById(Id: string | number) {
  try {
    const response = await axios.delete(`${BASE_URL}role/${Id}`);
    return response.data;
  } catch (error: any) {
    throw error;
  }
}
