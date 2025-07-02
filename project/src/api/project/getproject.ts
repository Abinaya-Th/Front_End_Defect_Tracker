import axios from "axios";
import { ProjectFormData } from "../../types";
import { BackendProject } from "../../types/index";

const baseUrl = import.meta.env.VITE_BASE_URL || "http://34.57.197.188:8087/api/v1/";

export interface CreateProjectRequest {
    projectName: string;
    description: string;
    startDate: string;
    endDate: string;
    clientName: string;
    country: string;
    state: string;
    email: string;
    phoneNo: string;
    userId?: number; // Optional, will be set from auth context
}

export interface CreateProjectResponse {
    status: string;
    message: string;
    data: {
        id: number;
        projectId: string;
        projectName: string;
        description: string;
        startDate: string;
        endDate: string;
        clientName: string;
        country: string;
        state: string;
        email: string;
        phoneNo: string;
        userId: number;
        userFirstName: string;
        userLastName: string;
    };
    statusCode: number;
}

export const createProject = async (projectData: CreateProjectRequest): Promise<CreateProjectResponse> => {
    try {
        // Add default userId if not provided (you can get this from auth context later)
        const dataWithUserId = {
            ...projectData,
            userId: projectData.userId || 1 // Default to user ID 1 for now
        };

        const response = await axios.post<CreateProjectResponse>(`${baseUrl}projects`, dataWithUserId, {
            headers: {
                'Content-Type': 'application/json',
            },
        });
        return response.data;
    } catch (error: any) {
        console.error('Error creating project:', error);
        if (error.response?.data?.message) {
            throw new Error(error.response.data.message);
        } else if (error.response?.status === 400) {
            throw new Error('Invalid project data. Please check all required fields.');
        } else if (error.response?.status === 500) {
            throw new Error('Server error. Please try again later.');
        } else {
            throw new Error('Failed to create project. Please check your connection and try again.');
        }
    }
};

export const getAllProjects = async (): Promise<{ data: BackendProject[] }> => {
    try {
        const response = await axios.get(`${baseUrl}projects`);
        return response.data;
    } catch (error: any) {
        console.error('Error fetching projects:', error);
        throw new Error(error.response?.data?.message || 'Failed to fetch projects');
    }
};
