import axios from "axios";

const BASE_URL = import.meta.env.VITE_BASE_URL;

export async function updateTestCase(id: string | number, payload: Record<string, any>) {
  const url = `${BASE_URL}testcase/${id}`;
  const response = await axios.put(url, payload, {
    headers: { "Content-Type": "application/json" },
  });
  return response.data;
} 