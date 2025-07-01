import axios from "axios";

const BASE_URL = import.meta.env.VITE_BASE_URL;

export async function getRoleById(Id: string | number) {
  try {
    const response = await axios.get(`${BASE_URL}role/${Id}`);
    return response.data;
  } catch (error: any) {
    throw error;
  }
}

export async function getAllRoles() {
  try {
    const response = await axios.get(`${BASE_URL}role`);
    return response.data;
  } catch (error: any) {
    throw error;
  }
}
