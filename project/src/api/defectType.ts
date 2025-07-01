import axios from "axios";
const BASE_URL = import.meta.env.VITE_BASE_URL;

// --- Create Defect Type ---

export interface CreateDefectTypePayload {
    defectTypeName: string;
}

export interface CreateDefectTypeResponse {
    status: string;
    message: string;
    statusCode: number;
    data: {
        id: number;
        defectTypeName: string;
    };
}

export const createDefectType = async (payload: CreateDefectTypePayload): Promise<CreateDefectTypeResponse> => {
    const response = await axios.post<CreateDefectTypeResponse>(`${BASE_URL}defectType`, payload);
    return response.data;
};

// --- Get All Defect Types ---

export interface ApiDefectType {
    id: number;
    defectTypeName: string;
    description: string;
    category: 'functional' | 'performance' | 'security' | 'usability' | 'compatibility' | 'other';
    severity: 'low' | 'medium' | 'high' | 'critical';
    priority: 'low' | 'medium' | 'high' | 'critical';
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface GetDefectTypesResponse {
    status: string;
    message: string;
    statusCode: number;
    data: ApiDefectType[];
}

export const getDefectTypes = async (): Promise<GetDefectTypesResponse> => {
    const response = await axios.get<GetDefectTypesResponse>(`${BASE_URL}defectType`);
    return response.data;
};

// --- Get Defect Type by ID ---

export interface GetDefectTypeByIdResponse {
    status: string;
    message: string;
    statusCode: number;
    data: ApiDefectType;
}

export const getDefectTypeById = async (id: string): Promise<GetDefectTypeByIdResponse> => {
    const response = await axios.get<GetDefectTypeByIdResponse>(`${BASE_URL}defectType/${id}`);
    return response.data;
};

// --- Update Defect Type ---

export interface UpdateDefectTypePayload {
    defectTypeName: string;
    // Assuming other fields might be updatable as well, based on the form
    description: string;
    category: 'functional' | 'performance' | 'security' | 'usability' | 'compatibility' | 'other';
    severity: 'low' | 'medium' | 'high' | 'critical';
    priority: 'low' | 'medium' | 'high' | 'critical';
    isActive: boolean;
}

export interface UpdateDefectTypeResponse {
    status: string;
    message: string;
    statusCode: number;
    data: {
        id: number;
        defectTypeName: string;
    };
}

export const updateDefectType = async (id: string, payload: UpdateDefectTypePayload): Promise<UpdateDefectTypeResponse> => {
    const response = await axios.put<UpdateDefectTypeResponse>(`${BASE_URL}defectType/${id}`, payload);
    return response.data;
};

// --- Delete Defect Type ---

export interface DeleteDefectTypeResponse {
    status: string;
    message: string;
    statusCode: number;
}

export const deleteDefectType = async (id: string): Promise<DeleteDefectTypeResponse> => {
    const response = await axios.delete<DeleteDefectTypeResponse>(`${BASE_URL}defectType/${id}`);
    return response.data;
}; 