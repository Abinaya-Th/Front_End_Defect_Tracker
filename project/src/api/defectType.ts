import apiClient from "./apiClient";

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
    try {
        const response = await apiClient.post<CreateDefectTypeResponse>('/defectType', payload);
        return response.data;
    } catch (error) {
        console.error('Error creating defect type:', error);
        throw error;
    }
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
    try {
        const response = await apiClient.get<GetDefectTypesResponse>('/defectType');
        return response.data;
    } catch (error) {
        console.error('Error fetching defect types:', error);
        throw error;
    }
};

// --- Get Defect Type by ID ---

export interface GetDefectTypeByIdResponse {
    status: string;
    message: string;
    statusCode: number;
    data: ApiDefectType;
}

export const getDefectTypeById = async (id: string): Promise<GetDefectTypeByIdResponse> => {
    try {
        const response = await apiClient.get<GetDefectTypeByIdResponse>(`/defectType/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching defect type with id ${id}:`, error);
        throw error;
    }
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
    try {
        const response = await apiClient.put<UpdateDefectTypeResponse>(`/defectType/${id}`, payload);
        return response.data;
    } catch (error) {
        console.error(`Error updating defect type with id ${id}:`, error);
        throw error;
    }
};

// --- Delete Defect Type ---

export interface DeleteDefectTypeResponse {
    status: string;
    message: string;
    statusCode: number;
}

export const deleteDefectType = async (id: string): Promise<DeleteDefectTypeResponse> => {
    try {
        const response = await apiClient.delete<DeleteDefectTypeResponse>(`/defectType/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error deleting defect type with id ${id}:`, error);
        throw error;
    }
}; 