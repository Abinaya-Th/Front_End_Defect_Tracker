import axios from 'axios';
import { Employee } from '../../types/index';

const API_BASE_URL = import.meta.env.VITE_BASE_URL;

export interface BenchSearchParams {
  startDate?: string;
  endDate?: string;
  designation?: string;
  firstName?: string;
  lastName?: string;
  availability?: number;
}

export const searchBenchEmployees = async (params: BenchSearchParams): Promise<Employee[]> => {
  try {
    const queryParams = new URLSearchParams();

    // Add parameters to query string if they exist
    if (params.startDate) {
      queryParams.append('startDate', params.startDate);
    }
    if (params.endDate) {
      queryParams.append('endDate', params.endDate);
    }
    if (params.designation) {
      queryParams.append('designation', params.designation);
    }
    if (params.firstName) {
      queryParams.append('firstName', params.firstName);
    }
    if (params.lastName) {
      queryParams.append('lastName', params.lastName);
    }
    if (params.availability) {
      queryParams.append('availability', params.availability.toString());
    }

    const url = `${API_BASE_URL}/bench/search${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    const response = await axios.get(url);

    console.log('Raw API response:', response.data);

    // Map backend fields to Employee type (same as bench.ts)
    const data = response.data.data || response.data || [];
    console.log('Mapped data:', data);
    return data.map((item: any) => {
      const [firstName, ...rest] = (item.fullName || '').split(' ');
      const lastName = rest.join(' ');
      return {
        id: String(item.userId),
        firstName: firstName || '',
        lastName: lastName || '',
        email: '', // Not provided by backend
        phone: '', // Not provided by backend
        designation: item.designation || '',
        experience: 0, // Not provided by backend
        joinedDate: item.availablePeriods || '', // Use availablePeriods for display
        skills: [], // Not provided by backend
        currentProjects: item.currentProjectName ? [item.currentProjectName] : [],
        availability: item.availability || 0,
        status: 'active', // Default value
        department: '', // Not provided by backend
        manager: '', // Not provided by backend
        startDate: '', // Not provided by backend
        endDate: '', // Not provided by backend
        createdAt: '',
        updatedAt: '',
      };
    });
  } catch (error) {
    console.error('Error searching bench employees:', error);
    throw error;
  }
};

// Individual search functions for specific filters
export const searchByStartDate = async (startDate: string): Promise<Employee[]> => {
  return searchBenchEmployees({ startDate });
};

export const searchByDesignation = async (designation: string): Promise<Employee[]> => {
  return searchBenchEmployees({ designation });
};

export const searchByFirstName = async (firstName: string): Promise<Employee[]> => {
  return searchBenchEmployees({ firstName });
};

export const searchByAvailability = async (availability: number): Promise<Employee[]> => {
  return searchBenchEmployees({ availability });
};
