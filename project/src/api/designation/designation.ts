
import axios from "axios";

const BASE_URL = import.meta.env.VITE_BASE_URL;
export interface Designations {
    id: number;
    name: string;
}
export interface DesignationGetResponse {
    message: string;
    data: Designations[];
    status: string;
    statusCode: string;
}

export const getDesignations = (): Promise<DesignationGetResponse> => {
    return axios
        .get<DesignationGetResponse>(`${BASE_URL}designation`)
        .then(({ data }) => data);
};

export const deleteDesignation = (id: number): Promise<DesignationGetResponse> => {
    return axios
        .delete<DesignationGetResponse>(`${BASE_URL}designation/${id}`)
        .then(({ data }) => data);
};

export const putDesignation = (id: number,data: Partial<Designations>) => {
    return axios
        .put<DesignationGetResponse>(`${BASE_URL}designation/${id}`, {
            ...data
        })
        .then(({ data }) => data);
};