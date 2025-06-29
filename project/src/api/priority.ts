import apiClient from "./apiClient";

export interface Priority{
  id: number;
  priority: string;
  color: string;
}

export interface GetPrioritiesResponse{
  status: string ;
  message: string ;
  data:Priority[] ;
}

export const getAllPriorities = async(): Promise<GetPrioritiesResponse> =>{
  const response = await apiClient.get<GetPrioritiesResponse>("priority");
  return response.data;
};

export const updatePriority = async(id: number, data:{priority: string; color: string})=>{
  const response = await apiClient.put(`priority/${id}`, data);
  return response.data;
};

export const deletePriority = async(id: number)=>{
  const response = await apiClient.delete(`priority/${id}`);
  return response.data;
};

export const createPriority = async (data: { priority: string; color: string }) => {
  const response = await apiClient.post("priority", data);
  return response.data;
}