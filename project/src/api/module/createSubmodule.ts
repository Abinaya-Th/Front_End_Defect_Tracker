import axios from "axios";

export const createSubmodule = async (payload: { subModuleName: string; moduleId: number }) => {
  try {
    const response = await axios.post("http://34.57.197.188:8087/api/v1/subModule", payload);
    return response.data;
  } catch (error) {
    throw error;
  }
}; 