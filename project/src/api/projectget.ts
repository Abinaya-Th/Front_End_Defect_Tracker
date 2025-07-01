import axios from "axios";
import { Project } from "../types";
const  baseUrl = import.meta.env.VITE_BASE_URL 


export const getAllProjects = async (): Promise<Project[]> => {
  const response = await axios.get<Project[]>(`${baseUrl}projects`);
  return response.data;
};
