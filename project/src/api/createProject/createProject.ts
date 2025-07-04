import axios from 'axios';
import { ProjectFormData } from '../../types';

const API_URL = 'http://34.57.197.188:8087/v1/projects';

export async function createProject(projectData: ProjectFormData) {
    try {
        // Map frontend form data to backend expected fields
        const payload = {
            projectName: projectData.name,
            projectId: projectData.prefix && projectData.prefix.trim() !== '' ? projectData.prefix : `PRJ-${Date.now()}`,
            description: projectData.description,
            startDate: projectData.startDate ? new Date(projectData.startDate).toISOString() : null,
            endDate: projectData.endDate ? new Date(projectData.endDate).toISOString() : null,
            clientName: projectData.clientName,
            country: projectData.clientCountry,
            state: projectData.clientState,
            email: projectData.clientEmail,
            phoneNo: projectData.clientPhone,
            userId: 2, // Dummy userId for now
        };
        console.log('Payload being sent to backend:', payload);
        const response = await axios.post(API_URL, payload);
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Failed to create project');
    }
}
