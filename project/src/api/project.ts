import axios from "axios";

//const BASE_URL = "http://192.168.1.112:8088/api/v1/projects";
const BASE_URL = import.meta.env.VITE_BASE_URL;

export interface CreateProjectPayload {
  projectName: string;
  startDate: string;
  endDate: string;
  userId: string;
  description: string;
  clientName: string;
  country: string;
  state: string;
  email: string;
  phoneNo: string;
}

export async function createProject(payload: CreateProjectPayload) {
  return axios.post(`${BASE_URL}/projects`, payload); 
  console.log(BASE_URL);
} 